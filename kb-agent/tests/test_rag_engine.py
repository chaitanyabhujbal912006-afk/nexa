import pytest
from rag_engine import RetrievalResult, detect_conflicts, build_context_block, generate_answer


def test_retrieval_result_properties():
    res = RetrievalResult(
        text="Returns accepted within 15 days.",
        metadata={
            "source_name": "policy_v2.pdf",
            "source_type": "pdf",
            "section": "Section 4",
            "doc_date": "2024-12-01",
            "topic": "bulk_refund"
        },
        distance=0.15
    )
    assert res.date.year == 2024
    assert res.date.month == 12
    assert "policy_v2.pdf" in res.citation


def test_detect_conflicts_between_dated_sources():
    older = RetrievalResult(
        text="Bulk orders have a 45-day return window with $0 fee.",
        metadata={
            "source_name": "email_old.txt",
            "source_type": "email",
            "section": "chunk 1",
            "doc_date": "2024-11-03",
            "topic": "bulk_refund"
        },
        distance=0.2
    )
    newer = RetrievalResult(
        text="Bulk orders must be returned within 15 days with 10% fee.",
        metadata={
            "source_name": "policy_new.pdf",
            "source_type": "pdf",
            "section": "Section 4",
            "doc_date": "2024-12-01",
            "topic": "bulk_refund"
        },
        distance=0.1
    )

    hits = [newer, older]
    conflicts = detect_conflicts(hits)

    assert len(conflicts) == 1
    assert conflicts[0]["topic"] == "bulk_refund"
    assert conflicts[0]["trusted"].metadata["source_name"] == "policy_new.pdf"
    assert conflicts[0]["outdated"][0].metadata["source_name"] == "email_old.txt"


def test_build_context_block_formatting():
    hit = RetrievalResult(
        text="Test content",
        metadata={
            "source_name": "doc.pdf",
            "source_type": "pdf",
            "section": "Sec 1",
            "doc_date": "2024-01-01",
            "topic": "test"
        },
        distance=0.1
    )
    block = build_context_block([hit], [])
    assert "RETRIEVED SOURCES:" in block
    assert "[1] (doc.pdf (pdf) — Sec 1, dated 2024-01-01)" in block


def test_contextualize_query():
    from rag_engine import contextualize_query
    history = [
        {"role": "user", "content": "What is the refund policy for Acme Corp?"},
        {"role": "assistant", "content": "Acme Corp has a 15-day refund window."}
    ]
    follow_up = "Is there a restocking fee for it?"
    enriched = contextualize_query(follow_up, history)
    assert "Acme" in enriched or "refund" in enriched
    assert "restocking fee" in enriched

