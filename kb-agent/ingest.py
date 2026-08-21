"""
Ingestion pipeline for the Multi-Format Knowledge Retrieval Agent.

Parses PDFs, Excel spreadsheets, and email (.txt) files into a unified
set of chunks, each tagged with metadata needed later for:
  - source attribution (which file / row / section)
  - conflict resolution (document date)

Run: python3 ingest.py
"""

import os
import re
import glob
from datetime import datetime

import pandas as pd
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer

EMBED_MODEL = "all-MiniLM-L6-v2"

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")

# ── Backend detection ──────────────────────────────────────────────
_PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY", "")
_PINECONE_INDEX = os.environ.get("PINECONE_INDEX", "nexa-knowledge-base")
_USE_PINECONE = bool(_PINECONE_API_KEY)

import email
import email.utils

DATE_PATTERNS = [
    re.compile(r"\b(\d{4}-\d{2}-\d{2})\b"),                             # 2024-11-03
    re.compile(r"\b(\d{4}/\d{2}/\d{2})\b"),                             # 2024/11/03
    re.compile(r"\b(\d{4}\.\d{2}\.\d{2})\b"),                             # 2024.11.03
    re.compile(r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b"),                   # 11-03-2024 / 11/03/2024
    re.compile(r"\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+\d{4})\b", re.I), # 3rd Nov 2024 / 3 November 2024 / 3rd Jan. 2025
    re.compile(r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b", re.I), # Nov 3rd, 2024 / November 3, 2024 / Jan. 15, 2024
]


def read_file_text_safe(path):
    """Safely read text file using multiple encoding fallbacks."""
    for enc in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            with open(path, "r", encoding=enc) as f:
                return f.read()
        except (UnicodeDecodeError, Exception):
            continue
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def parse_date_string(date_str):
    """Normalize various date formats (strings, timestamps, datetimes) into standard YYYY-MM-DD string."""
    if not date_str or pd.isna(date_str):
        return None

    # Handle pandas / python datetime or Timestamp objects
    if isinstance(date_str, (datetime, pd.Timestamp)):
        return date_str.strftime("%Y-%m-%d")

    s_val = str(date_str).strip()
    if not s_val:
        return None

    # Handle ISO timestamp format e.g. 2024-11-03T14:22:00Z or 2024-11-03 14:22:00
    iso_match = re.match(r"^(\d{4}-\d{2}-\d{2})[T\s]", s_val)
    if iso_match:
        return iso_match.group(1)

    # Handle dotted ISO format e.g. 2024.11.03
    dot_match = re.match(r"^(\d{4})\.(\d{2})\.(\d{2})$", s_val)
    if dot_match:
        return f"{dot_match.group(1)}-{dot_match.group(2)}-{dot_match.group(3)}"

    # Handle PDF metadata format e.g. D:20241201120000Z
    pdf_match = re.match(r"D:(\d{4})(\d{2})(\d{2})", s_val)
    if pdf_match:
        return f"{pdf_match.group(1)}-{pdf_match.group(2)}-{pdf_match.group(3)}"

    # Try email header rfc2822
    try:
        dt = email.utils.parsedate_to_datetime(s_val)
        if dt:
            return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    # Strip ordinal suffixes (1st -> 1, 2nd -> 2, 3rd -> 3, 4th -> 4) and dots in month names
    cleaned_val = re.sub(r"(\d+)(st|nd|rd|th)\b", r"\1", s_val, flags=re.I)
    cleaned_val = re.sub(r"\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.", r"\1", cleaned_val, flags=re.I)

    # Try regex patterns on cleaned value
    for pat in DATE_PATTERNS:
        m = pat.search(cleaned_val)
        if m:
            raw = m.group(1)
            raw_clean = re.sub(r"(\d+)(st|nd|rd|th)\b", r"\1", raw, flags=re.I).replace(",", "").replace(".", "").strip()
            for fmt in (
                "%Y-%m-%d", "%Y/%m/%d", "%Y.%m.%d",
                "%d %b %Y", "%d %B %Y", "%b %d %Y", "%B %d %Y",
                "%m-%d-%Y", "%m/%d/%Y", "%d-%m-%Y", "%d/%m/%Y"
            ):
                try:
                    return datetime.strptime(raw_clean, fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            if re.match(r"^\d{4}-\d{2}-\d{2}$", raw):
                return raw

    return None


def extract_email_date(content, fname=""):
    """Extract date from email content (Date: header first, then body regex, then filename)."""
    # 1. Look for Date: header
    header_match = re.search(r"^Date:\s*(.+)$", content, re.M | re.I)
    if header_match:
        parsed = parse_date_string(header_match.group(1).strip())
        if parsed:
            return parsed

    # 2. Search body for date patterns
    parsed = parse_date_string(content)
    if parsed:
        return parsed

    # 3. Fallback to filename
    parsed_fname = parse_date_string(fname)
    if parsed_fname:
        return parsed_fname

    return "unknown"


def extract_pdf_date(reader, full_text, fname=""):
    """Extract date from PDF metadata, header lines, body, or filename."""
    # 1. Check PDF CreationDate / ModDate metadata
    if reader.metadata:
        for key in ("/CreationDate", "/ModDate", "CreationDate", "ModDate"):
            val = reader.metadata.get(key)
            if val:
                parsed = parse_date_string(val)
                if parsed:
                    return parsed

    # 2. Check explicit header lines ("Effective date:", "Date:", "Updated:")
    meta_line_match = re.search(r"(?:Effective date|Date|Updated|Version date):\s*([^\n]+)", full_text, re.I)
    if meta_line_match:
        parsed = parse_date_string(meta_line_match.group(1).strip())
        if parsed:
            return parsed

    # 3. Search document text
    parsed = parse_date_string(full_text)
    if parsed:
        return parsed

    # 4. Fallback to filename
    parsed_fname = parse_date_string(fname)
    if parsed_fname:
        return parsed_fname

    return "unknown"


def chunk_text(text, chunk_size=150, overlap=30):
    """Sentence-boundary aware chunking with overlap to preserve semantic context."""
    if not text or not text.strip():
        return []

    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks = []
    current_words = []

    for sent in sentences:
        words = sent.split()
        if not words:
            continue
        if len(current_words) + len(words) <= chunk_size:
            current_words.extend(words)
        else:
            if current_words:
                chunks.append(" ".join(current_words))
            overlap_words = current_words[-overlap:] if len(current_words) >= overlap else current_words
            current_words = overlap_words + words

    if current_words:
        chunks.append(" ".join(current_words))
    return chunks


def sanitize_topic(text):
    """Clean heading/subject into a standardized topic key."""
    clean = re.sub(r"[^a-zA-Z0-9\s_]", "", str(text)).strip().lower()
    clean = re.sub(r"\s+", "_", clean)
    return clean[:40] if clean else "general"


def ingest_emails(user_dir=None, user_id="usr_default"):
    """Each email is prose -> chunked, date pulled from headers/body/filename."""
    if user_dir is None:
        user_dir = DATA_DIR
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(user_dir, "emails", "*.txt")):
        content = read_file_text_safe(path)

        fname = os.path.basename(path)
        doc_date = extract_email_date(content, fname)

        # Dynamic topic extraction from Subject line or filename
        subj_match = re.search(r"^Subject:\s*(.+)$", content, re.M | re.I)
        topic_raw = subj_match.group(1) if subj_match else fname.replace(".txt", "")
        topic = sanitize_topic(topic_raw)

        for idx, chunk in enumerate(chunk_text(content, chunk_size=120)):
            docs.append(chunk)
            metas.append({
                "source_type": "email",
                "source_name": fname,
                "doc_date": doc_date,
                "section": f"chunk {idx + 1}",
                "topic": topic,
                "user_id": user_id,
            })
            ids.append(f"email-{fname}-{idx}")
    return docs, metas, ids


def ingest_eml(user_dir=None, user_id="usr_default"):
    """Each .eml file parsed using Python email module -> extract plain text body & headers."""
    if user_dir is None:
        user_dir = DATA_DIR
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(user_dir, "emails", "*.eml")):
        with open(path, "rb") as f:
            msg = email.message_from_binary_file(f)

        fname = os.path.basename(path)
        subject = msg.get("Subject", "")
        date_hdr = msg.get("Date", "")
        doc_date = parse_date_string(date_hdr) or extract_email_date("", fname)

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode("utf-8", errors="ignore") + "\n"
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode("utf-8", errors="ignore")

        full_content = f"Subject: {subject}\nDate: {doc_date}\n\n{body}"
        topic = sanitize_topic(subject if subject else fname)

        for idx, chunk in enumerate(chunk_text(full_content, chunk_size=120)):
            docs.append(chunk)
            metas.append({
                "source_type": "email",
                "source_name": fname,
                "doc_date": doc_date,
                "section": f"eml chunk {idx + 1}",
                "topic": topic,
                "user_id": user_id,
            })
            ids.append(f"eml-{fname}-{idx}")
    return docs, metas, ids


def ingest_pdfs(user_dir=None, user_id="usr_default"):
    """Each PDF page -> chunked. Date pulled from metadata/header/body/filename."""
    if user_dir is None:
        user_dir = DATA_DIR
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(user_dir, "pdf_src", "*.pdf")):
        fname = os.path.basename(path)
        try:
            reader = PdfReader(path)
            full_text = "\n".join(page.extract_text() or "" for page in reader.pages)

            # OCR Fallback for scanned/image PDFs if direct text extraction yields empty string
            if len(full_text.strip()) < 30:
                try:
                    import pytesseract
                    from pdf2image import convert_from_path
                    images = convert_from_path(path)
                    ocr_text = "\n".join(pytesseract.image_to_string(img) for img in images)
                    if ocr_text.strip():
                        full_text = ocr_text
                except Exception:
                    pass  # pytesseract/poppler not installed; fallback to raw text

            doc_date = extract_pdf_date(reader, full_text, fname)

            # Split by section headers (e.g. "Section 4: ...", "Chapter 1...", "1.0 ...") so citations are meaningful
            sections = re.split(r"((?:Section|Chapter|\d+\.\d+)\s*[^:\n]*:?[^\n]*)", full_text, flags=re.I)
            current_section = "Header"
            buffer = ""
            parsed_sections = []
            for part in sections:
                if re.match(r"(?:Section|Chapter|\d+\.\d+)\s*", part, re.I):
                    if buffer.strip():
                        parsed_sections.append((current_section, buffer))
                    current_section = part.strip()
                    buffer = ""
                else:
                    buffer += part
            if buffer.strip():
                parsed_sections.append((current_section, buffer))

            for idx, (section_title, section_text) in enumerate(parsed_sections):
                topic = sanitize_topic(section_title if section_title != "Header" else fname)
                for c_idx, chunk in enumerate(chunk_text(section_text, chunk_size=150)):
                    docs.append(chunk)
                    metas.append({
                        "source_type": "pdf",
                        "source_name": fname,
                        "doc_date": doc_date,
                        "section": section_title,
                        "topic": topic,
                        "user_id": user_id,
                    })
                    ids.append(f"pdf-{fname}-{idx}-{c_idx}")
        except Exception as err:
            print(f"Warning: Failed to parse PDF file {fname}: {err}")
    return docs, metas, ids


