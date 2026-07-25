# PHASES — SourceTruth roadmap

## Phase 0 — Prototype (done)

- [x] Ingestion pipeline for PDF, XLSX, plaintext email
- [x] ChromaDB vector store with source/date/section metadata
- [x] Retrieval + topic-based re-ranking
- [x] Numeric-fact conflict detection, resolved by recency
- [x] Streamlit chat UI with citations and conflict callouts
- [x] Mock CRM ticket panel
- [x] Zero-cost, zero-API-key demo mode (rule-based mock answer generation)
- [x] Custom theme / visual polish pass

**Exit criteria met:** the Acme Corp bulk-refund conflict scenario from the
original spec works end-to-end, with a correct trusted answer and stated
reasoning.

## Phase 1 — Real LLM + real documents

- [ ] Wire up a real free-tier LLM (Gemini/Groq/Ollama) via `call_llm()`
- [ ] Replace TF-IDF with `sentence-transformers` for real semantic search (see RULES.md §Embedding model policy)
- [ ] Replace sample data with the business's actual PDF(s), spreadsheet(s), and exported email threads
- [ ] Harden date extraction: real email headers (`email.utils.parsedate_to_datetime`) and PDF metadata (`/CreationDate`) instead of regex-scanning for `YYYY-MM-DD` in body text
- [ ] Manual QA pass: run 15-20 real employee questions through it, log where retrieval or conflict detection gets it wrong

**Exit criteria:** retrieval quality and conflict detection hold up on real
documents, not just the constructed demo scenario.

## Phase 2 — Ingestion robustness

- [ ] Support `.eml` files directly (not just plaintext exports) via Python's `email` module
- [ ] Support scanned/image-based PDFs (OCR fallback)
- [ ] Handle multi-sheet Excel workbooks, not just a single sheet
- [ ] A "re-ingest" flow that's incremental (only new/changed files) instead of wiping and rebuilding the whole collection every time
- [ ] Basic file-upload UI so a non-technical employee can add a new document without touching the filesystem

## Phase 3 — Trust & auditability

- [ ] Expose the raw context block (currently returned but unused by the UI) as an optional "show reasoning" expander
- [ ] Log every question + answer + citations + conflict resolution to a simple audit trail (even just an append-only JSON/CSV file at this stage)
- [ ] Extend `key_facts()` conflict detection beyond numeric terms to catch clearly qualitative contradictions (domain-specific — needs real examples from Phase 1's QA pass)
- [ ] Add a lightweight way for an employee to flag "this answer looks wrong" back to whoever maintains the KB

## Phase 4 — Productionization (only if v1 proves out)

- [ ] Split into FastAPI backend + separate frontend (React or continued Streamlit) if the UI genuinely needs capabilities Streamlit can't give — see the React-vs-Streamlit discussion in project history for the tradeoffs; don't do this speculatively
- [ ] Real CRM integration (pick one: HubSpot free tier, Zendesk, or whatever the business already uses) replacing the mock ticket panel
- [ ] Basic auth if this moves from "one shared internal tool" to something with sensitive per-client data boundaries
- [ ] Scheduled/automated re-ingestion instead of a manual button, once there's a real cadence of new documents

## Phase 5 — Scale considerations (only if actually needed)

- [ ] Revisit ChromaDB's file-based persistence if the KB grows beyond what a single-file store handles comfortably (hundreds → thousands of documents)
- [ ] Revisit the free-tier LLM choice if usage volume starts hitting free-tier rate limits
- [ ] Multi-department / multi-KB separation if the business's knowledge base naturally splits (e.g. sales vs. support vs. legal)

---

**Sequencing note:** don't start Phase 4 (productionization / React split)
before Phase 1 (real LLM + real documents) has actually validated that
retrieval and conflict detection work on the business's real data. Polishing
delivery before validating substance is the most common failure mode for
projects like this.
