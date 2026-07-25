"""
Audit logging module for Nexa.
Logs every question, generated answer, citations used, and conflicts detected to
an append-only JSONL file for compliance and quality tracking.
"""

import os
import json
from datetime import datetime

LOG_FILE = os.path.join(os.path.dirname(__file__), "data", "audit_log.jsonl")


def log_qa_event(query: str, answer: str, hits: list, conflicts: list):
    """Appends a structured log entry for every Q&A turn."""
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "answer": answer,
        "citations": [
            {
                "citation": h.citation,
                "source_name": h.metadata.get("source_name"),
                "source_type": h.metadata.get("source_type"),
                "doc_date": h.metadata.get("doc_date"),
            }
            for h in hits
        ],
        "conflicts_detected": [
            {
                "topic": c["topic"],
                "trusted": c["trusted"].citation,
                "outdated": [o.citation for o in c.get("outdated", [])],
            }
            for c in conflicts
        ],
    }

    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as err:
        print(f"Warning: Failed to write to audit log: {err}")