def ingest_excel(user_dir=None, user_id="usr_default"):
    """Each row across ALL sheets in an Excel workbook -> turned into a natural-language sentence."""
    if user_dir is None:
        user_dir = DATA_DIR
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(user_dir, "*.xlsx")) + glob.glob(os.path.join(user_dir, "excel", "*.xlsx")):
        fname = os.path.basename(path)
        try:
            excel_file = pd.ExcelFile(path)
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                if df.empty:
                    continue

                topic = sanitize_topic(f"{fname}_{sheet_name}")

                for row_idx, row in df.iterrows():
                    parts = []
                    for col in df.columns:
                        val = row[col]
                        if pd.notna(val):
                            parts.append(f"{col}: {val}")
                    row_text = ", ".join(parts)
                    sentence = f"Spreadsheet record from '{fname}' (Sheet: '{sheet_name}', Row {row_idx + 2}): {row_text}."

                    row_date = "unknown"
                    for d_key in ("Order Date", "Date", "Effective Date", "Created At", "Timestamp"):
                        if d_key in row and pd.notna(row[d_key]):
                            row_date = parse_date_string(row[d_key]) or str(row[d_key])
                            break

                    client_val = str(row.get("Client", "general"))

                    docs.append(sentence)
                    metas.append({
                        "source_type": "excel",
                        "source_name": fname,
                        "doc_date": row_date,
                        "section": f"Sheet '{sheet_name}' row {row_idx + 2}",
                        "topic": topic,
                        "client": client_val,
                        "user_id": user_id,
                    })
                    safe_sheet = re.sub(r"[^a-zA-Z0-9_-]", "_", str(sheet_name))
                    ids.append(f"xlsx-{fname}-{safe_sheet}-{row_idx}")
        except Exception as err:
            print(f"Warning: Failed to parse Excel file {fname}: {err}")
    return docs, metas, ids


