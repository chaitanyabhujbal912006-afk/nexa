import pytest
from rag_engine import RetrievalResult, detect_conflicts, build_context_block, generate_answer


def _make_hit(text, source_name="policy.pdf", topic="refund", doc_date="2024-12-01", distance=0.15):
    return RetrievalResult(
        text=text,
        metadata={
            "source_name": source_name,
            "source_type": "pdf",
            "section": "Section 1",
            "doc_date": doc_date,
            "topic": topic,
        },
        distance=distance,
    )


def test_retrieval_result_properties():
    res = _make_hit("Returns accepted within 15 days.", source_name="policy_v2.pdf")
    assert res.date.year == 2024
    assert res.date.month == 12
    assert "policy_v2.pdf" in res.citation


def test_detect_conflicts_between_dated_sources():
    older = _make_hit(
        "Bulk orders have a 45-day return window with $0 fee.",
        source_name="email_old.txt", doc_date="2024-11-03", distance=0.2,
    )
    newer = _make_hit(
        "Bulk orders must be returned within 15 days with 10% fee.",
        source_name="policy_new.pdf", doc_date="2024-12-01", distance=0.1,
    )
    conflicts = detect_conflicts([newer, older])
    assert len(conflicts) == 1
    assert conflicts[0]["topic"] == "refund"
    assert conflicts[0]["trusted"].metadata["source_name"] == "policy_new.pdf"
    assert conflicts[0]["outdated"][0].metadata["source_name"] == "email_old.txt"


def test_build_context_block_formatting():
    hit = _make_hit("Test content", source_name="doc.pdf", doc_date="2024-01-01")
    block = build_context_block([hit], [])
    assert "RETRIEVED SOURCES:" in block
    assert "doc.pdf" in block


def test_contextualize_query():
    from rag_engine import contextualize_query
    history = [
        {"role": "user", "content": "What is the refund policy for Acme Corp?"},
        {"role": "assistant", "content": "Acme Corp has a 15-day refund window."}
    ]
    enriched = contextualize_query("Is there a restocking fee for it?", history)
    assert "Acme" in enriched or "refund" in enriched
    assert "restocking fee" in enriched


def test_get_document_chunks_returns_empty_for_unknown():
    from rag_engine import get_document_chunks
    chunks = get_document_chunks("non_existent_file.pdf")
    assert isinstance(chunks, list)
    assert len(chunks) == 0


# ── New tests for honest error messages ──────────────────────────────────────

def test_generate_answer_no_hits_returns_clear_message():
    answer, ctx = generate_answer("What is the refund policy?", hits=[], conflicts=[], llm_call_fn=None)
    assert "couldn't find" in answer.lower() or "no" in answer.lower()
    assert "knowledge base" in answer.lower()


def test_generate_answer_no_llm_configured_returns_honest_message():
    hit = _make_hit("Refunds allowed within 30 days.")
    answer, ctx = generate_answer("What is the refund policy?", hits=[hit], conflicts=[], llm_call_fn=None)
    # Should NOT silently dump raw text — must tell user LLM is missing
    assert "GROQ_API_KEY" in answer or "GEMINI_API_KEY" in answer or "not configured" in answer.lower()


def test_generate_answer_llm_failure_returns_honest_error():
    def failing_llm(sys_p, user_p):
        raise RuntimeError("API rate limit exceeded")

    hit = _make_hit("Refunds allowed within 30 days.")
    answer, ctx = generate_answer("What is the refund policy?", hits=[hit], conflicts=[], llm_call_fn=failing_llm)
    # Must NOT return raw text dump — must be an honest error
    assert "unavailable" in answer.lower() or "error" in answer.lower() or "api" in answer.lower()
    assert "Refunds allowed within 30 days." not in answer  # raw text should NOT leak


def test_generate_answer_greeting_returns_hello():
    answer, ctx = generate_answer("Hello!", hits=[], conflicts=[], llm_call_fn=None)
    assert "Nexa" in answer
    assert ctx == ""


def test_generate_answer_thank_you():
    answer, ctx = generate_answer("Thanks!", hits=[], conflicts=[], llm_call_fn=None)
    assert "welcome" in answer.lower()


def test_generate_answer_llm_success_returns_llm_output():
    def mock_llm(sys_p, user_p):
        return "The refund window is 30 days per [1]."

    hit = _make_hit("Refunds allowed within 30 days.")
    answer, ctx = generate_answer("What is the refund policy?", hits=[hit], conflicts=[], llm_call_fn=mock_llm)
    assert answer == "The refund window is 30 days per [1]."
    assert "RETRIEVED SOURCES:" in ctx
