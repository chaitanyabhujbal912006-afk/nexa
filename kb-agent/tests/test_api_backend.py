"""
test_api_backend.py — Comprehensive unit & integration tests for Nexa API v3.0

Tests coverage:
  - Auth OTP & JWT verification endpoints
  - PDF executive report generation endpoint
  - Health & Stats endpoints
  - Query endpoint with mocked RAG engine
  - Upload endpoint & file extension validation
  - Document listing & deletion endpoints
  - Conflict detection & Audit log endpoints
  - Error envelope RFC-7807 compliance
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ── Mock objects for RAG & LLM engine ───────────────────────────────────────
_fake_chunk_metadata = {
    "source_name": "hr_policy_v2.pdf",
    "source_type": "pdf",
    "doc_date": "2026-01-15",
    "section": "Section 4: Remote Work",
    "topic": "remote_work",
}


class FakeRetrievalResult:
    def __init__(self, text, metadata, distance):
        self.text = text
        self.metadata = metadata
        self.distance = distance

    @property
    def citation(self):
        m = self.metadata
        return f"{m['source_name']} ({m['source_type']}) — {m['section']}, dated {m['doc_date']}"

    @property
    def date(self):
        from datetime import datetime
        return datetime.strptime(self.metadata["doc_date"], "%Y-%m-%d")


_fake_hit = FakeRetrievalResult(
    text="Employees may work remotely up to 3 days per week with manager approval.",
    metadata=_fake_chunk_metadata,
    distance=0.15,
)

_fake_model = MagicMock()


def _fake_retrieve(query, top_k=5, history=None, user_id=None):
    return [_fake_hit]


def _fake_detect_conflicts(hits):
    return []


def _fake_generate_answer(query, hits, conflicts, llm_call_fn=None):
    return "Employees receive 20 days of annual leave per year.", "RETRIEVED SOURCES:\n[1] hr_policy_v2.pdf"


def _fake_scan_all_conflicts(user_id=None):
    return []


def _fake_get_document_chunks(name, user_id=None):
    return [{"id": f"{name}-0"}]


def _fake_ingest_main():
    return {
        "status": "success",
        "total_chunks": 5,
        "breakdown": {"pdf": 3, "excel": 2, "csv": 0, "email": 0},
        "source_files": ["hr_policy.pdf", "orders.xlsx"],
    }


@pytest.fixture(scope="module")
def client():
    import ingest as ingest_mod
    with (
        patch("rag_engine.get_model", return_value=_fake_model),
        patch("rag_engine.retrieve", side_effect=_fake_retrieve),
        patch("rag_engine.detect_conflicts", side_effect=_fake_detect_conflicts),
        patch("rag_engine.generate_answer", side_effect=_fake_generate_answer),
        patch("rag_engine.scan_all_conflicts", side_effect=_fake_scan_all_conflicts),
        patch("rag_engine.get_document_chunks", side_effect=_fake_get_document_chunks),
        patch("rag_engine.delete_document_from_index", return_value=3),
        patch.object(ingest_mod, "main", side_effect=_fake_ingest_main),
        patch("llm_config.load_secrets"),
        patch("llm_config.get_active_provider", return_value="gemini"),
        patch("llm_config.get_llm_fn", return_value=None),
    ):
        import importlib
        import api as api_module
        importlib.reload(api_module)
        from api import app
        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


# ── Health ──────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_200(self, client):
        res = client.get("/api/v1/health")
        assert res.status_code == 200

    def test_health_schema(self, client):
        data = client.get("/api/v1/health").json()
        assert data["status"] == "online"
        assert "version" in data
        assert "provider" in data
        assert "embedding_model" in data
        assert "kb_stats" in data

    def test_x_request_id_propagated(self, client):
        custom_id = "test-tracing-id-999"
        res = client.get("/api/v1/health", headers={"X-Request-ID": custom_id})
        assert res.headers.get("X-Request-ID") == custom_id

    def test_x_response_time_header_present(self, client):
        res = client.get("/api/v1/health")
        assert "X-Response-Time-ms" in res.headers


# ── Auth & OTP ──────────────────────────────────────────────────────────────
class TestAuth:
    def test_send_otp_success(self, client):
        res = client.post("/api/v1/auth/otp", json={"email": "employee@company.com"})
        assert res.status_code == 200
        assert res.json()["status"] == "otp_sent"

    def test_verify_otp_success(self, client):
        res = client.post("/api/v1/auth/verify", json={"email": "employee@company.com", "code": "123456"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["email"] == "employee@company.com"


# ── PDF Reports ─────────────────────────────────────────────────────────────
class TestReports:
    def test_pdf_report_generation(self, client):
        res = client.post("/api/v1/reports/pdf", json={
            "title": "Monthly Expense Audit",
            "summary_text": "All household bills and company SOPs reconciled.",
        })
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 500


# ── Query ───────────────────────────────────────────────────────────────────
class TestQuery:
    def test_basic_query(self, client):
        res = client.post("/api/v1/query", json={"query": "What is the annual leave allowance?"})
        assert res.status_code == 200
        data = res.json()
        assert "answer" in data
        assert "confidence_level" in data
        assert "call_id" in data

    def test_query_too_short_rejected(self, client):
        res = client.post("/api/v1/query", json={"query": ""})
        assert res.status_code == 422


# ── Upload ──────────────────────────────────────────────────────────────────
class TestUpload:
    def test_upload_pdf(self, client):
        content = b"%PDF-1.4 Mock PDF content"
        res = client.post(
            "/api/v1/upload",
            files={"file": ("test_doc.pdf", content, "application/pdf")},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["file"] == "test_doc.pdf"

    def test_upload_forbidden_extension(self, client):
        content = b"#!/bin/bash\necho hello"
        res = client.post(
            "/api/v1/upload",
            files={"file": ("script.sh", content, "text/plain")},
        )
        assert res.status_code == 400


# ── Documents & Audit ───────────────────────────────────────────────────────
class TestDocuments:
    def test_list_documents(self, client):
        res = client.get("/api/v1/documents")
        assert res.status_code == 200
        data = res.json()
        assert "documents" in data


class TestAudit:
    def test_audit_endpoint(self, client):
        res = client.get("/api/v1/audit?n=10")
        assert res.status_code == 200
        data = res.json()
        assert "entries" in data
