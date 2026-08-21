"""
test_real_world_cases.py — Comprehensive real-world test suite for Nexa.

Validates date parsing across 15+ real-world date formats, qualitative & quantitative
conflict resolution, CSV ingestion, multi-encoding text handling, sentence-boundary chunking,
and end-to-end RAG output formatting.
"""

import os
import tempfile
from datetime import datetime
import pandas as pd
import pytest

from ingest import (
    parse_date_string,
    chunk_text,
    read_file_text_safe,
    ingest_csv,
    sanitize_topic
)
from rag_engine import (
    RetrievalResult,
    detect_conflicts,
    generate_answer,
    build_context_block
)


# =====================================================================
# 1. Real-World Date Parsing Tests (15+ formats)
# =====================================================================

@pytest.mark.parametrize("raw_input,expected", [
    ("2024-11-03", "2024-11-03"),
    ("2024/11/03", "2024-11-03"),
    ("2024.11.03", "2024-11-03"),
    ("2024-11-03T14:30:00Z", "2024-11-03"),
    ("2024-11-03 09:15:00", "2024-11-03"),
    ("D:20241201120000Z", "2024-12-01"),
    ("Sun, 03 Nov 2024 14:00:00 +0000", "2024-11-03"),
    ("15th March 2024", "2024-03-15"),
    ("3rd Nov 2024", "2024-11-03"),
    ("1st Jan 2025", "2025-01-01"),
    ("22nd October 2024", "2024-10-22"),
    ("Jan. 15, 2024", "2024-01-15"),
    ("Nov. 3rd, 2024", "2024-11-03"),
    ("October 24, 2025", "2025-10-24"),
    (pd.Timestamp("2025-01-01 12:00:00"), "2025-01-01"),
    (datetime(2024, 6, 15), "2024-06-15"),
])
def test_real_world_date_formats(raw_input, expected):
    parsed = parse_date_string(raw_input)
    assert parsed == expected, f"Failed to parse date input: '{raw_input}', got '{parsed}'"


def test_invalid_date_graceful_fallback():
    assert parse_date_string(None) is None
    assert parse_date_string("") is None
    assert parse_date_string("invalid text string without dates") is None


# =====================================================================
# 2. Sentence-Boundary Chunking Tests
# =====================================================================

def test_sentence_boundary_chunking():
    prose = (
        "All customer invoices are due Net 14 days from invoice date. "
        "A 1.5% late payment fee applies to overdue balances. "
        "Disputes must be raised within 7 days. "
        "This policy supersedes all prior agreements issued before Jan 2025."
    )
    chunks = chunk_text(prose, chunk_size=30, overlap=10)
    assert len(chunks) >= 1
    for chunk in chunks:
        assert len(chunk.strip()) > 0
        assert not chunk.startswith(".")


# =====================================================================
# 3. Multi-Encoding File Reading Tests
# =====================================================================

def test_safe_encoding_file_reader(tmp_path):
    p1 = tmp_path / "utf8_bom.txt"
    p1.write_bytes("Effective Date: 2025-01-01\nPolicy: Net 14 days".encode("utf-8-sig"))
    text1 = read_file_text_safe(str(p1))
    assert "Net 14 days" in text1

    p2 = tmp_path / "cp1252.txt"
    p2.write_bytes("Vendor payment terms: €500 fee applies. Effective: 2024-10-01".encode("cp1252"))
    text2 = read_file_text_safe(str(p2))
    assert "Effective: 2024-10-01" in text2


# =====================================================================
# 4. Qualitative & Quantitative Policy Conflict Detection Tests
# =====================================================================

def test_detect_payment_terms_conflict():
    r1 = RetrievalResult(
        text="Standard payment terms: Net 30 days from invoice date. 2% discount within 10 days.",
        metadata={"source_name": "vendor_policy_v1.pdf", "doc_date": "2024-03-01", "topic": "payment_terms", "source_type": "pdf"},
        distance=0.1
    )
    r2 = RetrievalResult(
        text="Effective Jan 1 2025, payment terms are Net 14 days. The previous Net 30 terms are discontinued.",
        metadata={"source_name": "vendor_policy_v2.pdf", "doc_date": "2025-01-01", "topic": "payment_terms", "source_type": "pdf"},
        distance=0.08
    )

    conflicts = detect_conflicts([r1, r2])
    assert len(conflicts) == 1
    c = conflicts[0]
    assert c["topic"] == "payment_terms"
    assert c["trusted"].metadata["source_name"] == "vendor_policy_v2.pdf"
    assert c["outdated"][0].metadata["source_name"] == "vendor_policy_v1.pdf"


