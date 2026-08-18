import pytest
from fastapi.testclient import TestClient
from api import app, _NEXA_API_KEY


@pytest.fixture
def client():
    return TestClient(app)


def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "provider" in data
    assert "kb_stats" in data
    assert "pdfs" in data["kb_stats"]


def test_query_endpoint(client):
    payload = {
        "query": "What is the refund policy?",
        "top_k": 3
    }
    headers = {"X-API-Key": _NEXA_API_KEY} if _NEXA_API_KEY else {}
    response = client.post("/api/v1/query", json=payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "What is the refund policy?"
    assert "answer" in data
    assert "confidence_level" in data
    assert "total_chunks_retrieved" in data


def test_list_documents_endpoint(client):
    headers = {"X-API-Key": _NEXA_API_KEY} if _NEXA_API_KEY else {}
    response = client.get("/api/v1/documents", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "documents" in data
    assert isinstance(data["documents"], list)


def test_conflicts_endpoint(client):
    headers = {"X-API-Key": _NEXA_API_KEY} if _NEXA_API_KEY else {}
    response = client.get("/api/v1/conflicts", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "conflicts_count" in data
    assert "conflicts" in data


def test_auth_otp_endpoints(client):
    res_otp = client.post("/api/v1/auth/otp", json={"email": "test@company.com"})
    assert res_otp.status_code == 200
    assert res_otp.json()["status"] == "otp_sent"

    res_verify = client.post("/api/v1/auth/verify", json={"email": "test@company.com", "code": "123456"})
    assert res_verify.status_code == 200
    assert "access_token" in res_verify.json()


def test_pdf_report_endpoint(client):
    payload = {
        "title": "Test Executive Report",
        "summary_text": "Summary of findings for testing.",
    }
    res = client.post("/api/v1/reports/pdf", json=payload)
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert len(res.content) > 500
