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
import chromadb
from sentence_transformers import SentenceTransformer

EMBED_MODEL = "all-MiniLM-L6-v2"

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")

import email
import email.utils

DATE_PATTERNS = [
    re.compile(r"\b(\d{4}-\d{2}-\d{2})\b"),                             # 2024-11-03
    re.compile(r"\b(\d{4}/\d{2}/\d{2})\b"),                             # 2024/11/03
    re.compile(r"\b(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})\b", re.I), # 3 Nov 2024 / 3 November 2024
    re.compile(r"\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})\b", re.I), # Nov 3, 2024 / November 3, 2024
]


def parse_date_string(date_str):
    """Normalize various date formats into standard YYYY-MM-DD string."""
    if not date_str:
        return None

    # Handle PDF metadata format e.g. D:20241201120000Z
    pdf_match = re.match(r"D:(\d{4})(\d{2})(\d{2})", str(date_str))
    if pdf_match:
        return f"{pdf_match.group(1)}-{pdf_match.group(2)}-{pdf_match.group(3)}"

    # Try email header rfc2822
    try:
        dt = email.utils.parsedate_to_datetime(str(date_str))
        if dt:
            return dt.strftime("%Y-%m-%d")
    except Exception:
        pass

    # Try regex patterns
    for pat in DATE_PATTERNS:
        m = pat.search(str(date_str))
        if m:
            raw = m.group(1)
            for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d %b %Y", "%d %B %Y", "%b %d, %Y", "%B %d, %Y", "%b %d %Y", "%B %d %Y"):
                try:
                    return datetime.strptime(raw.replace(",", ""), fmt).strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return raw  # fallback if already YYYY-MM-DD

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


def chunk_text(text, chunk_size=350, overlap=50):
    """Simple word-based chunking with overlap, good enough for prose."""
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


def sanitize_topic(text):
    """Clean heading/subject into a standardized topic key."""
    clean = re.sub(r"[^a-zA-Z0-9\s_]", "", str(text)).strip().lower()
    clean = re.sub(r"\s+", "_", clean)
    return clean[:40] if clean else "general"


def ingest_emails():
    """Each email is prose -> chunked, date pulled from headers/body/filename."""
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(DATA_DIR, "emails", "*.txt")):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

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
            })
            ids.append(f"email-{fname}-{idx}")
    return docs, metas, ids


def ingest_eml():
    """Each .eml file parsed using Python email module -> extract plain text body & headers."""
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(DATA_DIR, "emails", "*.eml")):
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
            })
            ids.append(f"eml-{fname}-{idx}")
    return docs, metas, ids


def ingest_pdfs():
    """Each PDF page -> chunked. Date pulled from metadata/header/body/filename."""
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(DATA_DIR, "pdf_src", "*.pdf")):
        reader = PdfReader(path)
        fname = os.path.basename(path)
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
                })
                ids.append(f"pdf-{fname}-{idx}-{c_idx}")
    return docs, metas, ids


def ingest_excel():
    """Each row across ALL sheets in an Excel workbook -> turned into a natural-language sentence."""
    docs, metas, ids = [], [], []
    for path in glob.glob(os.path.join(DATA_DIR, "*.xlsx")):
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
                            row_date = parse_date_string(str(row[d_key])) or str(row[d_key])
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
                    })
                    safe_sheet = re.sub(r"[^a-zA-Z0-9_-]", "_", str(sheet_name))
                    ids.append(f"xlsx-{fname}-{safe_sheet}-{row_idx}")
        except Exception as err:
            print(f"Warning: Failed to parse Excel file {fname}: {err}")
    return docs, metas, ids


def main():
    print(f"Loading embedding model '{EMBED_MODEL}'...")
    model = SentenceTransformer(EMBED_MODEL)

    client = chromadb.PersistentClient(path=DB_DIR)
    try:
        client.delete_collection("sme_knowledge_base")
    except Exception:
        pass
    collection = client.create_collection(
        name="sme_knowledge_base",
        metadata={"hnsw:space": "cosine"},
    )

    all_docs, all_metas, all_ids = [], [], []
    for fn in (ingest_emails, ingest_eml, ingest_pdfs, ingest_excel):
        d, m, i = fn()
        all_docs += d
        all_metas += m
        all_ids += i

    print(f"Encoding {len(all_docs)} chunks with sentence-transformers...")
    embeddings = model.encode(all_docs, show_progress_bar=True).tolist()

    # Clear + reload for idempotent re-runs during development
    existing = collection.get()["ids"]
    if existing:
        collection.delete(ids=existing)

    collection.add(documents=all_docs, metadatas=all_metas, ids=all_ids,
                    embeddings=embeddings)
    summary = {
        "status": "success",
        "total_chunks": len(all_docs),
        "breakdown": {
            t: sum(1 for m in all_metas if m["source_type"] == t)
            for t in {"email", "pdf", "excel"}
        },
        "source_files": sorted(list({m["source_name"] for m in all_metas}))
    }
    print(f"\nIngested {len(all_docs)} chunks from {len(summary['source_files'])} distinct files.")
    return summary


if __name__ == "__main__":
    main()
