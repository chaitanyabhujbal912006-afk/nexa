# MEMORY — context log for whoever picks this project up next

This file is append-only. Add new entries at the top with a date. Don't
delete old entries — if a decision was later reversed, say so in a new
entry rather than erasing the record of why it was made originally.

Intended audience: a human teammate, or an agentic coding tool (e.g.
Google Antigravity) reading this as project knowledge-base context before
making changes.

## 2026-07-30 — Production Hardening, UI Redesign & Enterprise API Expansion

**What exists:**
- Multi-format ingestion (PDF with OCR fallback, Excel multi-sheet, Email `.txt` & `.eml`).
- `sentence-transformers` (`all-MiniLM-L6-v2`) semantic vector embeddings with ChromaDB persistence.
- FastAPI REST backend (`api.py`) exposing `/api/v1/health`, `/api/v1/query`, `/api/v1/ingest`, `/api/v1/documents`, and `/api/v1/conflicts`.
- Hardened security: Passkey Auth Gate (`APP_PASSWORD`), `X-API-Key` REST authentication, scoped CORS, XSS sanitization, path-traversal upload protection, and in-process ingestion lock.
- Dedicated `◈ DOCUMENTS` tab with single-click instant vector & file deletion (`delete_document_from_index()`).
- Proactive Knowledge Base Conflict Scanner (`scan_all_conflicts()`) with 1-click full-database contradiction audit.
- Multi-format CRM ticket exports (downloadable `.json` and `.csv` payloads).
- Interactive visual analytics charts (bar charts for document breakdown & resolution rates).
- Automated Webhook dispatch (`NEXA_WEBHOOK_URL`) for Slack/Discord conflict & flag alerts.
- Streamlit Cloud self-healing setup (root `requirements.txt`, `sys.path` resolution, and automatic vector store auto-ingestion on fresh cloud deploy).

---

## 2026-07-25 — Prototype built, restyled, docs added

**What exists:** a working end-to-end prototype (`ingest.py`,
`rag_engine.py`, `app.py`) proving out the core spec: multi-format
ingestion, semantic retrieval, date-based conflict detection, cited
answers, mock CRM ticket creation. Verified working against a constructed
test case (Acme Corp bulk-refund conflict between a Nov 2024 email and a
Dec 2024 policy PDF) — the system correctly detects the conflict, trusts
the newer PDF, and states why.

**Key decision — TF-IDF instead of neural embeddings:** the build
environment's network was locked down and couldn't reach the URL ChromaDB's
default embedding model downloads from. Rather than block the whole
prototype on that, a `TfidfVectorizer` (scikit-learn) was fit locally and
used as the embedder instead. This is explicitly *not* the recommended
production choice — see RULES.md §Embedding model policy and
ARCHITECTURE.md §5 for the upgrade path (`sentence-transformers`,
~5 line change, works fine anywhere with normal internet access). Anyone
picking this up on a machine with normal internet access should do that
swap before trusting retrieval quality on real documents — TF-IDF is
keyword-ish matching, not true semantic search, and it showed real
weaknesses during testing (see next entry).

**Key decision — numeric-fact-based conflict detection:** early version
flagged a false conflict between two *sections of the same PDF*
("Bulk Order Refunds" vs "Standard (Non-Bulk) Order Refunds") because
topic-tagging was too coarse (both contained the word "refund"). Fixed by
(a) tagging topics more specifically (`bulk_refund_policy` vs
`standard_refund_policy`, careful about the "non-bulk" substring
containing "bulk"), and (b) only flagging a conflict when the actual
numeric terms (day counts, %, $ amounts) differ between sources — two
sources agreeing on the same topic is corroboration, not a conflict. This
took two iterations to get right; if conflict detection ever seems to be
over- or under-firing, check topic-tagging granularity first.

**Key decision — retrieval widens then narrows by topic:** naive top-k
nearest-neighbor retrieval missed the actual conflicting email (it ranked
6th out of 9 chunks, TF-IDF being weak at this scale/method). Fixed by
over-fetching (`fetch_k=12`) then filtering to the dominant topic(s) among
the top 2 hits before capping at `top_k`. This is a workaround for a weak
embedder more than a general best practice — revisit once real embeddings
are in place, the over-fetch-then-filter approach may become unnecessary
or may still be useful for conflict recall specifically.

**Key decision — Streamlit over React for v1:** discussed building a React
+ FastAPI version for better visual polish. Decided against it for now:
splitting into two services (frontend + backend) adds CORS config, two
free-tier deployments to babysit (with cold-start behavior on both), and
doesn't improve the actually-hard part of this project (retrieval quality,
conflict detection accuracy) — only the UI layer. Recommendation logged in
PHASES.md Phase 4: validate retrieval/conflict-detection on real data
first, only move to a React split once the UI itself is the bottleneck,
not before.

**Naming:** project named "SourceTruth" — pitch is "tells you which source
to trust, and why," which is the actual differentiator over a generic
chatbot-over-your-files tool. Alternatives considered and rejected:
Confluo, Vault Sage, Nexa, Docly, Verity.

**Known gaps flagged but not yet acted on** (see PHASES.md for the
prioritized version):
- Date extraction is regex-based, won't survive real email/PDF formats
- No real LLM wired up yet (runs on rule-based mock by default)
- No real CRM integration (ticket panel is mock/local only)
- Conflict detection only catches numeric disagreements, not qualitative ones

---

<!-- Add new entries above this line, newest first -->
