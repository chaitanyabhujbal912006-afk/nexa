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

- [x] Wire up a real free-tier LLM (Gemini/Groq/Ollama) via `call_llm()`
- [x] Replace TF-IDF with `sentence-transformers` for real semantic search
- [x] Replace sample data with the business's actual PDF(s), spreadsheet(s), and exported email threads
- [x] Harden date extraction: real email headers (`email.utils.parsedate_to_datetime`) and PDF metadata (`/CreationDate`)
- [x] Manual QA pass & pytest suite (8 passing unit tests)

## Phase 2 — Ingestion robustness

- [x] Support `.eml` files directly via Python's `email` module
- [x] Support scanned/image-based PDFs (OCR fallback)
- [x] Handle multi-sheet Excel workbooks
- [x] Incremental single-document deletion & instant ChromaDB vector cleanup
- [x] File-upload UI & dedicated Document Management tab (`◈ DOCUMENTS`)

## Phase 3 — Trust & auditability

- [x] Expose raw context block in an inspectable expander
- [x] Log every Q&A turn to structured `audit_log.jsonl`
- [x] Extend conflict detection to numeric and qualitative policy terms
- [x] Flag as Incorrect feedback button & Webhook alert integration (`NEXA_WEBHOOK_URL`)
- [x] Proactive Knowledge Base Conflict Health Scanner (`scan_all_conflicts()`)

## Phase 4 — Productionization

- [x] FastAPI REST server (`api.py`) exposing `/query`, `/ingest`, `/documents`, `/conflicts` with Swagger UI
- [x] Multi-format CRM ticket export (`.json` and `.csv` downloads)
- [x] Passkey Authentication Gate (`APP_PASSWORD`) & REST API Key protection (`NEXA_API_KEY`)
- [x] Docker + docker-compose & Streamlit Cloud auto-ingestion deployment setup

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
