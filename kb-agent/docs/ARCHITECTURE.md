# ARCHITECTURE — SourceTruth

## 1. System overview

```
data/pdf_src/*.pdf  ─┐
data/*.xlsx         ─┼─► ingest.py ──► chunks + metadata ──► ChromaDB (chroma_db/)
data/emails/*.txt   ─┘      (source, date, section/row, topic)
                                        │
question ──► app.py (Streamlit) ──► rag_engine.retrieve()
                                        │
                              rag_engine.detect_conflicts()
                                        │
                              rag_engine.generate_answer() ──► cited, conflict-aware answer
                                        │
                              app.py "Create ticket" panel (mock CRM)
```

Single-process design: Streamlit runs the UI and the Python backend logic
in one runtime. There is no separate API server in v1 (see PHASES.md for
when/why that would change).

## 2. Components

### 2.1 Ingestion (`ingest.py`)
- **PDF**: `pypdf` extracts text page-by-page; split by "Section N:" headers where present, so citations point to a titled section rather than a raw page number.
- **Excel**: each row rendered as a natural-language sentence (not a raw cell dump) — this is the single most important choice for making tabular data retrievable alongside prose. See RULES.md §Tabular data handling.
- **Email**: plaintext files, chunked with overlap; date extracted from the `Date:` header via regex.
- **Chunking**: word-based, ~120-150 words per chunk, 50-word overlap, to keep citations granular without fragmenting a policy clause mid-sentence.
- **Metadata schema** (attached to every chunk):
  ```
  source_type: "pdf" | "excel" | "email"
  source_name: <filename>
  doc_date:    "YYYY-MM-DD" | "unknown"
  section:     <section title> | "row N" | "chunk N"
  topic:       domain tag used for conflict grouping (see §2.3)
  ```

### 2.2 Vector store
- **ChromaDB**, persisted to `chroma_db/` (file-based, no server to run/pay for).
- **Embeddings**: currently a locally-fit `TfidfVectorizer` (scikit-learn) — chosen because the sandbox this was built in blocks the download URL for Chroma's default ONNX model. **This is a known stand-in, not the recommended production embedder** — see RULES.md §Embedding model policy for the required upgrade path before relying on this for real decisions.
- Vectorizer is pickled to `vectorizer.pkl` and must be re-fit any time `ingest.py` re-runs (query-time transform uses the same fitted vectorizer).

### 2.3 Retrieval + conflict detection (`rag_engine.py`)
- `retrieve(query, top_k=5, fetch_k=12)`: over-fetches, then narrows to the dominant topic(s) among the top 2 hits, so a lower-ranked but topically-relevant source (e.g. an old email) isn't dropped before conflict detection ever sees it.
- `detect_conflicts(hits)`: groups hits by `topic`; if 2+ distinct `source_name`s share a topic, extracts numeric "facts" (day counts, %, $ amounts) from each and only flags a conflict if those facts actually differ. This avoids false positives when two sources agree on the same topic.
- `generate_answer(query, hits, conflicts, llm_call_fn)`: builds a context block (sources + explicit conflict instructions), sends to `llm_call_fn` if provided, else falls back to a deterministic rule-based mock so the app is fully demoable with zero API keys.

### 2.4 UI (`app.py`)
- Streamlit, single file, custom theme via `.streamlit/config.toml`.
- Chat interface, source-pill citations, conflict callout boxes, and a mock ticket-creation panel that auto-populates from the last answer.

## 3. Data flow for a single question

1. User types a question in `st.chat_input`.
2. `retrieve()` transforms the query with the fitted vectorizer, queries Chroma for `fetch_k` nearest chunks, narrows to dominant topic(s), returns `top_k`.
3. `detect_conflicts()` runs on those hits.
4. `generate_answer()` builds the LLM context (or runs the mock) and returns the answer + the raw context block (useful for debugging/audit).
5. UI renders: conflict box(es) if any → answer → source pills.
6. Last Q&A context is stashed in `st.session_state.last_context` for the ticket panel.

## 4. Deployment topology (zero cost)

| Piece | Where | Why |
|---|---|---|
| App + backend logic | Streamlit Community Cloud or HF Spaces | Free, single deploy, no CORS/second-service to manage |
| Vector DB | Bundled `chroma_db/` folder in the repo | File-based, no hosted DB bill |
| LLM (optional) | Gemini free tier / Groq free tier / local Ollama | See RULES.md §LLM provider policy |

## 5. Known technical debt (tracked, not hidden)

- TF-IDF embeddings instead of a real sentence embedding model (blocked by sandbox network only — trivial swap elsewhere, see README "Upgrading the embedder")
- Date extraction is regex-based (`YYYY-MM-DD` in text) — real emails/PDFs need proper header/metadata parsing before this is production-grade (see PHASES.md Phase 2)
- Conflict detection's `key_facts()` only catches numeric disagreements — purely qualitative conflicts ("we allow returns" vs "we don't") aren't caught yet
- No auth, no multi-tenant separation — single shared KB, single shared session state
