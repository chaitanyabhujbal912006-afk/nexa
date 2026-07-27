"""
FastAPI REST server for Nexa Knowledge Agent.
Exposes RAG retrieval, conflict detection, and document ingestion via API endpoints.

Run: uvicorn api:app --reload --port 8000
"""

import os
import glob
import subprocess
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from rag_engine import retrieve, detect_conflicts, generate_answer
from app import get_llm_fn, get_active_provider

app = FastAPI(
    title="Nexa Intelligence Engine API",
    description="Enterprise conflict-aware RAG system API",
    version="2.0.0"
)

# Enable CORS for web and mobile frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    query: str
    top_k: Optional[int] = 5


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


@app.get("/api/v1/health", response_model=HealthResponse)
def health_check():
    base_dir = os.path.dirname(__file__)
    pdf_count = len(glob.glob(os.path.join(base_dir, "data", "pdf_src", "*.pdf")))
    sheet_count = len(glob.glob(os.path.join(base_dir, "data", "*.xlsx")))
    email_count = len(glob.glob(os.path.join(base_dir, "data", "emails", "*.*")))
    
    return HealthResponse(
        status="online",
        provider=get_active_provider(),
        total_pdfs=pdf_count,
        total_sheets=sheet_count,
        total_emails=email_count
    )


@app.post("/api/v1/query", response_model=QueryResponse)
def query_knowledge_base(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
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
            provider=get_active_provider()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/ingest")
def trigger_ingestion():
    try:
        cmd = ["python", "ingest.py"]
        res = subprocess.run(cmd, cwd=os.path.dirname(__file__), capture_output=True, text=True)
        if res.returncode != 0:
            raise HTTPException(status_code=500, detail=res.stderr)
        return {"status": "success", "output": res.stdout.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