def test_detect_warranty_duration_conflict():
    r1 = RetrievalResult(
        text="Hardware products carry a 12-month manufacturer warranty from delivery date.",
        metadata={"source_name": "warranty_2023.txt", "doc_date": "2023-01-01", "topic": "warranty", "source_type": "email"},
        distance=0.12
    )
    r2 = RetrievalResult(
        text="All hardware products carry an 18-month manufacturer warranty, updated from 12-month period.",
        metadata={"source_name": "warranty_2025.pdf", "doc_date": "2025-01-15", "topic": "warranty", "source_type": "pdf"},
        distance=0.09
    )

    conflicts = detect_conflicts([r1, r2])
    assert len(conflicts) == 1
    c = conflicts[0]
    assert c["trusted"].metadata["source_name"] == "warranty_2025.pdf"


def test_no_false_conflict_on_corroborating_documents():
    r1 = RetrievalResult(
        text="Bulk refund policy: 15 days return window, 10% restocking fee applies.",
        metadata={"source_name": "policy_summary.pdf", "doc_date": "2024-12-01", "topic": "refund_policy", "source_type": "pdf"},
        distance=0.1
    )
    r2 = RetrievalResult(
        text="Bulk refunds require 15 days notice and 10% restocking fee.",
        metadata={"source_name": "faq_doc.pdf", "doc_date": "2024-12-05", "topic": "refund_policy", "source_type": "pdf"},
        distance=0.11
    )

    conflicts = detect_conflicts([r1, r2])
    assert len(conflicts) == 0


# =====================================================================
# 5. CSV Ingestion Pipeline Test
# =====================================================================

def test_csv_ingestion_pipeline(tmp_path, monkeypatch):
    csv_dir = tmp_path / "data"
    csv_dir.mkdir()
    csv_file = csv_dir / "pricing_orders.csv"

    df = pd.DataFrame([
        {"Client": "Acme Corp", "Order Date": "2024-11-03", "Amount": "$5000", "Terms": "Net 30"},
        {"Client": "Beta Inc", "Order Date": "2025-01-15", "Amount": "$12000", "Terms": "Net 14"},
    ])
    df.to_csv(csv_file, index=False)

    import ingest
    monkeypatch.setattr(ingest, "DATA_DIR", str(csv_dir))

    docs, metas, ids = ingest_csv()
    assert len(docs) == 2
    assert metas[0]["source_type"] == "csv"
    assert metas[0]["doc_date"] == "2024-11-03"
    assert metas[1]["doc_date"] == "2025-01-15"
    assert "Acme Corp" in docs[0]


# =====================================================================
# 6. RAG Answer Generation & Context Block Formatting
# =====================================================================

def test_generate_answer_with_conflict_resolution():
    r_old = RetrievalResult(
        text="Net 45 terms are available for Acme Corp. $0 fee.",
        metadata={"source_name": "email_old.txt", "source_type": "email", "section": "chunk 1", "doc_date": "2024-11-03", "topic": "acme_terms"},
        distance=0.15
    )
    r_new = RetrievalResult(
        text="Effective Dec 1 2024, Acme Corp terms are Net 14 days with 10% fee.",
        metadata={"source_name": "policy_v2.pdf", "source_type": "pdf", "section": "Section 2", "doc_date": "2024-12-01", "topic": "acme_terms"},
        distance=0.08
    )

    conflicts = detect_conflicts([r_new, r_old])
    def mock_llm(sys_p, user_p):
        return "⚠️ Conflict detected on acme_terms between policy_v2.pdf and email_old.txt."

    answer, context = generate_answer("What are the payment terms for Acme Corp?", [r_new, r_old], conflicts, llm_call_fn=mock_llm)

    assert "Conflict" in answer or "conflict" in answer.lower()
    assert "DETECTED CONFLICTS" in context
