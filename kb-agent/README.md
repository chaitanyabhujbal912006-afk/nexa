# ⚡ Nexa — Knowledge Agent Engine (`kb-agent`)

This directory contains the core engine and application code for the **Nexa Knowledge Agent**.

## 🏢 Real-World Use Case

Nexa solves the common SME problem of conflicting business documents (e.g., old email quotes vs. new policy PDFs). When a user asks a question spanning multiple sources:
1. **Semantic Search:** Finds relevant chunks across PDFs, Excel workbooks, and email threads.
2. **Conflict Resolution:** Detects policy contradictions, prioritizes the source with the latest effective date, and explains why older terms are superseded.
3. **Cited LLM Answer:** Outputs a verified answer with bracketed citations (`[1]`).
4. **CRM Sync & Audit:** Logs turns to `data/audit_log.jsonl` and populates support response tickets.

## 📱 Mobile App Access

Nexa is 100% mobile-responsive. Users can add Nexa to their iPhone (Safari) or Android (Chrome) home screen (**Add to Home Screen**) to use it as a native full-screen mobile web app on the go!

## Directory Structure

- `app.py`: Streamlit frontend with glassmorphism UI, WCAG 2.1 AA/AAA accessibility suite (High Contrast, Large Text, Reduced Motion toggles), Copilot chat, CRM ticket studio, and Analytics/Audit viewer.
- `ingest.py`: Multi-format document parser (PDF + OCR, Excel multi-sheet, CSV, email .txt & .eml with safe multi-encoding fallback), 15+ date format normalizer, and `SentenceTransformer` embedder.
- `rag_engine.py`: Vector retrieval engine, date extractor, and quantitative/qualitative conflict resolution detector.
- `audit.py`: Persistent audit logging module (`data/audit_log.jsonl`).
- `requirements.txt`: Python package dependencies.
- `data/`: Knowledge base source files (`pdf_src/`, `emails/`, `.xlsx`, `.csv`).
- `tests/`: 38 automated Pytest test cases (`test_api.py`, `test_ingest_dates.py`, `test_rag_engine.py`, `test_real_world_cases.py`).

## Running locally

```bash
pip install -r requirements.txt
python ingest.py
streamlit run app.py
```

## Running tests

```bash
pytest tests/
# 38 passed ✅
```
