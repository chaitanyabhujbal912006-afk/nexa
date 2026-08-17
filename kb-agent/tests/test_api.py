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
    assert "total_pdfs" in data
    assert "total_sheets" in data
    assert "total_emails" in data


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
