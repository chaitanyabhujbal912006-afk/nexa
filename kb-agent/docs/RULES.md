# RULES — SourceTruth project conventions

These are binding conventions for anyone (human or agent) working on this
codebase. If a change would violate one of these, either don't make the
change or update this file explicitly with the reasoning — don't silently
drift from it.

## Cost policy

- **Nothing in this project may require a paid tier to run the demo, ingest
  the sample data, or serve the Streamlit app.** Any new dependency or
  service must have a genuinely free tier (not a "free trial") before it's
  added.
- If a paid upgrade is ever proposed (e.g. a hosted vector DB, a paid LLM
  API), it must be called out explicitly as optional, with the free
  alternative preserved as the default path.

## LLM provider policy

- The app must run with **zero LLM API key configured**, using the
  rule-based mock in `rag_engine.generate_answer()`. Never remove this
  fallback.
- When a real LLM is wired up, prefer in this order: (1) a provider with a
  genuine free tier requiring no card (currently Gemini's free tier, subject
  to change — verify current terms before relying on this), (2) Groq free
  tier, (3) a local model via Ollama (zero API calls, needs local compute).
- `call_llm()` must remain a single swappable function taking
  `(system_prompt, user_prompt) -> str`. Don't scatter provider-specific
  code elsewhere.

## Embedding model policy

- TF-IDF (current) is an accepted stand-in **only** because of this
  project's original sandboxed-network build environment. It is not the
  target production embedder.
- Before this system is used to make real operational decisions, swap to
  `sentence-transformers` (`all-MiniLM-L6-v2`, free, local, no API key) or
  an equivalent free hosted embeddings API. Anyone doing this swap should
  update both `ingest.py` (fit/store) and `rag_engine.py` (query-time
  transform) together — they must always use the same embedding method.

## Tabular data handling

- **Never** ingest a spreadsheet as raw cell dumps or a flattened CSV blob.
  Each row must be converted into a natural-language sentence before
  chunking/embedding (see `ingest_excel()` in `ingest.py`). This is the
  difference between pricing rows being retrievable by a semantic query and
  being invisible to one — do not regress this.

## Conflict detection policy

- A "conflict" is only real if the **underlying numeric facts differ**
  (day counts, percentages, dollar amounts) between same-topic chunks from
  different source documents. Two sources agreeing on the same topic is
  corroboration, not a conflict — do not flag it as one.
- Conflict resolution always prioritizes the source with the **later
  `doc_date`**, and the answer must **state which source was trusted and
  why**, never silently resolve it.
- If date metadata is missing/unknown for a source, do not silently trust
  it over a dated source — flag the ambiguity to the user instead.

## Source attribution policy

- Every chunk stored in the vector DB must carry `source_type`,
  `source_name`, `doc_date`, and `section` metadata. No chunk may be added
  without these fields — `ingest.py`'s ingestion functions must always
  populate all four.
- Every answer surfaced to the user must be traceable to specific chunk(s).
  Never present a claim without a citation, and never let the LLM invent an
  answer the retrieved sources don't support — the system prompt in
  `rag_engine.py` enforces this and must not be weakened.

## Code conventions

- Keep `ingest.py` and `rag_engine.py` provider-agnostic and UI-agnostic —
  no Streamlit imports in either file. UI-specific code stays in `app.py`
  only, so a future React/FastAPI split doesn't require touching the core
  logic (see PHASES.md Phase 4).
- Any new source format (e.g. `.eml`, Slack export, Confluence page) gets
  its own `ingest_<format>()` function returning `(docs, metas, ids)` in the
  same shape as the existing three — don't special-case formats inline in
  `main()`.
- Prefer small, named functions over inline logic in `app.py` once the UI
  grows past its current size.

## Documentation policy

- `PRD.md`, `ARCHITECTURE.md`, `PHASES.md` must be updated in the same
  change that alters scope, architecture, or the roadmap — treat doc drift
  as a bug.
- `MEMORY.md` is append-only context for whoever (human or agent) picks
  this project up next — log decisions and their reasoning there, don't
  just log what changed.
