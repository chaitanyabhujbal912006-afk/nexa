# ⚡ Nexa — SME Knowledge Retrieval Agent

Nexa is an enterprise-grade, conflict-aware RAG (Retrieval-Augmented Generation) agent designed for SMEs. It unifies scattered business knowledge across PDFs, multi-sheet Excel spreadsheets, `.txt`, and raw `.eml` emails into one cited conversational assistant.

![Nexa Banner](https://img.shields.io/badge/Nexa-v2.0-indigo?style=for-the-badge&logo=lightning)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![LLM Support](https://img.shields.io/badge/LLM-Groq%20%7C%20Gemini-emerald?style=for-the-badge)

---

## 🏢 Real-World Use Case & Scenario

### The Problem in SME Operations
A customer support representative receives a call from a key client (**Acme Corp**) demanding a full refund and 45-day payment terms based on an old sales email from November. Unbeknownst to the representative, operations issued an updated company policy PDF in December (15-day refund window, 10% restocking fee). 

Searching across scattered emails, pricing sheets, and PDF folders manually leads to inconsistent answers, lost revenue, or customer disputes.

### How Nexa Solves It in Seconds

1. **Natural Question:** The representative asks:  
   > *"What is our refund policy and payment terms for bulk orders quoted to Acme Corp?"*

2. **Conflict Resolution Output:** Nexa searches across all document formats, compares dates, detects contradictions, and outputs:
   ```markdown
   ⚠️ Conflict Detected on bulk_refund_policy:
   • Superseded Source: email_2024-11-03_acme_refund.txt (Nov 3, 2024) — promised 45-day return window & $0 fee.
   • Trusted Source (Most Recent): refund_policy_v2.1.pdf (Dec 1, 2024) — effective Dec 1, 2024.

   Trusted Answer:
   For bulk orders, returns must be initiated within 15 days of delivery [1]. A 10% restocking fee
   applies to all processed returns [1]. The December policy PDF explicitly states that its terms
   supersede all previous email quotes issued prior to Dec 1, 2024 [1].

   Citations Used:
   📄 refund_policy_v2.1.pdf (pdf) — Section 4: Bulk Order Refunds, dated 2024-12-01
   ✉️ email_2024-11-03_acme_refund.txt (email) — chunk 1, dated 2024-11-03
   ```

3. **Instant Ticket Creation:** The representative clicks **"Create CRM Ticket ➜"** to generate an audit-logged support ticket ready for client response.

---

## 🌟 Key Features

- **📄 Multi-Format Document Ingestion:** Native support for PDFs (with OCR fallback for scanned images), multi-sheet `.xlsx` workbooks (row-to-sentence conversion), `.txt`, and raw `.eml` email files.
- **🧠 Dense Semantic Search:** Powered by `sentence-transformers/all-MiniLM-L6-v2` (384-dim) vector embeddings stored in a local ChromaDB index.
- **📅 Dynamic Date & Conflict Engine:** Standardizes document dates from email headers, PDF metadata, and document text. Automatically flags policy contradictions between older and newer sources, trusting the latest date.
- **⚖️ Quantitative & Qualitative Conflict Resolution:** Detects both numeric disagreements ($ amounts, %, day counts) AND qualitative policy terms (*"non-refundable"*, *"all sales final"*, *"no fee"*).
- **🎫 CRM Ticket Studio:** Integrated workspace for auto-populating support response tickets directly from cited answers.
- **🛡️ Audit Trail & Feedback System:** Persistent logging to `data/audit_log.jsonl` with interactive Q&A history analytics and one-click answer flagging.

---

## 📱 Mobile App & On-the-Go Access

Nexa is **100% mobile-responsive** out of the box for smartphones and tablets:

### Option A: Progressive Web App (PWA) / Mobile Web (Zero Setup)
1. Open the deployed Nexa URL (e.g., `https://nexa.streamlit.app`) on Safari (iOS) or Chrome (Android).
2. Tap **Share → "Add to Home Screen"**.
3. **Nexa launches as a native full-screen mobile application** directly from your phone's home screen!

### Option B: Native Mobile App API Integration
Nexa's `rag_engine.py` can be mounted behind a lightweight **FastAPI backend**, allowing native **Flutter** or **React Native** iOS/Android apps to tap into Nexa for mobile camera document scanning (OCR on paper contracts) and voice assistant queries.

---

## 🏗️ Architecture Overview

```
data/pdf_src/*.pdf   ─┐
data/*.xlsx          ─┼─► ingest.py ──► SentenceTransformers (384-dim) ──► ChromaDB
data/emails/*.eml    ─┘        (source, doc_date, section, dynamic_topic)
                                                 │
Question ──► app.py ──► rag_engine.retrieve() ──► rag_engine.detect_conflicts()
                                                 │
                                     call_llm() (Groq / Gemini) ──► Cited Answer + Audit Log
```

---

## 🚀 Quickstart (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chaitanyabhujbal912006-afk/nexa.git
   cd nexa/kb-agent
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure API Key (Free Tier):**
   Create a `.streamlit/secrets.toml` file inside `kb-agent/`:
   ```toml
   GROQ_API_KEY = "gsk_your_groq_api_key_here"
   ```

4. **Run ingestion & start the app:**
   ```bash
   python ingest.py
   streamlit run app.py
   ```

---

## ☁️ Streamlit Cloud Deployment (100% Free)

1. Push your changes to GitHub.
2. Go to **[share.streamlit.io](https://share.streamlit.io)** → **New App**.
3. Select repo `chaitanyabhujbal912006-afk/nexa` and set Main file path to `kb-agent/app.py`.
4. Add your `GROQ_API_KEY` under **Settings → Secrets**.
5. Click **Deploy**!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
