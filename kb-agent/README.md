# SME Knowledge Retrieval Agent — Working Prototype

A fully functional, zero-cost RAG system that ingests PDFs, Excel sheets, and
emails into one searchable knowledge base, answers natural-language questions
with citations, and auto-detects date-based conflicts between sources.

## What's actually working right now

| Deliverable from the spec | Status |
|---|---|
| Multi-format ingestion (PDF + Excel + email) → vector DB | ✅ `ingest.py`, using ChromaDB |
| RAG chat interface | ✅ `app.py` (Streamlit) |
| Source attribution on every answer | ✅ every chunk carries file/section/row + date |
| Conflict detection (prioritize newest, explain why) | ✅ `rag_engine.py::detect_conflicts` |
| Mock CRM ticket auto-populated from an answer | ✅ bottom panel in `app.py` |

Try it: ask *"What is our refund policy for bulk orders quoted to Acme Corp
last month?"* — it will flag that the Nov 3 email (45-day refund, no fee)
was superseded by the Dec 1 policy PDF (15-day refund), explain why, and
give the trusted answer.

## Run it locally (2 minutes)

```bash
pip install -r requirements.txt
python3 ingest.py       # parses data/ and builds the vector DB
streamlit run app.py
```

## Architecture

```
data/pdf_src/*.pdf  ─┐
data/*.xlsx         ─┼─► ingest.py ──► chunks + metadata ──► ChromaDB (chroma_db/)
data/emails/*.txt   ─┘        (source, date, section/row, topic tags)
                                          │
question ──► app.py ──► rag_engine.retrieve() ──► rag_engine.detect_conflicts()
                                          │
                              rag_engine.generate_answer()  ──► cited, conflict-aware answer
                                          │
                              app.py "Create Ticket" panel (mock CRM)
```

Key design choices, and why:

- **Tabular data is turned into sentences, not raw cell dumps.** Each Excel
  row is rendered as a natural-language sentence ("Quote Q-2024-1187: Client
  Acme Corp ordered 500 units of Widget A on 2024-10-28 at $4.20/unit...").
  This is *the* trick that makes pricing rows retrievable by a semantic
  search alongside prose — a flat CSV dump into the vector DB is the #1
  reason naive RAG systems fail on spreadsheets.
- **Every chunk carries a `doc_date` and `topic`.** Conflict detection is
  just: group same-topic chunks by source, and if the numeric facts (day
  counts, %, $ amounts) actually differ, flag it and trust the one with the
  latest date. This mirrors exactly the workflow you described (old email
  vs. new policy PDF).
- **The LLM only sees retrieved chunks, never invents.** The system prompt
  in `rag_engine.py` forces citation-per-claim and explicit conflict
  narration, so a wrong/missing answer is visible rather than silent.

## Embedding model — one thing to know

This sandbox environment's network is locked down (can't reach model
download URLs), so the prototype fits a lightweight **TF-IDF** vectorizer
locally as a stand-in embedder — fully offline, fully free, and good enough
to demo the whole pipeline including conflict detection.

**On your own machine or in deployment (normal internet access), upgrade
this** for much better semantic matching — it's a ~5 line change in
`ingest.py` and `rag_engine.py`:

```python
# instead of TfidfVectorizer, use:
from chromadb.utils import embedding_functions
ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"  # free, runs locally, no API key
)
collection = client.get_or_create_collection("sme_knowledge_base", embedding_function=ef)
collection.add(documents=docs, metadatas=metas, ids=ids)  # no need to pass embeddings manually
```

This model is free forever (runs on your CPU, no API key, ~80MB download).

## Turning on a real LLM (also free)

The app runs a rule-based mock reasoning fallback out of the box (so it's
demoable with zero setup). To get real generative answers:

1. Get a **free** Gemini API key: https://aistudio.google.com/apikey
   (generous free tier, no credit card for the free tier as of this writing —
   confirm current limits on Google's page since free-tier terms change)
2. `export GEMINI_API_KEY=your_key_here` before running `streamlit run app.py`
3. The sidebar will switch from "🟡 Demo mode" to "🟢 Live LLM"

Alternative zero-cost LLM options if you'd rather not use Gemini:
- **Groq free tier** (very fast, free API for Llama/Mixtral models)
- **Ollama** running a local open model (Llama 3.1 8B, Mistral) — 100%
  free and private, needs a reasonably capable machine, zero API calls at all

Swap the provider by editing `call_llm()` in `app.py` — it's a single
function that takes `(system_prompt, user_prompt)` and returns a string.

## Deploying this for free

**Option A — Streamlit Community Cloud (recommended, easiest)**
1. Push this folder to a public (or private, if on a paid GH plan) GitHub repo
2. Go to https://share.streamlit.io → "New app" → point at `app.py`
3. Add `GEMINI_API_KEY` under app Settings → Secrets
4. Done — free hosting, auto-redeploys on git push

**Option B — Hugging Face Spaces**
1. Create a new Space, SDK = Streamlit
2. Push these files (rename nothing)
3. Add `GEMINI_API_KEY` under Space Settings → Repository secrets

Both are genuinely free for this workload (no credit card, no trial-then-bill).

## Extending to your real data

1. Drop your real PDF(s) into `data/pdf_src/`, Excel file(s) into `data/`,
   and export real email threads as `.txt` into `data/emails/` (any mail
   client can export to .txt/.eml; adjust `ingest.py`'s parsing if your
   format differs, e.g. `.eml` needs Python's `email` module instead of
   plain text reading).
2. Re-run `python3 ingest.py`.
3. For production-grade date parsing (real emails/PDFs won't have a clean
   `YYYY-MM-DD` sitting in the text), swap the regex date extraction for
   proper email header parsing (`email.utils.parsedate_to_datetime`) and
   PDF metadata (`reader.metadata.get('/CreationDate')`) as a fallback.

## Known limitations of this prototype (be upfront about these)

- TF-IDF embeddings are a keyword-ish match, not true semantic understanding
  — upgrade to sentence-transformers as noted above before relying on this
  for real decisions.
- Conflict detection uses simple numeric-fact comparison (day counts, %,
  $ amounts) — good for policy/pricing conflicts, won't catch conflicts
  that are purely qualitative (e.g. "we allow returns" vs "we don't allow
  returns" with no numbers). Extend `key_facts()` in `rag_engine.py` for
  your domain's specific conflict patterns.
- The mock CRM just displays a JSON object — wire `Create Ticket` to a real
  CRM API (e.g. HubSpot free tier, Zendesk) when ready.
