import pytest
from ingest import parse_date_string, extract_email_date, sanitize_topic


def test_parse_date_string_standard():
    assert parse_date_string("2024-11-03") == "2024-11-03"
    assert parse_date_string("2024/11/03") == "2024-11-03"


def test_parse_date_string_written():
    assert parse_date_string("3 Nov 2024") == "2024-11-03"
    assert parse_date_string("November 3, 2024") == "2024-11-03"


def test_parse_date_string_pdf_meta():
    assert parse_date_string("D:20241201120000Z") == "2024-12-01"


def test_extract_email_date_header():
    content = "From: test@example.com\nDate: Sun, 3 Nov 2024 10:00:00 +0000\nSubject: Test"
    assert extract_email_date(content) == "2024-11-03"


def test_sanitize_topic():
    assert sanitize_topic("Section 4: Refund Policy!") == "section_4_refund_policy"
    assert sanitize_topic("") == "general"
