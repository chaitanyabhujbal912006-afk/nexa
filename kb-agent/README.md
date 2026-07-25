# ⚡ Nexa — Knowledge Agent Engine (`kb-agent`)

This directory contains the core application code for the **Nexa Knowledge Agent**.

## File Structure

- `app.py`: Streamlit frontend with glassmorphism UI, Copilot chat, CRM ticket studio, and Analytics/Audit viewer.
- `ingest.py`: Multi-format document parser (PDF + OCR, Excel multi-sheet, email .txt & .eml) and `SentenceTransformer` embedder.
- `rag_engine.py`: Vector retrieval engine, date extractor, and conflict resolution detector.
- `audit.py`: Persistent audit logging module (`data/audit_log.jsonl`).
- `requirements.txt`: Python package dependencies.
- `data/`: Knowledge base source files (`pdf_src/`, `emails/`, `.xlsx` spreadsheets).

## Running locally

```bash
pip install -r requirements.txt
python ingest.py
streamlit run app.py
```
