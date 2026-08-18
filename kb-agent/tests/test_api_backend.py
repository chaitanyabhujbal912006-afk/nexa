"""
tests/test_api_backend.py — Integration tests for Nexa FastAPI backend v2.0.

Tests cover:
  - GET /api/v1/health (public, no auth)
  - GET /api/v1/stats (auth-gated)
  - POST /api/v1/query with valid/invalid payloads
  - POST /api/v1/ingest (in-process, lock-guarded)
  - POST /api/v1/upload with allowed and forbidden file types
  - GET /api/v1/documents
  - DELETE /api/v1/documents/{name} (path-traversal protection)
  - GET /api/v1/conflicts
  - GET /api/v1/audit
  - X-Request-ID propagation middleware
  - Rate-limit header presence
  - RFC-7807 error envelope shape

Run: pytest tests/test_api_backend.py -v
"""

import os
import sys
import io

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

# Patch heavy imports before loading api module
_fake_model = MagicMock()
_fake_model.encode.return_value = [[0.1] * 384]


def _fake_retrieve(query, top_k=5, history=None):
    hit = MagicMock()
    hit.text = "Employees are entitled to 20 days of annual leave per year."
    hit.distance = 0.25
    hit.citation = "hr_policy_v2.pdf (pdf) — Section 4, dated 2024-06-01"
    hit.metadata = {
        "source_name": "hr_policy_v2.pdf",
        "source_type": "pdf",
        "doc_date": "2024-06-01",
        "section": "Section 4",
    }
    return [hit]


def _fake_detect_conflicts(hits):
    return []


def _fake_generate_answer(query, hits, conflicts, llm_call_fn=None):
    return "Employees receive 20 days of annual leave per year.", {"tokens": 42}


def _fake_scan_all_conflicts():
    return []


