"""
Script to generate sample PDF documents for the Nexa knowledge base demo.
Run once: python generate_sample_pdfs.py
Requires: fpdf2 (already in requirements.txt)
"""
from fpdf import FPDF
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "data", "pdf_src")
os.makedirs(DATA_DIR, exist_ok=True)


def make_pdf(filename, title, date_str, sections):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, title, ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, f"Effective Date: {date_str}", ln=True)
    pdf.ln(4)
    for heading, body in sections:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, heading, ln=True)
        pdf.set_font("Helvetica", "", 10)
        pdf.multi_cell(0, 6, body)
        pdf.ln(3)
    pdf.output(os.path.join(DATA_DIR, filename))
    print(f"Created: {filename}")


# --- 1. Vendor Payment Policy v1.0 (superseded) ---
make_pdf(
    "vendor_payment_policy_v1.0.pdf",
    "Vendor Payment Policy v1.0",
    "2024-03-01",
    [
        ("Section 1: Standard Payment Terms",
         "All customer invoices are due Net 30 days from the invoice date. "
         "A 2% discount applies if payment is received within 10 days of invoice. "
         "No late fees will be charged within the first 60 days."),
        ("Section 2: Bulk Orders",
         "For bulk orders exceeding $10,000, Net 45 days terms are available "
         "upon written request and credit approval. Interest on overdue balances "
         "is waived for first-time bulk customers."),
        ("Section 3: Dispute Resolution",
         "Any invoice dispute must be raised within 14 days of receipt. "
         "Unresolved disputes are escalated to the Finance Manager."),
    ],
)

# --- 2. Vendor Payment Policy v2.0 (current, supersedes v1.0) ---
make_pdf(
    "vendor_payment_policy_v2.0.pdf",
    "Vendor Payment Policy v2.0",
    "2025-01-01",
    [
        ("Section 1: Standard Payment Terms",
         "Effective January 1 2025, all customer invoices are due Net 14 days "
         "from the invoice date. The previous Net 30 terms are no longer available. "
         "This policy supersedes all prior written and verbal payment agreements."),
        ("Section 2: Bulk Orders",
         "Bulk orders above $10,000 are subject to Net 21 day terms. "
         "The previously available Net 45 terms are discontinued. "
         "A 1.5% per month late payment fee applies to all overdue balances."),
        ("Section 3: Early Payment Discount",
         "The 2% early payment discount is discontinued effective January 1 2025. "
         "All discounts must be pre-approved in writing by the Finance Director."),
        ("Section 4: Dispute Resolution",
         "Invoice disputes must be raised within 7 days of receipt (previously 14 days). "
         "Disputes not raised within this window are deemed accepted by the customer."),
    ],
)

# --- 3. Warranty & Support Policy 2025 ---
make_pdf(
    "warranty_support_policy_2025.pdf",
    "Warranty and Support Policy 2025",
    "2025-01-15",
    [
        ("Section 1: Hardware Warranty",
         "All hardware products carry an 18-month manufacturer warranty from the date of delivery, "
         "updated from the previous 12-month period. Warranty covers defects in materials and "
         "workmanship under normal operating conditions. Accidental damage, liquid damage, and "
         "unauthorized modifications void the warranty."),
        ("Section 2: Software Warranty",
         "Software products include 12 months of bug-fix updates at no charge. "
         "Feature updates and major version upgrades require an active subscription."),
        ("Section 3: Support Plans",
         "Standard support: Mon-Fri 9am-6pm via email only. Response within 8 business hours. "
         "Premium support: 24/7 phone and email for $199/month per account (previously $299/month). "
         "Enterprise support: Dedicated account engineer, SLA-backed 1-hour response."),
        ("Section 4: Exclusions",
         "Warranty and support do not cover: consumable parts, third-party integrations, "
         "on-site labour, or data recovery services."),
    ],
)

print("\nAll sample PDFs generated successfully.")
