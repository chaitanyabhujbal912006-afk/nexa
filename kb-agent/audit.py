"""
audit.py — Structured append-only audit logger for Nexa.

Features:
  - Thread-safe append via threading.Lock
  - UTC ISO-8601 timestamps (timezone-aware)
  - Per-event call_id (UUID4) for tracing
  - Log rotation when file exceeds AUDIT_MAX_BYTES (default 10 MB)
  - Optional async-safe webhook dispatch with exponential backoff
  - Structured JSON schema with schema_version for forward compatibility
"""

import json
import logging
import os
import re
import time
import threading
import uuid
from datetime import datetime, timezone
from typing import List, Optional

logger = logging.getLogger("nexa.audit")

LOG_FILE = os.path.join(os.path.dirname(__file__), "data", "audit_log.jsonl")
AUDIT_MAX_BYTES = int(os.environ.get("AUDIT_MAX_BYTES", 10 * 1024 * 1024))  # 10 MB default
SCHEMA_VERSION = "2"

_write_lock = threading.Lock()


def _rotate_if_needed(log_path: str) -> None:
    """Rotate audit log when it exceeds AUDIT_MAX_BYTES, keeping last 5 archives."""
    if not os.path.isfile(log_path):
        return
    if os.path.getsize(log_path) < AUDIT_MAX_BYTES:
        return
    # Rotate: audit_log.jsonl -> audit_log.1.jsonl -> audit_log.2.jsonl ... max 5
    for i in range(4, 0, -1):
        src = log_path.replace(".jsonl", f".{i}.jsonl")
        dst = log_path.replace(".jsonl", f".{i + 1}.jsonl")
        if os.path.isfile(src):
            os.replace(src, dst)
    os.replace(log_path, log_path.replace(".jsonl", ".1.jsonl"))
    logger.info("Audit log rotated (exceeded %d bytes).", AUDIT_MAX_BYTES)


def _get_webhook_url() -> str:
    webhook_url = os.environ.get("NEXA_WEBHOOK_URL", "")
    if not webhook_url:
        try:
            import streamlit as st
            webhook_url = st.secrets.get("NEXA_WEBHOOK_URL", "")
        except Exception:
            pass
    return webhook_url


def _dispatch_webhook(entry: dict, retries: int = 2) -> None:
    """POST audit event to NEXA_WEBHOOK_URL with exponential backoff retries."""
    url = _get_webhook_url()
    if not url:
        return
    try:
        import requests
        payload = {
            "event": "nexa_qa_audit",
            "call_id": entry.get("call_id"),
            "timestamp": entry["timestamp"],
            "query": entry["query"],
            "has_conflict": bool(entry.get("conflicts_detected")),
            "conflicts": entry.get("conflicts_detected", []),
            "confidence_level": entry.get("confidence_level"),
        }
        for attempt in range(retries + 1):
            try:
                r = requests.post(url, json=payload, timeout=5)
                r.raise_for_status()
                return
            except Exception as exc:
                if attempt < retries:
                    time.sleep(0.5 * (2 ** attempt))
                else:
                    logger.warning("Webhook dispatch failed after %d attempts: %s", retries + 1, exc)
    except Exception as err:
        logger.warning("Webhook dispatch error: %s", err)


def _confidence_level(hits: list) -> str:
    if not hits:
        return "NONE"
    avg = sum(h.distance for h in hits) / len(hits)
    if avg <= 0.30:
        return "HIGH"
    if avg <= 0.55:
        return "MEDIUM"
    return "LOW"


def log_qa_event(
    query: str,
    answer: str,
    hits: list,
    conflicts: list,
    call_id: Optional[str] = None,
    latency_ms: Optional[float] = None,
    provider: Optional[str] = None,
) -> str:
    """
    Append a structured, UTC-timestamped Q&A audit entry.

    Args:
        query: The user's raw query string.
        answer: The generated answer string.
        hits: List of RetrievalResult objects.
        conflicts: List of conflict dicts from detect_conflicts().
        call_id: Optional trace ID (auto-generated UUID4 if not provided).
        latency_ms: Optional end-to-end processing time in milliseconds.
        provider: Optional LLM provider label string.

    Returns:
        The call_id used for this event (for correlation).
    """
    if call_id is None:
        call_id = str(uuid.uuid4())

    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

    entry = {
        "schema_version": SCHEMA_VERSION,
        "call_id": call_id,
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "query": query,
        "answer_preview": answer[:500] if answer else "",
        "confidence_level": _confidence_level(hits),
        "provider": provider or "unknown",
        "latency_ms": round(latency_ms, 2) if latency_ms is not None else None,
        "total_chunks_retrieved": len(hits),
        "citations": [
            {
                "source_name": h.metadata.get("source_name", ""),
                "source_type": h.metadata.get("source_type", ""),
                "doc_date": h.metadata.get("doc_date", ""),
                "section": h.metadata.get("section", ""),
                "match_score": round(max(0.0, 1.0 - float(h.distance)) * 100, 1),
            }
            for h in hits
        ],
        "conflicts_detected": [
            {
                "topic": c["topic"],
                "trusted": c["trusted"].citation,
                "trusted_date": c["trusted"].metadata.get("doc_date", "unknown"),
                "outdated": [
                    {"citation": o.citation, "date": o.metadata.get("doc_date", "unknown")}
                    for o in c.get("outdated", [])
                ],
            }
            for c in conflicts
        ],
        "flagged": query.startswith("[FLAGGED]"),
    }

    try:
        with _write_lock:
            _rotate_if_needed(LOG_FILE)
            with open(LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        if entry["conflicts_detected"] or entry["flagged"]:
            _dispatch_webhook(entry)

    except Exception as err:
        logger.error("Failed to write audit entry (call_id=%s): %s", call_id, err)

    return call_id


def read_recent_entries(n: int = 50) -> List[dict]:
    """
    Read the N most recent audit log entries (from tail of file).
    Returns parsed dicts, skipping malformed lines.
    """
    if not os.path.isfile(LOG_FILE):
        return []
    try:
        with _write_lock:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                lines = f.readlines()
        entries = []
        for line in reversed(lines):
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
            if len(entries) >= n:
                break
        return entries  # newest-first order
    except Exception as err:
        logger.error("Failed to read audit log: %s", err)
        return []