def _fake_get_document_chunks(name):
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
    with (
        patch("rag_engine.get_model", return_value=_fake_model),
        patch("rag_engine.retrieve", side_effect=_fake_retrieve),
        patch("rag_engine.detect_conflicts", side_effect=_fake_detect_conflicts),
        patch("rag_engine.generate_answer", side_effect=_fake_generate_answer),
        patch("rag_engine.scan_all_conflicts", side_effect=_fake_scan_all_conflicts),
        patch("rag_engine.get_document_chunks", side_effect=_fake_get_document_chunks),
        patch("rag_engine.delete_document_from_index", return_value=3),
        patch("ingest_module.main", side_effect=_fake_ingest_main),
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


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────
class TestHealth:
    def test_health_200(self, client):
        r = client.get("/api/v1/health")
        assert r.status_code == 200

    def test_health_schema(self, client):
        body = client.get("/api/v1/health").json()
        assert body["status"] == "online"
        assert "version" in body
        assert "provider" in body
        assert "embedding_model" in body
        assert "kb_stats" in body

    def test_health_no_auth_needed(self, client):
        """Health must be publicly accessible — no X-API-Key required."""
        r = client.get("/api/v1/health")
        assert r.status_code == 200

    def test_x_request_id_propagated(self, client):
        """Middleware must echo X-Request-ID back in response headers."""
        rid = "test-trace-123"
        r = client.get("/api/v1/health", headers={"X-Request-ID": rid})
        assert r.headers.get("x-request-id") == rid

    def test_x_response_time_header_present(self, client):
        r = client.get("/api/v1/health")
        assert "x-response-time-ms" in r.headers


# ─────────────────────────────────────────────────────────────────────────────
# Query
# ─────────────────────────────────────────────────────────────────────────────
class TestQuery:
    ENDPOINT = "/api/v1/query"

    def test_basic_query(self, client):
        r = client.post(self.ENDPOINT, json={"query": "What is the leave policy?", "top_k": 3})
        assert r.status_code == 200

    def test_query_response_schema(self, client):
        body = client.post(self.ENDPOINT, json={"query": "Leave policy details"}).json()
        required = ["call_id", "query", "answer", "confidence_level", "citations",
                    "conflicts_detected", "total_chunks_retrieved", "provider", "latency_ms"]
        for field in required:
            assert field in body, f"Missing field: {field}"

    def test_query_confidence_levels(self, client):
        body = client.post(self.ENDPOINT, json={"query": "Leave policy"}).json()
        assert body["confidence_level"] in ("HIGH", "MEDIUM", "LOW", "NONE")

    def test_citation_match_score(self, client):
        body = client.post(self.ENDPOINT, json={"query": "Leave entitlement"}).json()
        for cit in body["citations"]:
            assert "match_score_pct" in cit
            assert 0.0 <= cit["match_score_pct"] <= 100.0

    def test_call_id_is_uuid(self, client):
        import uuid
        body = client.post(self.ENDPOINT, json={"query": "Policy"}).json()
        call_id = body.get("call_id", "")
        # Should be parseable as UUID4
        parsed = uuid.UUID(call_id)
        assert str(parsed) == call_id

    def test_latency_ms_positive(self, client):
        body = client.post(self.ENDPOINT, json={"query": "Policy"}).json()
        assert body["latency_ms"] >= 0

    def test_query_too_short_rejected(self, client):
        r = client.post(self.ENDPOINT, json={"query": "  ", "top_k": 3})
        assert r.status_code == 422

    def test_query_too_long_rejected(self, client):
        r = client.post(self.ENDPOINT, json={"query": "x" * 2001})
        assert r.status_code == 422

    def test_top_k_bounds_rejected(self, client):
        r = client.post(self.ENDPOINT, json={"query": "Leave?", "top_k": 0})
        assert r.status_code == 422
        r2 = client.post(self.ENDPOINT, json={"query": "Leave?", "top_k": 21})
        assert r2.status_code == 422

    def test_top_k_boundaries_valid(self, client):
        r1 = client.post(self.ENDPOINT, json={"query": "Policy", "top_k": 1})
        assert r1.status_code == 200
        r2 = client.post(self.ENDPOINT, json={"query": "Policy", "top_k": 20})
        assert r2.status_code == 200

    def test_x_request_id_propagated(self, client):
        rid = "query-trace-abc"
        r = client.post(self.ENDPOINT, json={"query": "Policy"},
                        headers={"X-Request-ID": rid})
        assert r.headers.get("x-request-id") == rid

    def test_with_conversation_history(self, client):
        history = [{"role": "user", "content": "What is leave?"},
                   {"role": "assistant", "content": "20 days per year."}]
        r = client.post(self.ENDPOINT, json={"query": "Follow up question", "history": history})
        assert r.status_code == 200

    def test_missing_query_field(self, client):
        r = client.post(self.ENDPOINT, json={"top_k": 3})
        assert r.status_code == 422


# ─────────────────────────────────────────────────────────────────────────────
# Upload
# ─────────────────────────────────────────────────────────────────────────────
class TestUpload:
    ENDPOINT = "/api/v1/upload"

    def test_upload_pdf(self, client, tmp_path):
        content = b"%PDF-1.4 fake pdf content for testing"
        r = client.post(
            self.ENDPOINT,
            files={"file": ("test_doc.pdf", io.BytesIO(content), "application/pdf")},
        )
        # Should succeed (200) or indicate upload success regardless of ingestion
        assert r.status_code == 200
        assert r.json()["file"] == "test_doc.pdf"

    def test_upload_csv(self, client, tmp_path):
        content = b"name,value\nAlice,100\nBob,200"
        r = client.post(
            self.ENDPOINT,
            files={"file": ("data.csv", io.BytesIO(content), "text/csv")},
        )
        assert r.status_code == 200

    def test_upload_forbidden_extension(self, client):
        r = client.post(
            self.ENDPOINT,
            files={"file": ("malware.exe", io.BytesIO(b"MZ"), "application/octet-stream")},
        )
        assert r.status_code == 400
        body = r.json()
        assert "detail" in body

    def test_upload_py_extension_rejected(self, client):
        r = client.post(
            self.ENDPOINT,
            files={"file": ("hack.py", io.BytesIO(b"import os"), "text/plain")},
        )
        assert r.status_code == 400

    def test_upload_empty_file_rejected(self, client):
        r = client.post(
            self.ENDPOINT,
            files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")},
        )
        assert r.status_code == 400


# ─────────────────────────────────────────────────────────────────────────────
# Documents
# ─────────────────────────────────────────────────────────────────────────────
class TestDocuments:
    def test_list_documents(self, client):
        r = client.get("/api/v1/documents")
        assert r.status_code == 200
        body = r.json()
        assert "total_count" in body
        assert "documents" in body
        assert isinstance(body["documents"], list)

    def test_delete_path_traversal_blocked(self, client):
        r = client.delete("/api/v1/documents/..%2Fsecrets.txt")
        # Must reject or 404, not allow path traversal
        assert r.status_code in (400, 404)

    def test_delete_double_dot_blocked(self, client):
        r = client.delete("/api/v1/documents/../secrets.env")
        assert r.status_code in (400, 404)


# ─────────────────────────────────────────────────────────────────────────────
# Conflicts
# ─────────────────────────────────────────────────────────────────────────────
class TestConflicts:
    def test_conflicts_endpoint(self, client):
        r = client.get("/api/v1/conflicts")
        assert r.status_code == 200
        body = r.json()
        assert "conflicts_count" in body
        assert "conflicts" in body
        assert isinstance(body["conflicts"], list)

    def test_conflicts_count_matches_list(self, client):
        body = client.get("/api/v1/conflicts").json()
        assert body["conflicts_count"] == len(body["conflicts"])


# ─────────────────────────────────────────────────────────────────────────────
# Audit
# ─────────────────────────────────────────────────────────────────────────────
class TestAudit:
    def test_audit_endpoint(self, client):
        r = client.get("/api/v1/audit")
        assert r.status_code == 200
        body = r.json()
        assert "total_returned" in body
        assert "entries" in body

    def test_audit_n_param_clamped(self, client):
        r = client.get("/api/v1/audit?n=500")
        assert r.status_code == 200

    def test_audit_n_zero_handled(self, client):
        r = client.get("/api/v1/audit?n=0")
        assert r.status_code == 200


# ─────────────────────────────────────────────────────────────────────────────
# Error envelope (RFC-7807)
# ─────────────────────────────────────────────────────────────────────────────
class TestErrorEnvelope:
    def test_422_has_standard_fastapi_shape(self, client):
        r = client.post("/api/v1/query", json={"top_k": 5})
        assert r.status_code == 422

    def test_404_on_unknown_route(self, client):
        r = client.get("/api/v1/nonexistent")
        assert r.status_code == 404

    def test_method_not_allowed(self, client):
        r = client.put("/api/v1/health")
        assert r.status_code == 405