def ingest_csv(user_dir=None, user_id="usr_default"):
    """Each row in a CSV file -> turned into natural-language sentence record."""
    if user_dir is None:
        user_dir = DATA_DIR
    docs, metas, ids = [], [], []
    csv_paths = glob.glob(os.path.join(user_dir, "*.csv")) + glob.glob(os.path.join(user_dir, "csv", "*.csv"))
    for path in csv_paths:
        fname = os.path.basename(path)
        try:
            df = None
            for enc in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
                try:
                    df = pd.read_csv(path, encoding=enc)
                    break
                except Exception:
                    continue
            if df is None or df.empty:
                continue

            topic = sanitize_topic(fname.replace(".csv", ""))

            for row_idx, row in df.iterrows():
                parts = []
                for col in df.columns:
                    val = row[col]
                    if pd.notna(val):
                        parts.append(f"{col}: {val}")
                row_text = ", ".join(parts)
                sentence = f"CSV record from '{fname}' (Row {row_idx + 2}): {row_text}."

                row_date = "unknown"
                for d_key in ("Order Date", "Date", "Effective Date", "Created At", "Timestamp"):
                    if d_key in row and pd.notna(row[d_key]):
                        row_date = parse_date_string(row[d_key]) or str(row[d_key])
                        break

                client_val = str(row.get("Client", "general"))

                docs.append(sentence)
                metas.append({
                    "source_type": "csv",
                    "source_name": fname,
                    "doc_date": row_date,
                    "section": f"Row {row_idx + 2}",
                    "topic": topic,
                    "client": client_val,
                    "user_id": user_id,
                })
                ids.append(f"csv-{fname}-{row_idx}")
        except Exception as err:
            print(f"Warning: Failed to parse CSV file {fname}: {err}")
    return docs, metas, ids


