# ⚡ Nexa — SME Knowledge Retrieval Agent

> Enterprise-grade, conflict-aware RAG agent for small & medium businesses.
> Unifies scattered knowledge across PDFs, Excel workbooks, and emails into one cited, AI-powered conversational assistant.

![Nexa](https://img.shields.io/badge/Nexa-v2.0-7c3aed?style=for-the-badge&logo=lightning)
![License](https://img.shields.io/badge/License-MIT-6366f1?style=for-the-badge)
![LLM](https://img.shields.io/badge/LLM-Groq%20%7C%20Gemini-ec4899?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-8%20Passed-34d399?style=for-the-badge)
![CI](https://img.shields.io/github/actions/workflow/status/chaitanyabhujbal912006-afk/nexa/ci.yml?style=for-the-badge&label=CI)

---

## 🏢 The Problem It Solves

A customer support rep gets a call from **Acme Corp** demanding a refund based on an old email from November. But the company issued an updated policy PDF in December. Searching manually leads to inconsistent answers, disputes, and lost revenue.

**Nexa solves this in seconds:**

> *"What is our refund policy for bulk orders quoted to Acme Corp?"*

```
⚠️ Conflict Detected on bulk_refund_policy:
  SUPERSEDED  email_2024-11-03_acme_refund.txt — promised 45-day return, $0 fee
  TRUSTED     refund_policy_v2.1.pdf (Dec 1, 2024) — 15-day return, 10% fee

Trusted Answer:
Returns for bulk orders must be initiated within 15 days [1].
A 10% restocking fee applies [1]. The December policy supersedes
all prior email quotes issued before Dec 1, 2024 [1].

Citations:
📄 refund_policy_v2.1.pdf — Section 4, dated 2024-12-01
✉️ email_2024-11-03_acme_refund.txt — chunk 1, dated 2024-11-03
```

---

## 🌟 Features

| Feature | Detail |
|---|---|
| **Multi-Format Ingestion** | PDF (+ OCR fallback), multi-sheet `.xlsx`, `.txt`, `.eml` |
| **Semantic Vector Search** | `all-MiniLM-L6-v2` (384-dim) via ChromaDB |
| **Conflict Detection Engine** | Detects numeric AND qualitative policy contradictions, trusts latest date |
| **Dual LLM Support** | Gemini Flash (primary) → Groq llama-3.3-70b (secondary) → Demo mode |
| **Cyberpunk UI** | Dark neon Streamlit app with Orbitron/JetBrains Mono typography |
| **CRM Ticket Studio** | Auto-populate support tickets from cited answers |
| **FastAPI REST Backend** | `/api/v1/query`, `/api/v1/health`, `/api/v1/ingest` |
| **Audit Trail** | Persistent JSONL logging of every Q&A turn |
| **Pytest Test Suite** | 8 tests covering date extraction, conflict detection, and context building |
| **Docker Ready** | `Dockerfile` + `docker-compose.yml` for one-command deployment |
| **GitHub Actions CI** | Auto-runs tests on every `git push` |

---

## 🏗️ Architecture

```
data/pdf_src/*.pdf   ─┐
data/*.xlsx          ─┼─► ingest.py ──► SentenceTransformers ──► ChromaDB
data/emails/*.eml    ─┘         (topic, doc_date, section, source_type)
                                              │
Question ──► app.py (Streamlit UI)            │
          ──► api.py (FastAPI REST)  ──► rag_engine.retrieve()
                                          ──► detect_conflicts()
                                          ──► generate_answer()
                                              │
                               Gemini Flash / Groq ──► Cited Answer + Audit Log
```

---

## 📁 Project Structure

```
nexa/
├── kb-agent/
│   ├── app.py                  # Streamlit UI — Copilot, CRM Studio, Analytics
│   ├── api.py                  # FastAPI REST server
│   ├── rag_engine.py           # Retrieval, conflict detection, LLM dispatch
│   ├── ingest.py               # Multi-format document ingestion pipeline
│   ├── audit.py                # JSONL audit logger
│   ├── generate_sample_pdfs.py # Sample PDF generator for demo
│   ├── Dockerfile              # Container definition
│   ├── requirements.txt
│   ├── data/
│   │   ├── pdf_src/            # PDF documents
│   │   ├── emails/             # .txt and .eml email files
│   │   └── *.xlsx              # Excel spreadsheets
│   ├── tests/
│   │   ├── test_ingest_dates.py
│   │   └── test_rag_engine.py
│   └── .streamlit/
│       ├── config.toml
│       └── secrets.toml        # API keys (gitignored)
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
└── LICENSE
```

---

## 🚀 Quickstart (Local)

### 1. Clone & install

```bash
git clone https://github.com/chaitanyabhujbal912006-afk/nexa.git
cd nexa/kb-agent
pip install -r requirements.txt
```

### 2. Configure API key

Create `.streamlit/secrets.toml`:

```toml
# Groq (free tier) — https://console.groq.com/keys
GROQ_API_KEY = "gsk_your_groq_key_here"

# Optional: Gemini Flash takes priority when set
# GEMINI_API_KEY = "AIza_your_gemini_key_here"
```

### 3. Ingest documents & run

```bash
python ingest.py
streamlit run app.py
```

App available at **http://localhost:8501**

---

## 🐳 Docker Deployment

```bash
# Set your keys in environment
$env:GROQ_API_KEY = "gsk_your_key"

# Build & start both UI + API containers
docker-compose up --build
```

| Service | URL |
|---|---|
| Streamlit UI | http://localhost:8501 |
| FastAPI REST | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

---

## ⚡ REST API

```bash
# Health check (Public)
GET /api/v1/health

# Query the knowledge base (Header: X-API-Key)
POST /api/v1/query
{
  "query": "What is our refund policy for Acme Corp?",
  "top_k": 5
}

# List all ingested documents with metadata
GET /api/v1/documents

# Proactive full-KB conflict audit report
GET /api/v1/conflicts

# Trigger re-ingestion
POST /api/v1/ingest
```

### 🔔 Optional Automated Webhooks & Passkey Auth
- **`NEXA_WEBHOOK_URL`**: Post automated conflict notifications & user flagging payloads to Slack/Discord/Webhook.
- **`APP_PASSWORD`**: Enable Passkey Security Gate modal in Streamlit UI.
- **`NEXA_API_KEY`**: Protect REST API endpoints with `X-API-Key` headers.

Full interactive API docs at **http://localhost:8000/docs** (Swagger UI auto-generated by FastAPI).

---

## 🧪 Tests

```bash
cd kb-agent
pytest tests/
# 8 passed ✅
```

CI runs automatically on every `git push` via GitHub Actions.

---

## ☁️ Streamlit Cloud Deployment (Free)

1. Push to GitHub.
2. Go to [share.streamlit.io](https://share.streamlit.io) → **New App**.
3. Set Main file path: `kb-agent/app.py`
4. Add `GROQ_API_KEY` under **Settings → Secrets**.
5. Click **Deploy** — live in ~2 minutes!

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
