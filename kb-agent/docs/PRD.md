# PRD — SourceTruth: SME Knowledge Retrieval Agent

## 1. Problem statement

Employees at small/medium businesses waste time cross-referencing scattered
sources (email threads, pricing spreadsheets, policy PDFs) to answer routine
client questions, and sometimes use an outdated document by mistake — causing
inconsistent answers and costly errors. Enterprise knowledge-management
systems solve this but are priced out of reach for SMEs.

## 2. Goal

A single conversational agent, deployable at zero infrastructure cost, that:
- answers natural-language questions using PDFs, spreadsheets, and emails as one unified knowledge base
- cites the exact document/row/section behind every claim
- detects when two sources disagree, explains which one it trusted and why
- can push a retrieved answer into a (initially mocked) CRM ticket

## 3. Target user

Non-technical SME employee (support, sales, ops) — not a developer. The UI
must require zero explanation beyond "ask your question here."

## 4. Success criteria (how we know it works)

- [ ] A question spanning 2+ source types returns one answer with correct citations
- [ ] Given a deliberately conflicting pair of sources, the system flags the conflict, names both sources, states which it trusted, and why (date-based)
- [ ] No answer is ever presented as fact without a citation
- [ ] A retrieved answer can populate a ticket form in under 2 clicks
- [ ] Runs and is deployable without a paid service tier

## 5. In scope (v1)

- Ingestion: PDF, XLSX, plaintext email exports
- Retrieval: semantic search over all formats in one index
- Conflict detection: same-topic, different-source, different numeric terms → flag + resolve by date
- Chat UI with citations and conflict callouts
- Mock CRM ticket creation (local JSON, not a real integration)

## 6. Explicitly out of scope (v1)

- Real CRM integration (HubSpot/Zendesk/Salesforce API calls)
- Multi-user auth / permissions
- Ingesting live inboxes (IMAP/Graph API) — v1 takes exported .txt/.eml
- Non-English documents
- Editing source documents from the chat

## 7. Non-functional requirements

- **Cost**: $0 to run and $0 to host at current scale (see ARCHITECTURE.md for the specific free-tier services this assumes)
- **Latency**: answer returned in under ~5s for a KB of this size (dozens–low hundreds of documents)
- **Transparency**: every answer must be traceable to a specific chunk; no answer may be fabricated when the KB doesn't cover the question
- **Auditability**: conflict resolutions must state their reasoning, not just their conclusion

## 8. Open questions / decisions needed before scaling past the prototype

- Which real LLM provider (Gemini free tier vs Groq vs local Ollama) — see RULES.md §LLM provider policy
- At what document-count does TF-IDF retrieval quality become a real problem, forcing the sentence-transformers upgrade described in ARCHITECTURE.md?
- Who owns re-ingestion when a new document is added — manual button (current) vs. scheduled job vs. watch-folder?
