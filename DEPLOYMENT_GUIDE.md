# Nexa — Complete Deployment Guide

## Architecture Overview

```
Vercel (Next.js Frontend)
        │
        │ REST API calls
        ▼
Render (Docker — FastAPI + Streamlit)
        │
        ├── Pinecone (vector embeddings — persistent cloud)
        ├── Groq / Gemini (LLM inference — free tier APIs)
        └── Resend (OTP email delivery — free tier)
```

---

## 1. Pinecone Setup (Vector Database)

1. Sign up at [pinecone.io](https://pinecone.io) — free 2GB tier
2. Create an index with **exact** settings:
   - **Name**: `nexa-knowledge-base`
   - **Dimensions**: `384` ← must match `all-MiniLM-L6-v2` output
   - **Metric**: `cosine`
   - **Type**: Serverless (free)
   - **Cloud/Region**: AWS `us-east-1`
3. Copy your API key from the **API Keys** page

---

## 2. Resend Setup (OTP Email)

1. Sign up at [resend.com](https://resend.com) — free 3,000 emails/month
2. Verify a domain **OR** use `onboarding@resend.dev` for testing (sends to verified emails only)
3. Copy your API key from the dashboard

---

## 3. Groq Setup (LLM — Free)

1. Sign up at [console.groq.com](https://console.groq.com)
2. Generate an API key
3. Model used: `llama-3.3-70b-versatile` (free tier, rate limited)

---

## 4. Generate a JWT Secret

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Save this value — it signs all user auth tokens. Changing it invalidates all existing sessions.

---

## 5. Render Deployment

### Prerequisites
- Docker image is defined in `kb-agent/Dockerfile`
- `render.yaml` is at the project root

### Steps

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render will auto-detect `render.yaml`
4. Set all **Environment Variables** (mark sensitive ones as Secret):

| Variable | Value | Secret? |
|----------|-------|---------|
| `GROQ_API_KEY` | Your Groq key | ✅ Yes |
| `PINECONE_API_KEY` | Your Pinecone key | ✅ Yes |
| `PINECONE_INDEX` | `nexa-knowledge-base` | No |
| `RESEND_API_KEY` | Your Resend key | ✅ Yes |
| `RESEND_FROM_EMAIL` | `Nexa <onboarding@resend.dev>` | No |
| `JWT_SECRET` | Your generated 32+ char secret | ✅ Yes |
| `NEXA_ALLOWED_ORIGINS` | `https://your-vercel-app.vercel.app,http://localhost:3000` | No |
| `RATE_LIMIT_QUERY` | `60/minute` | No |
| `RATE_LIMIT_INGEST` | `10/minute` | No |

5. Deploy — the Docker build bakes in the embedding model (~80MB), so build takes ~3–5 min

### Health Check
After deploy, verify:
```
GET https://your-render-url.onrender.com/api/v1/health
```
Expected response:
```json
{
  "status": "online",
  "provider": "GROQ · llama-3.3-70b-versatile",
  "embedding_model": "all-MiniLM-L6-v2"
}
```

---

## 6. Seed the Knowledge Base

After first deploy, upload a document to trigger Pinecone ingestion:

```bash
curl -X POST https://your-render-url.onrender.com/api/v1/upload \
  -F "file=@your_document.pdf"
```

Or use the Streamlit UI sidebar → Upload → Save & Ingest.

---

## 7. Vercel Deployment (Frontend)

1. Go to [vercel.com](https://vercel.com) → Import your repo
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-render-url.onrender.com`
4. Deploy

---

## 8. Local Development

### Prerequisites
```bash
pip install -r kb-agent/requirements.txt
```

### Configure secrets
Edit `kb-agent/.streamlit/secrets.toml` (this file is gitignored):
```toml
GROQ_API_KEY = "your_groq_key"
PINECONE_API_KEY = "your_pinecone_key"
PINECONE_INDEX = "nexa-knowledge-base"
RESEND_API_KEY = "your_resend_key"  # optional for local
```

### Run Streamlit UI
```bash
cd kb-agent
streamlit run app.py
```

### Run FastAPI backend
```bash
cd kb-agent
uvicorn api:app --reload --port 8000
```

### Run tests
```bash
cd kb-agent
pytest tests/ -v
```

---

## 9. Key Architecture Decisions

| Decision | Reason |
|----------|--------|
| Pinecone over ChromaDB | ChromaDB is file-based and wiped on every Render redeploy |
| Docker over native Python on Render | Allows pre-baking the 80MB embedding model, avoiding cold-start timeouts |
| Resend over SMTP | Zero-config, free tier, reliable delivery, simple Python SDK |
| Groq over OpenAI | Free tier with generous rate limits, llama-3.3-70b is competitive quality |
| JWT over sessions | Stateless, works across Render redeploys without a session store |

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| Render deploy times out | Model download failing — check Docker build logs, model is pre-baked in layer |
| "No AI model configured" in chat | `GROQ_API_KEY` env var missing on Render |
| OTP email not arriving | `RESEND_API_KEY` missing, or sending to unverified domain |
| JWT tokens invalid after redeploy | `JWT_SECRET` not set as env var (it's regenerated from file otherwise) |
| Pinecone query returns 0 results | Index not created yet, or wrong dimensions (must be 384) |
| CORS error from Vercel | Add Vercel URL to `NEXA_ALLOWED_ORIGINS` env var on Render |
