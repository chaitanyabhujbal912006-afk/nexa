# ⚡ Nexa — Knowledge Agent Engine (`kb-agent`)

This directory contains the full production stack for the **Nexa Intelligence Engine v2.0**.

---

## 🏢 Real-World Use Case

Nexa solves the common SME problem of conflicting business documents (e.g., old email quotes vs. new policy PDFs). When a user asks a question spanning multiple sources:

1. **Semantic Search** — Finds relevant chunks across PDFs, Excel workbooks, CSV files, and email threads using `all-MiniLM-L6-v2` embeddings stored in ChromaDB.
2. **Conflict Resolution** — Detects policy contradictions, prioritizes the source with the latest effective date, and explains why older terms are superseded.
3. **Cited LLM Answer** — Outputs a verified answer with bracketed citations with source, type, section, and match-score percentage.
4. **Audit Trail** — Logs every turn to `data/audit_log.jsonl` with UTC timestamps, call IDs, latency, and provider metadata.

---

## 🔧 Backend Technology Stack

| Layer | Technology |
|---|---|
| **REST API** | FastAPI 0.111+ (async, lifespan context, OpenAPI docs) |
| **ASGI Server** | Uvicorn [standard] with Gunicorn worker support |
| **Rate Limiting** | SlowAPI (per-IP, configurable via env) |
| **Validation** | Pydantic v2 (strict field validators, RFC-7807 error envelopes) |
| **Embeddings** | `sentence-transformers` — `all-MiniLM-L6-v2` (pre-warmed on startup) |
| **Vector Store** | ChromaDB `PersistentClient` (cosine similarity, HNSW index) |
| **Document Parsing** | PyPDF + OCR fallback (pytesseract), openpyxl / pandas (Excel + CSV), Python `email` module (.eml) |
| **LLM** | Gemini / OpenAI / Anthropic (pluggable via `llm_config.py`) |
| **Audit Logger** | Thread-safe append-only JSONL with log rotation, UUID4 call IDs, exponential-backoff webhooks |
| **Auth** | X-API-Key header (optional; open dev mode if `NEXA_API_KEY` unset) |
| **Tracing** | `X-Request-ID` middleware — echoed on all responses |
| **Frontend** | Streamlit (WCAG 2.1 AA/AAA glassmorphism UI) |

---

## 📡 REST API Endpoints

Base URL: `http://localhost:8000`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | ❌ Public | Live health check, provider, KB stats |
| `GET` | `/api/v1/stats` | ✅ | ChromaDB chunk counts + breakdown by type |
| `POST` | `/api/v1/query` | ✅ | AI-powered cited Q&A with conflict detection |
| `POST` | `/api/v1/ingest` | ✅ | Full in-process re-ingestion (thread-locked, 429 if busy) |
| `POST` | `/api/v1/upload` | ✅ | Upload a file (PDF/Excel/CSV/TXT/EML) + auto re-ingest |
| `GET` | `/api/v1/documents` | ✅ | List all indexed docs with type, size, chunk count |
| `DELETE` | `/api/v1/documents/{name}` | ✅ | Remove doc from disk + purge vector embeddings |
| `GET` | `/api/v1/conflicts` | ✅ | Proactive full-corpus policy conflict scan |
| `GET` | `/api/v1/audit` | ✅ | Read recent audit log entries (newest-first, max 200) |
| `GET` | `/docs` | ❌ | Interactive OpenAPI Swagger UI |
| `GET` | `/redoc` | ❌ | ReDoc API reference |

### Query Request Example
```json
POST /api/v1/query
{
  "query": "What is the current annual leave entitlement?",
  "top_k": 5,
  "history": [
    {"role": "user", "content": "What policies changed in 2024?"},
    {"role": "assistant", "content": "The leave policy was updated..."}
  ]
}
```

### Query Response (v2 schema)
```json
{
  "call_id": "550e8400-e29b-41d4-a716-446655440000",
  "query": "What is the current annual leave entitlement?",
  "answer": "Employees receive 20 days of annual leave per year...",
  "confidence_level": "HIGH",
  "conflicts_detected": [],
  "citations": [
    {
      "source_name": "hr_policy_v2.pdf",
      "source_type": "pdf",
      "doc_date": "2024-06-01",
      "section": "Section 4",
      "citation": "hr_policy_v2.pdf (pdf) — Section 4, dated 2024-06-01",
      "match_score_pct": 87.3
    }
  ],
  "total_chunks_retrieved": 5,
  "provider": "gemini",
  "latency_ms": 423.87
}
```

---

## 🚀 Running the Stack

```bash
# Install dependencies
pip install -r requirements.txt

# Ingest documents
python ingest.py

# Start Streamlit UI
streamlit run app.py

# Start FastAPI backend (development)
uvicorn api:app --reload --port 8000

# Start FastAPI backend (production, 2 workers)
uvicorn api:app --workers 2 --port 8000
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXA_API_KEY` | _(unset = open mode)_ | API key for X-API-Key header auth |
| `NEXA_ALLOWED_ORIGINS` | `http://localhost:8501,http://localhost:3000` | Comma-separated CORS origins |
| `NEXA_WEBHOOK_URL` | _(unset)_ | Webhook URL for conflict/flagged audit events |
| `RATE_LIMIT_QUERY` | `60/minute` | SlowAPI rate limit for `/query` endpoint |
| `RATE_LIMIT_INGEST` | `5/minute` | SlowAPI rate limit for `/ingest` and `/upload` |
| `AUDIT_MAX_BYTES` | `10485760` (10 MB) | Rotate audit log after this size |

---

## 📁 Directory Structure

```
kb-agent/
├── api.py              # FastAPI backend v2 (async, rate-limited, traced)
├── app.py              # Streamlit frontend (WCAG 2.1 AA/AAA accessible)
├── ingest.py           # Multi-format document ingestion pipeline
├── rag_engine.py       # Retrieval + conflict detection + LLM generation
├── audit.py            # Thread-safe audit logger with log rotation
├── llm_config.py       # Pluggable LLM provider configuration
├── requirements.txt    # Pinned production dependencies
├── data/
│   ├── pdf_src/        # PDF documents
│   ├── emails/         # .txt and .eml email files
│   ├── *.xlsx          # Excel workbooks
│   ├── *.csv           # CSV datasets
│   └── audit_log.jsonl # Append-only Q&A audit trail
├── chroma_db/          # ChromaDB vector index (auto-created)
└── tests/
    ├── test_api.py               # API endpoint smoke tests
    ├── test_api_backend.py       # Full integration tests (30 cases, mocked)
    ├── test_ingest_dates.py      # Date normalization tests (15+ formats)
    ├── test_rag_engine.py        # Retrieval + conflict engine unit tests
    └── test_real_world_cases.py  # Real-world benchmark test cases
```

---

## 🧪 Running Tests

```bash
pytest tests/
# 68+ tests across 5 test files ✅
```

---

## 📱 Mobile App Access

Nexa is 100% mobile-responsive. Users can add it to their iPhone (Safari) or Android (Chrome) home screen via **Add to Home Screen** to use it as a native full-screen mobile web app.