def _pinecone_upsert_batch(batch_docs, batch_metas, batch_ids, embeddings, index):
    """Upsert a single batch of vectors into Pinecone."""
    vectors = []
    for vid, vec, meta, doc in zip(batch_ids, embeddings, batch_metas, batch_docs):
        pinecone_meta = dict(meta)
        pinecone_meta["text"] = doc  # Store text in metadata for retrieval
        vectors.append({"id": vid, "values": vec, "metadata": pinecone_meta})

    index.upsert(vectors=vectors)


def main(user_id: str = "usr_default"):
    print(f"Loading embedding model '{EMBED_MODEL}'...")
    from rag_engine import get_model
    model = get_model()

    if user_id == "usr_default":
        user_dir = DATA_DIR
    else:
        user_dir = os.path.join(DATA_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)

    all_docs, all_metas, all_ids = [], [], []
    for fn in (ingest_emails, ingest_eml, ingest_pdfs, ingest_excel, ingest_csv):
        d, m, i = fn(user_dir, user_id)
        all_docs += d
        all_metas += m
        all_ids += i

    if not all_docs:
        print(f"No documents found to ingest for user {user_id}.")
        return {
            "status": "success",
            "total_chunks": 0,
            "breakdown": {"email": 0, "pdf": 0, "excel": 0, "csv": 0},
            "source_files": []
        }

    BATCH_SIZE = 32
    print(f"Processing & encoding {len(all_docs)} total chunks in batches of {BATCH_SIZE}...")

    if _USE_PINECONE:
        from pinecone import Pinecone
        pc = Pinecone(api_key=_PINECONE_API_KEY)
        index = pc.Index(_PINECONE_INDEX)
        # Purge existing vectors for user before fresh batch ingestion
        try:
            index.delete(filter={"user_id": {"$eq": user_id}})
        except Exception as e:
            print(f"Warning: Could not delete old Pinecone vectors for {user_id}: {e}")

        # Stream encode and upsert in batches of 32
        for start_idx in range(0, len(all_docs), BATCH_SIZE):
            end_idx = min(start_idx + BATCH_SIZE, len(all_docs))
            b_docs = all_docs[start_idx:end_idx]
            b_metas = all_metas[start_idx:end_idx]
            b_ids = all_ids[start_idx:end_idx]

            b_embeddings = model.encode(b_docs, batch_size=len(b_docs), show_progress_bar=False).tolist()
            _pinecone_upsert_batch(b_docs, b_metas, b_ids, b_embeddings, index)
            print(f"  Pinecone: processed batch {start_idx // BATCH_SIZE + 1} ({len(b_docs)} vectors)")
    else:
        print("Upserting to ChromaDB (local)...")
        import chromadb
        client = chromadb.PersistentClient(path=DB_DIR)
        collection = client.get_or_create_collection(
            name="sme_knowledge_base",
            metadata={"hnsw:space": "cosine"},
        )
        try:
            existing = collection.get(where={"user_id": user_id})["ids"]
            if existing:
                collection.delete(ids=existing)
        except Exception:
            pass

        for start_idx in range(0, len(all_docs), BATCH_SIZE):
            end_idx = min(start_idx + BATCH_SIZE, len(all_docs))
            b_docs = all_docs[start_idx:end_idx]
            b_metas = all_metas[start_idx:end_idx]
            b_ids = all_ids[start_idx:end_idx]

            b_embeddings = model.encode(b_docs, batch_size=len(b_docs), show_progress_bar=False).tolist()
            collection.add(documents=b_docs, metadatas=b_metas, ids=b_ids, embeddings=b_embeddings)

    summary = {
        "status": "success",
        "total_chunks": len(all_docs),
        "breakdown": {
            t: sum(1 for m in all_metas if m["source_type"] == t)
            for t in {"email", "pdf", "excel", "csv"}
        },
        "source_files": sorted(list({m["source_name"] for m in all_metas}))
    }
    print(f"\nIngested {len(all_docs)} chunks from {len(summary['source_files'])} distinct files for user {user_id}.")
    return summary


if __name__ == "__main__":
    main()
