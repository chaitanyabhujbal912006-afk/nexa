# ⚡ NEXA — Enterprise Knowledge Intelligence Engine

> **Next-Generation Conflict-Aware Graph-RAG Platform for SMEs & Enterprise Compliance**  
> *Unifies scattered knowledge across PDFs, Excel spreadsheets, emails, and contracts into a traceable, conflict-aware, AI-powered conversational engine.*

![Nexa Banner](https://img.shields.io/badge/Nexa-v3.0.0--Enterprise-7c3aed?style=for-the-badge&logo=lightning)
![License](https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-009688?style=for-the-badge&logo=fastapi)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Search-ff6600?style=for-the-badge)
![LLM](https://img.shields.io/badge/LLM-Gemini%202.0%20%7C%20Groq-ec4899?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-53%20Passed-34d399?style=for-the-badge)

---

## 🏢 The Problem It Solves

A customer support lead or compliance officer receives an urgent inquiry regarding a bulk order return for **Acme Corp**. Searching manually reveals an old email quote from November promising 45-day returns with $0 fee, while a December policy PDF specifies 15-day returns with a 10% fee. Searching manually leads to conflicting answers, legal disputes, and lost revenue.

**Nexa resolves this in milliseconds with temporal conflict arbitration:**

```text
⚠️ Temporal Conflict Detected on topic: "bulk_refund_policy"
  SUPERSEDED   email_2024-11-03_acme_refund.txt  ── Promised 45-day return, $0 fee (Dated 2024-11-03)
  TRUSTED      refund_policy_v2.1.pdf             ── 15-day return, 10% fee (Effective 2024-12-01)

Trusted Answer:
Bulk order returns for Enterprise clients must be initiated within 15 calendar days of receipt [1].
A 10% restocking fee applies [1]. The December policy legally supersedes all prior email quotes [1].

Citations & Provenance:
📄 [1] refund_policy_v2.1.pdf ── Page 3, Section 2.1 (sha256:4e9fa821...)
✉️ [2] enterprise_terms.pdf    ── Clause 4B (sha256:7f3b8911...)
```

---

## 🌟 Core Value Propositions

| Feature | Description |
|---|---|
| 📂 **Multi-Format Ingestion** | Native parsing for PDF (+ OCR fallback), multi-sheet `.xlsx`, `.csv`, `.txt`, and `.eml` emails with safe encoding fallbacks. |
| ⚖️ **Temporal Conflict Arbitration** | Proactively flags contradictions between legacy documents and active MSA terms using date normalization across 15+ formats. |
| 🛡️ **Traceable Evidence & Hashes** | Every answer includes page/section citations, match confidence scores, and SHA-256 provenance cryptographic hashes. |
| 🔒 **PII Redaction Engine** | Built-in automatic redaction for credit card numbers, SSNs, and API keys before LLM context dispatch. |
| ⚡ **Dual LLM Synthesis** | High-performance dispatch prioritizing **Gemini 2.0 Flash** with automatic fallback to **Groq Llama-3.3-70B**. |
| 🎨 **Obsidian Kinetic UI** | High-contrast dark theme (*Palantir × Linear × Vercel*) with WebGL particle shaders, audio FX, and 4 theme modes. |
| 📊 **Audit & Compliance Ledger** | Persistent JSONL audit logging tracking query latency, call IDs, LLM provider dispatch, and user context. |
| 🧪 **Tested & CI/CD Ready** | 53 unit & integration tests passing with GitHub Actions CI automation. |

---

## 🏗️ System Architecture

```text
[ Document Sources ]
 ├── data/pdf_src/*.pdf
 ├── data/*.xlsx, *.csv
 └── data/emails/*.eml
        │
        ▼
   [ ingest.py ] ──► SentenceTransformers (all-MiniLM-L6-v2) ──► [ ChromaDB Vector Store ]
                                                                       │
[ Client Request ]                                                     │
 ├── Frontend (Vite/Next.js) ──► POST /api/v1/query                    │
 └── Streamlit Copilot UI    ──► rag_engine.retrieve() ───────────────┤
                                      │                                │
                                      ▼                                ▼
                          [ detect_conflicts() ] ◄── Context Retrieval (top-K)
                                      │
                                      ▼
                           [ generate_answer() ]
                                      │
                        ┌─────────────┴─────────────┐
                        ▼                           ▼
                 Gemini 2.0 Flash          Groq Llama-3.3-70B
                        │                           │
                        └─────────────┬─────────────┘
                                      ▼
                       [ Verified Answer + Citations ]
                                      │
                                      ▼
                        [ JSONL Audit Ledger Logger ]
```

---

## 📁 Repository Structure

```text
nexa/
├── frontend/                         # Modern React 19 + Vite + Tailwind v4 Web Application
│   ├── src/
│   │   ├── components/               # Neural Query Studio, Conflict Matrix, Topology Canvas, Settings
│   │   ├── data/                     # Data schemas & scenario fixtures
│   │   ├── utils/                    # Audio FX & visual shader helpers
│   │   ├── App.tsx                   # Master App state & views
│   │   └── types.ts                  # TypeScript interface definitions
│   ├── BACKEND_INTEGRATION_GUIDE.md  # API connection & contract manual
│   └── package.json
│
├── kb-agent/                         # Production Python RAG Engine & FastAPI REST Server
│   ├── api.py                        # FastAPI v3.0 REST Backend (/api/v1/query, /api/v1/health)
│   ├── app.py                        # Streamlit Copilot & CRM Ticket Studio UI
│   ├── rag_engine.py                 # Retrieval, conflict detection, LLM dispatch
│   ├── ingest.py                     # Multi-source document ingestion pipeline
│   ├── audit.py                      # JSONL persistent audit logger
│   ├── llm_config.py                 # Gemini / Groq API dispatcher
│   ├── generate_sample_pdfs.py       # Sample PDF generator for testing
│   ├── requirements.txt
│   └── tests/                        # Pytest suite (53 passed)
│
├── stitch_nexa_knowledge_engine/     # Stitch design specs, code templates & screenshots
├── docker-compose.yml                # One-command containerized deployment
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Backend Setup (FastAPI & RAG Engine)

```bash
# Navigate to backend folder
cd kb-agent

# Install dependencies
pip install -r requirements.txt

# Generate demo sample files & run ingestion pipeline
python generate_sample_pdfs.py
python ingest.py

# Start FastAPI server
uvicorn api:app --reload --port 8000
```
* **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### 2. Frontend Setup (React / Vite)

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
* **Application URL:** [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Configuration

Create a `.env` or `.streamlit/secrets.toml` file in `kb-agent/`:

```toml
# Groq API Key (Free tier) ── https://console.groq.com/keys
GROQ_API_KEY = "gsk_your_groq_key_here"

# Optional: Gemini API Key (Takes priority when provided)
GEMINI_API_KEY = "AIza_your_gemini_key_here"

# Optional: REST API Protection Header (X-API-Key)
NEXA_API_KEY = "nexa_secret_api_key_2026"
```

---

## 🐳 Docker Deployment

To launch both the FastAPI REST backend and Streamlit UI in isolated containers:

```bash
# Set your API keys
$env:GROQ_API_KEY = "gsk_your_key"

# Build and start services
docker-compose up --build
```

| Container | URL |
|---|---|
| **Next.js / Vite Frontend** | [http://localhost:3000](http://localhost:3000) |
| **FastAPI REST API** | [http://localhost:8000](http://localhost:8000) |
| **FastAPI Swagger Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **Streamlit Copilot** | [http://localhost:8501](http://localhost:8501) |

---

## ⚡ REST API Specification

### `POST /api/v1/query`
Executes an intelligent query with multi-source retrieval, temporal conflict detection, and LLM synthesis.

```json
// Request
{
  "query": "What is our current refund policy for Acme Corp?",
  "top_k": 5
}

// Response (200 OK)
{
  "call_id": "req_a9f182c",
  "query": "What is our current refund policy for Acme Corp?",
  "answer": "Bulk order returns must be initiated within 15 days of receipt [1]. A 10% fee applies.",
  "confidence_level": "HIGH",
  "conflicts_detected": [
    {
      "topic": "bulk_refund_policy",
      "trusted_source": "refund_policy_v2.1.pdf",
      "trusted_date": "2024-12-01",
      "outdated_sources": [{"citation": "email_2024-11-03_acme.txt", "date": "2024-11-03"}]
    }
  ],
  "citations": [
    {
      "source_name": "refund_policy_v2.1.pdf",
      "source_type": "pdf",
      "doc_date": "2024-12-01",
      "section": "Page 3, Section 2.1",
      "citation": "Bulk orders must be returned within 15 days",
      "match_score_pct": 98.2
    }
  ],
  "total_chunks_retrieved": 4,
  "provider": "gemini",
  "latency_ms": 142.5
}
```

---

## 🧪 Testing & CI/CD Pipeline

Run the backend test suite:

```bash
cd kb-agent
pytest -v
```

```text
tests/test_api.py ......                                                 [ 11%]
tests/test_api_backend.py .............                                  [ 35%]
tests/test_ingest_dates.py .....                                         [ 45%]
tests/test_rag_engine.py .....                                           [ 54%]
tests/test_real_world_cases.py ........................                  [100%]

================= 53 passed, 3 warnings in 38.67s =================
```

GitHub Actions CI automatically executes the test suite on every `git push` to `main`.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
