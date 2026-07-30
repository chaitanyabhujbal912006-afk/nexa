"""
FastAPI REST server for Nexa Knowledge Agent.
Security-hardened: API key auth, safe CORS, clamped inputs, no error leakage, ingestion lock.

Run: uvicorn api:app --reload --port 8000
"""

import os
import glob
import subprocess
import threading
import logging
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware

from rag_engine import retrieve, detect_conflicts, generate_answer, scan_all_conflicts
from llm_config import load_secrets, get_llm_fn, get_active_provider

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexa-api")

# ── Load secrets on startup ───────────────────────────────────────────────────
load_secrets()

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Nexa Intelligence Engine API",
    description="Enterprise conflict-aware RAG system API",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — explicit origins only ──────────────────────────────────────────────
_ALLOWED_ORIGINS = os.environ.get(
    "NEXA_ALLOWED_ORIGINS", "http://localhost:8501,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _ALLOWED_ORIGINS],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# ── Ingestion lock (prevent concurrent subprocess runs) ───────────────────────
_ingest_lock = threading.Lock()

# ── Auth dependency ───────────────────────────────────────────────────────────
_NEXA_API_KEY = os.environ.get("NEXA_API_KEY", "")


def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    """Require X-API-Key header if NEXA_API_KEY env var is set."""
    if not _NEXA_API_KEY:
        return  # No key configured — open mode (dev/demo)
    if x_api_key != _NEXA_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")


# ── Pydantic Models ───────────────────────────────────────────────────────────
class CitationModel(BaseModel):
    citation: str
    source_name: str
    source_type: str
    doc_date: str


class ConflictModel(BaseModel):
    topic: str
    trusted_source: str
    outdated_sources: List[str]


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    top_k: int = Field(5, ge=1, le=20)

    @field_validator("query")
    @classmethod
    def strip_query(cls, v):
        stripped = v.strip()
        if not stripped:
            raise ValueError("Query cannot be empty.")
        return stripped


class QueryResponse(BaseModel):
    query: str
    answer: str
    conflicts_detected: List[ConflictModel]
    citations: List[CitationModel]
    provider: str


class HealthResponse(BaseModel):
    status: str
    provider: str
    total_pdfs: int
    total_sheets: int
    total_emails: int


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    """Public health check — no auth required."""
    base_dir = os.path.dirname(__file__)
    return HealthResponse(
        status="online",
        provider=get_active_provider(),
        total_pdfs=len(glob.glob(os.path.join(base_dir, "data", "pdf_src", "*.pdf"))),
        total_sheets=len(glob.glob(os.path.join(base_dir, "data", "*.xlsx"))),
        total_emails=len(glob.glob(os.path.join(base_dir, "data", "emails", "*.*"))),
    )


@app.post("/api/v1/query", response_model=QueryResponse, dependencies=[Depends(require_api_key)])
def query_knowledge_base(req: QueryRequest):
    """Query the knowledge base. Requires X-API-Key header if NEXA_API_KEY is set."""
    try:
        hits = retrieve(req.query, top_k=req.top_k)
        conflicts = detect_conflicts(hits)
        answer, _ = generate_answer(req.query, hits, conflicts, llm_call_fn=get_llm_fn())

        citation_objs = [
            CitationModel(
                citation=h.citation,
                source_name=str(h.metadata.get("source_name", "unknown")),
                source_type=str(h.metadata.get("source_type", "unknown")),
                doc_date=str(h.metadata.get("doc_date", "unknown")),
            )
            for h in hits
        ]

        conflict_objs = [
            ConflictModel(
                topic=c["topic"],
                trusted_source=c["trusted"].citation,
                outdated_sources=[o.citation for o in c["outdated"]],
            )
            for c in conflicts
        ]

        return QueryResponse(
            query=req.query,
            answer=answer,
            conflicts_detected=conflict_objs,
            citations=citation_objs,
            provider=get_active_provider(),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Query error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error.")


@app.post("/api/v1/ingest", dependencies=[Depends(require_api_key)])
def trigger_ingestion():
    """Trigger document re-ingestion. Requires auth. Only one run at a time."""
    if not _ingest_lock.acquire(blocking=False):
        raise HTTPException(status_code=429, detail="Ingestion already running. Try again later.")
    try:
        ingest_path = os.path.join(os.path.dirname(__file__), "ingest.py")
        if not os.path.isfile(ingest_path):
            raise HTTPException(status_code=500, detail="Ingestion script not found.")
        res = subprocess.run(
            ["python", ingest_path],
            cwd=os.path.dirname(__file__),
            capture_output=True,
            text=True,
            timeout=300,
        )
        if res.returncode != 0:
            logger.error("Ingestion failed: %s", res.stderr)
            raise HTTPException(status_code=500, detail="Ingestion failed. Check server logs.")
        return {"status": "success", "message": "Re-ingestion complete."}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Ingestion error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error.")
    finally:
        _ingest_lock.release()


@app.get("/api/v1/documents", dependencies=[Depends(require_api_key)])
def list_documents():
    """List all ingested documents with metadata."""
    base_dir = os.path.dirname(__file__)
    data_dir = os.path.join(base_dir, "data")
    
    docs = []
    for path in glob.glob(os.path.join(data_dir, "pdf_src", "*.pdf")):
        docs.append({"name": os.path.basename(path), "type": "pdf", "size_bytes": os.path.getsize(path)})
    for path in glob.glob(os.path.join(data_dir, "*.xlsx")):
        docs.append({"name": os.path.basename(path), "type": "excel", "size_bytes": os.path.getsize(path)})
    for path in glob.glob(os.path.join(data_dir, "emails", "*.*")):
        docs.append({"name": os.path.basename(path), "type": "email", "size_bytes": os.path.getsize(path)})
        
    return {"total_count": len(docs), "documents": docs}


@app.get("/api/v1/conflicts", dependencies=[Depends(require_api_key)])
def get_all_policy_conflicts():
    """Performs a proactive full health audit across all indexed documents to return active policy conflicts."""
    try:
        conflicts = scan_all_conflicts()
        conflict_objs = [
            ConflictModel(
                topic=c["topic"],
                trusted_source=c["trusted"].citation,
                outdated_sources=[o.citation for o in c["outdated"]],
            )
            for c in conflicts
        ]
        return {"conflicts_count": len(conflict_objs), "conflicts": conflict_objs}
    except Exception as e:
        logger.exception("Conflict scan error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error.")
