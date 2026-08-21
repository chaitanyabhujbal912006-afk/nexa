"""
Nexa — SME Knowledge Agent Engine (Streamlit Frontend v2.0)
Lutra UI inspired design system + WCAG 2.1 AA/AAA accessibility.
"""

import os
import sys

# Force UTF-8 output on Windows to prevent UnicodeEncodeError with emoji
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

import glob
import html
import json
import threading
from datetime import datetime

# Ensure kb-agent folder is on Python path regardless of execution root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import streamlit as st
import pandas as pd

from rag_engine import (
    retrieve,
    detect_conflicts,
    generate_answer,
    delete_document_from_index,
    scan_all_conflicts,
    get_document_chunks,
    build_context_block,
    SYSTEM_PROMPT,
)
from llm_config import load_secrets, get_active_provider, get_llm_fn

# ── Streamlit Page Configuration ───────────────────────────────────────────────
st.set_page_config(
    page_title="Nexa — SME Knowledge Agent",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

load_secrets()

# ── Concurrency Lock ──────────────────────────────────────────────────────────
_ingest_lock = threading.Lock()

# ── LUTRA UI INSPIRED DESIGN SYSTEM (CSS) ──────────────────────────────────────
st.markdown("""<style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap');

:root {
  --lutra-hue: 245deg;
  --lutra-primary: #6366f1;
  --lutra-primary-hover: #4f46e5;
  --lutra-accent: #10b981;
  --lutra-amber: #f59e0b;
  --lutra-rose: #f43f5e;
  
  --bg-dark: #090d16;
  --bg-card: rgba(19, 27, 46, 0.75);
  --bg-card-hover: rgba(27, 38, 64, 0.85);
  --bg-sidebar: rgba(13, 19, 33, 0.95);
  
  --border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --border-glow: 1px solid rgba(99, 102, 241, 0.35);
  --border-amber: 1px solid rgba(245, 158, 11, 0.4);
  
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --text-subtle: #64748b;
  
  --shadow-main: 0 12px 32px 0 rgba(0, 0, 0, 0.45);
  --glass-blur: blur(20px) saturate(180%);
}

/* Global Reset & Body Background */
.stApp {
    background: radial-gradient(circle at 50% 0%, #151d33 0%, #090d16 70%) !important;
    font-family: 'Inter', sans-serif !important;
    color: var(--text-main) !important;
}

/* High Contrast Mode */
.stApp.high-contrast {
    background: #000000 !important;
    color: #ffffff !important;
}
.stApp.high-contrast * {
    border-color: #ffffff !important;
}

/* Large Text Mode */
.stApp.large-text p, .stApp.large-text span, .stApp.large-text div {
    font-size: 1.1rem !important;
}

/* Reduced Motion Mode */
.stApp.reduced-motion * {
    animation: none !important;
    transition: none !important;
}

/* Hide Default Header Decoration */
header[data-testid="stHeader"] {
    background: transparent !important;
}

/* ── HERO BANNER ───────────────────────────────────────────────────────────── */
.nx-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, rgba(244, 63, 94, 0.06) 100%) !important;
    border: var(--border-glow) !important;
    border-radius: 20px !important;
    padding: 32px 40px !important;
    margin-bottom: 24px !important;
    backdrop-filter: var(--glass-blur) !important;
    box-shadow: var(--shadow-main), 0 0 40px rgba(99, 102, 241, 0.12) !important;
}
.nx-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(99, 102, 241, 0.2) !important;
    border: 1px solid rgba(129, 140, 248, 0.4) !important;
    color: #a5b4fc;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: 'Fira Code', monospace !important;
    margin-bottom: 12px;
}
.nx-hero-badge .dot {
    width: 6px;
    height: 6px;
    background: #a5b4fc;
    border-radius: 50%;
    animation: pulse-dot 1.5s infinite;
}
@keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.nx-hero h1 {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 2.5rem !important;
    font-weight: 700 !important;
    background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #818cf8 100%);
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    margin: 0 0 10px 0 !important;
    line-height: 1.1 !important;
}
.nx-hero p {
    color: var(--text-muted);
    font-size: 0.95rem;
    line-height: 1.6;
    max-width: 680px;
    margin: 0;
}
.nx-provider-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.15) !important;
    border: 1px solid rgba(16, 185, 129, 0.4) !important;
    color: #34d399;
    padding: 5px 14px;
    border-radius: 100px;
    font-size: 0.72rem;
    font-family: 'Fira Code', monospace !important;
    font-weight: 600;
    margin-top: 16px;
}
.nx-provider-status .live-dot {
    width: 7px;
    height: 7px;
    background: #34d399;
    border-radius: 50%;
    box-shadow: 0 0 8px #34d399;
}

/* ── BENTO METRIC CARDS ────────────────────────────────────────────────────── */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 16px 0;
}
.bento-card {
    background: var(--bg-card) !important;
    border: var(--border-subtle) !important;
    border-radius: 14px !important;
    padding: 16px !important;
    text-align: center;
    backdrop-filter: var(--glass-blur) !important;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.bento-card:hover {
    border-color: rgba(99, 102, 241, 0.5) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2) !important;
}
.bento-card .num {
    font-family: 'Space Grotesk', sans-serif !important;
    font-size: 1.7rem;
    font-weight: 700;
    color: #818cf8;
    display: block;
    line-height: 1.1;
}
.bento-card .lbl {
    font-size: 0.65rem;
    color: var(--text-subtle);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-family: 'Fira Code', monospace !important;
    margin-top: 4px;
}

/* ── SIDEBAR STYLING ───────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background-color: var(--bg-sidebar) !important;
    border-right: var(--border-subtle) !important;
}
.doc-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    border: var(--border-subtle) !important;
    background: rgba(255, 255, 255, 0.02) !important;
    margin-bottom: 6px;
    transition: all 0.2s ease;
}
.doc-item:hover {
    border-color: rgba(99, 102, 241, 0.4) !important;
    background: rgba(99, 102, 241, 0.1) !important;
    transform: translateX(2px);
}
.doc-icon { font-size: 1rem; flex-shrink: 0; }
.doc-name {
    font-size: 0.75rem;
    font-family: 'Fira Code', monospace;
    color: #c7d2fe !important;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
}
.doc-date {
    font-size: 0.65rem;
    color: var(--text-subtle);
    font-family: 'Fira Code', monospace;
}

/* ── CHAT MESSAGES & CONTAINERS ───────────────────────────────────────────── */
[data-testid="stChatMessage"] {
    background: transparent !important;
    border: none !important;
    color: var(--text-main) !important;
}
[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
    background: rgba(99, 102, 241, 0.12) !important;
    border: var(--border-subtle) !important;
    border-radius: 16px !important;
    padding: 16px 20px !important;
    margin: 12px 0 !important;
    backdrop-filter: var(--glass-blur) !important;
}
[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-assistant"]) {
    background: rgba(19, 27, 46, 0.8) !important;
    border: var(--border-subtle) !important;
    border-radius: 16px !important;
    padding: 18px 22px !important;
    margin: 12px 0 !important;
    backdrop-filter: var(--glass-blur) !important;
    box-shadow: var(--shadow-main) !important;
}

/* ── CONFLICT BANNER ───────────────────────────────────────────────────────── */
.nx-conflict {
    background: rgba(245, 158, 11, 0.08) !important;
    border: var(--border-amber) !important;
    border-radius: 14px !important;
    padding: 16px 20px !important;
    margin: 14px 0 !important;
    backdrop-filter: blur(12px) !important;
}
.nx-conflict-title {
    color: #fbbf24;
    font-weight: 700;
    font-size: 0.85rem;
    font-family: 'Fira Code', monospace;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.nx-conflict-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.8rem;
    color: #e2e8f0;
    margin-top: 6px;
}
.nx-tag {
    font-size: 0.62rem;
    font-family: 'Fira Code', monospace;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 100px;
    letter-spacing: 0.08em;
}
.nx-tag.trusted {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.4);
}
.nx-tag.outdated {
    background: rgba(244, 63, 94, 0.2);
    color: #fb7185;
    border: 1px solid rgba(244, 63, 94, 0.4);
}

/* ── CITATION PILLS ────────────────────────────────────────────────────────── */
.nx-citations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
}
.nx-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.04);
    border: var(--border-subtle);
    color: #cbd5e1;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 0.72rem;
    font-family: 'Fira Code', monospace;
    transition: all 0.2s ease;
}
.nx-pill:hover {
    border-color: rgba(99, 102, 241, 0.5);
    background: rgba(99, 102, 241, 0.15);
}
.nx-match-score {
    font-size: 0.62rem;
    background: rgba(0, 0, 0, 0.3);
    color: #a5b4fc;
    padding: 1px 7px;
    border-radius: 100px;
    font-weight: 600;
}

/* ── CUSTOM TAB STYLING ────────────────────────────────────────────────────── */
.stTabs [data-baseweb="tab-list"] {
    gap: 8px !important;
    background: transparent !important;
    padding: 4px 0 !important;
    border-bottom: var(--border-subtle) !important;
}
.stTabs [data-baseweb="tab"] {
    background: rgba(255, 255, 255, 0.03) !important;
    border: var(--border-subtle) !important;
    border-radius: 12px 12px 0 0 !important;
    color: var(--text-muted) !important;
    font-family: 'Fira Code', monospace !important;
    font-size: 0.78rem !important;
    font-weight: 600 !important;
    padding: 10px 20px !important;
    transition: all 0.2s ease !important;
}
.stTabs [aria-selected="true"] {
    background: rgba(99, 102, 241, 0.2) !important;
    border-color: rgba(99, 102, 241, 0.5) !important;
    color: #ffffff !important;
}

/* ── BUTTON STYLING ────────────────────────────────────────────────────────── */
.stButton > button {
    border-radius: 10px !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 600 !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
    border: none !important;
    color: #ffffff !important;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3) !important;
}
.stButton > button[kind="primary"]:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45) !important;
}

/* ── AUDIT LOG ENTRY CARD ─────────────────────────────────────────────────── */
.nx-audit-entry {
    background: rgba(19, 27, 46, 0.6);
    border: var(--border-subtle);
    border-radius: 12px;
    padding: 14px 18px;
    margin-bottom: 10px;
}
.nx-audit-time {
    font-family: 'Fira Code', monospace;
    font-size: 0.68rem;
    color: var(--text-subtle);
}
.nx-audit-query {
    font-weight: 600;
    color: #f1f5f9;
    font-size: 0.88rem;
    margin-top: 4px;
}
</style>""", unsafe_allow_html=True)

# ── HELPER FUNCTIONS ──────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
KNOWN_CLIENTS = ["acme", "beta", "gamma", "delta", "alpha"]

def _match_score(distance) -> int:
    if distance is None:
        return 0
    sim = max(0.0, min(1.0, 1.0 - float(distance)))
    return int(sim * 100)

def _confidence_label(hits):
    if not hits:
        return "N/A", "#64748b"
    avg = sum(h.distance for h in hits) / len(hits)
    if avg <= 0.30:
        return "HIGH", "#34d399"
    if avg <= 0.55:
        return "MEDIUM", "#fbbf24"
    return "LOW", "#f87171"

def _build_history_context(history, max_turns=3):
    pairs = []
    i = 0
    while i < len(history) - 1:
        if history[i]["role"] == "user" and history[i+1]["role"] == "assistant":
            pairs.append((history[i]["content"], history[i+1]["content"]))
            i += 2
        else:
            i += 1
    recent = pairs[-max_turns:]
    if not recent:
        return ""
    lines = ["PREVIOUS CONVERSATION TURNS (for context only, do not re-cite unless the user asks):\n"]
    for u, a in recent:
        lines.append(f"User: {u[:300]}")
        lines.append(f"Assistant: {a[:500]}\n")
    return "\n".join(lines) + "\n\n"

def count_docs():
    pdfs = glob.glob(os.path.join(DATA_DIR, "pdf_src", "*.pdf"))
    sheets = glob.glob(os.path.join(DATA_DIR, "*.xlsx"))
    emails = glob.glob(os.path.join(DATA_DIR, "emails", "*.*"))
    csvs = glob.glob(os.path.join(DATA_DIR, "*.csv")) + glob.glob(os.path.join(DATA_DIR, "csv", "*.csv"))
    return len(pdfs), len(sheets), len(emails), len(csvs)

def _hint_date(fname):
    import re
    m = re.search(r"(\d{4}-\d{2}-\d{2})", fname)
    return m.group(1) if m else "—"

def get_all_documents():
    docs = []
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "pdf_src", "*.pdf"))):
        name = os.path.basename(p)
        docs.append({"icon": "📄", "name": name, "type": "PDF", "date": _hint_date(name), "path": p, "size_kb": round(os.path.getsize(p)/1024, 1)})
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "*.xlsx"))):
        name = os.path.basename(p)
        docs.append({"icon": "📊", "name": name, "type": "Excel", "date": "—", "path": p, "size_kb": round(os.path.getsize(p)/1024, 1)})
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "*.csv"))):
        name = os.path.basename(p)
        docs.append({"icon": "📈", "name": name, "type": "CSV", "date": "—", "path": p, "size_kb": round(os.path.getsize(p)/1024, 1)})
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "emails", "*.*"))):
        name = os.path.basename(p)
        docs.append({"icon": "✉️", "name": name, "type": "Email", "date": _hint_date(name), "path": p, "size_kb": round(os.path.getsize(p)/1024, 1)})
    return docs

def _detect_client(query: str) -> str:
    q = query.lower()
    for client in KNOWN_CLIENTS:
        if client in q:
            return client.title() + " Corp" if client in ("acme", "beta", "gamma") else client.title()
    return ""

def run_ingestion_with_spinner():
    if not _ingest_lock.acquire(blocking=False):
        st.warning("⏳ Ingestion already running. Please wait.")
        return False
    try:
        with st.spinner("🔄 Re-indexing knowledge base..."):
            import ingest
            ingest.main()
            st.cache_data.clear()
        return True
    except Exception as e:
        st.error(f"Ingestion failed: {e}")
        return False
    finally:
        _ingest_lock.release()

# ── SESSION STATE INITIALIZATION ───────────────────────────────────────────────
if "history" not in st.session_state:
    st.session_state.history = []
if "high_contrast" not in st.session_state:
    st.session_state.high_contrast = False
if "large_text" not in st.session_state:
    st.session_state.large_text = False
if "reduced_motion" not in st.session_state:
    st.session_state.reduced_motion = False
if "last_context" not in st.session_state:
    st.session_state.last_context = None
if "pending_query" not in st.session_state:
    st.session_state.pending_query = None

APP_PASS = os.environ.get("APP_PASSWORD", "")
if not APP_PASS:
    try:
        APP_PASS = st.secrets.get("APP_PASSWORD", "")
    except Exception:
        APP_PASS = ""

if "authenticated" not in st.session_state:
    st.session_state.authenticated = not bool(APP_PASS)

if not st.session_state.authenticated:
    st.markdown("""
    <div class="nx-hero" style="max-width:480px;margin:80px auto;text-align:center;">
      <div class="nx-hero-badge"><span class="dot"></span>NEXA SECURITY GATE</div>
      <h1>Workspace Lock</h1>
      <p style="margin:12px 0 24px 0;">Enter workspace passkey to access knowledge agent.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_a, col_b, col_c = st.columns([1, 2, 1])
    with col_b:
        pass_input = st.text_input("Passkey", type="password", key="auth_pass")
        if st.button("Unlock Workspace 🔑", use_container_width=True, type="primary"):
            if pass_input == APP_PASS:
                st.session_state.authenticated = True
                st.success("Access Granted")
                st.rerun()
            else:
                st.error("Invalid Passkey")
    st.stop()

# ── HERO HEADER ───────────────────────────────────────────────────────────────
provider_label = get_active_provider()
pdf_count, sheet_count, email_count, csv_count = count_docs()

st.markdown(f"""
<div class="nx-hero">
  <div class="nx-hero-badge"><span class="dot"></span>NEXA INTELLIGENCE ENGINE v2.0</div>
  <h1>SME Knowledge Agent</h1>
  <p>Ask natural questions across policy PDFs, spreadsheets, and email threads — get one instant, 
     cited answer with AI conflict detection and full audit traceability.</p>
  <div class="nx-provider-status"><span class="live-dot"></span>{provider_label} &nbsp;·&nbsp; ONLINE</div>
</div>
""", unsafe_allow_html=True)

# ── SIDEBAR ───────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("### 📚 Knowledge Base")
    st.markdown(f"""
    <div class="bento-grid">
      <div class="bento-card"><span class="num">{pdf_count}</span><span class="lbl">PDFs</span></div>
      <div class="bento-card"><span class="num">{sheet_count}</span><span class="lbl">Sheets</span></div>
      <div class="bento-card"><span class="num">{email_count}</span><span class="lbl">Emails</span></div>
      <div class="bento-card"><span class="num">{csv_count}</span><span class="lbl">CSVs</span></div>
    </div>
    """, unsafe_allow_html=True)

    st.divider()

    # Document list
    st.markdown("### 📂 Ingested Documents")
    all_docs = get_all_documents()
    if all_docs:
        docs_html = ""
        for d in all_docs[:8]:
            name = d["name"]
            short = name[:24] + "…" if len(name) > 24 else name
            docs_html += f"""
            <div class="doc-item">
              <span class="doc-icon">{d['icon']}</span>
              <span class="doc-name" title="{name}">{short}</span>
              <span class="doc-date">{d['date']}</span>
            </div>"""
        st.markdown(docs_html, unsafe_allow_html=True)
        if len(all_docs) > 8:
            st.caption(f"+ {len(all_docs)-8} more in repository")
    else:
        st.caption("No documents ingested yet.")

    st.divider()

    # Upload
    st.markdown("### 📤 Document Ingestion")
    uploaded_file = st.file_uploader(
        "Upload PDF, Excel, CSV, or Email",
        type=["pdf", "xlsx", "csv", "txt", "eml"],
        label_visibility="collapsed",
        key="file_uploader"
    )
    if uploaded_file is not None:
        if st.button("💾 Save & Ingest", use_container_width=True, type="primary"):
            fname = os.path.basename(uploaded_file.name)
            ext = fname.rsplit(".", 1)[-1].lower()
            if ext == "pdf":
                target_dir = os.path.join(DATA_DIR, "pdf_src")
            elif ext in ("txt", "eml"):
                target_dir = os.path.join(DATA_DIR, "emails")
            else:
                target_dir = DATA_DIR
            os.makedirs(target_dir, exist_ok=True)
            save_path = os.path.join(target_dir, fname)
            with open(save_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            st.success(f"Saved `{fname}`")
            if run_ingestion_with_spinner():
                st.success("Re-indexed knowledge base!")
                st.rerun()

    if st.button("🔄 Re-index All Files", use_container_width=True):
        if run_ingestion_with_spinner():
            st.success("Re-indexed all documents.")
            st.rerun()

    st.divider()

    # Accessibility Drawer / Settings
    with st.expander("♿ Accessibility & Visual Settings"):
        hc = st.checkbox("High Contrast Mode", value=st.session_state.high_contrast, key="hc_toggle")
        lt = st.checkbox("Large Text Mode", value=st.session_state.large_text, key="lt_toggle")
        rm = st.checkbox("Reduced Motion", value=st.session_state.reduced_motion, key="rm_toggle")
        st.session_state.high_contrast = hc
        st.session_state.large_text = lt
        st.session_state.reduced_motion = rm

    if st.session_state.history:
        if st.button("🗑️ Clear Chat History", use_container_width=True):
            st.session_state.history = []
            st.session_state.last_context = None
            st.rerun()

# Apply accessibility CSS classes dynamically
classes = []
if st.session_state.high_contrast: classes.append("high-contrast")
if st.session_state.large_text: classes.append("large-text")
if st.session_state.reduced_motion: classes.append("reduced-motion")
if classes:
    st.markdown(f'<script>document.querySelector(".stApp").className += " {" ".join(classes)}";</script>', unsafe_allow_html=True)


# ── MAIN TABS ─────────────────────────────────────────────────────────────────
tab_copilot, tab_docs, tab_crm, tab_analytics = st.tabs([
    "💬  AI COPILOT",
    "📄  KNOWLEDGE REPOSITORY",
    "📝  CRM STUDIO",
    "📊  ANALYTICS & AUDIT",
])

# ── TAB 1: COPILOT ────────────────────────────────────────────────────────────
with tab_copilot:
    # Quick Prompt Chips
    st.caption("Prompt Suggestions")
    c1, c2, c3 = st.columns(3)
    with c1:
        if st.button("💳 What is the bulk order refund policy?", use_container_width=True, key="chip1"):
            st.session_state.pending_query = "What is the bulk order refund policy?"
    with c2:
        if st.button("📋 What are client payment terms?", use_container_width=True, key="chip2"):
            st.session_state.pending_query = "What are client payment terms?"
    with c3:
        if st.button("🛡️ What is hardware warranty duration?", use_container_width=True, key="chip3"):
            st.session_state.pending_query = "What is hardware warranty duration?"

    st.write("")

    # Chat history rendering
    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # Chat input
    query = st.chat_input("Ask a question about policies, terms, or orders...")
    if not query and st.session_state.get("pending_query"):
        query = st.session_state["pending_query"]
        del st.session_state["pending_query"]

    if query:
        st.session_state.history.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        with st.chat_message("assistant"):
            with st.spinner("Retrieving & analyzing sources..."):
                prior_history = st.session_state.history[:-1]
                hits = retrieve(query, top_k=5, history=prior_history)
                conflicts = detect_conflicts(hits)
                history_ctx = _build_history_context(prior_history)
                context_block = build_context_block(hits, conflicts)
                augmented_prompt = f"{history_ctx}QUESTION: {query}\n\n{context_block}" if history_ctx else f"QUESTION: {query}\n\n{context_block}"
                
                llm_fn = get_llm_fn()
                if llm_fn:
                    try:
                        answer = llm_fn(SYSTEM_PROMPT, augmented_prompt)
                    except Exception:
                        answer, _ = generate_answer(query, hits, conflicts, llm_call_fn=None)
                else:
                    answer, _ = generate_answer(query, hits, conflicts, llm_call_fn=None)

            # Conflict Warning Box
            if conflicts:
                for c in conflicts:
                    st.markdown(f"""
                    <div class="nx-conflict">
                      <div class="nx-conflict-title">⚠️ CONFLICT DETECTED · «{html.escape(c['topic'].replace('_', ' ').upper())}»</div>
                      <div class="nx-conflict-row">
                        <span class="nx-tag trusted">TRUSTED</span>
                        <span>{html.escape(c['trusted'].citation)}</span>
                      </div>
                      {''.join(f'<div class="nx-conflict-row"><span class="nx-tag outdated">SUPERSEDED</span><span>{html.escape(o.citation)}</span></div>' for o in c['outdated'])}
                    </div>
                    """, unsafe_allow_html=True)

            # Confidence & Response Header
            conf_label, conf_color = _confidence_label(hits)
            st.markdown(f"""
            <div style="display:flex;align-items:center;margin-bottom:10px;">
              <span style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:0.95rem;color:#f1f5f9;">Nexa Answer</span>
              <span style="margin-left:auto;font-family:'Fira Code',monospace;font-size:0.68rem;font-weight:700;
                     color:{conf_color};background:rgba(0,0,0,0.3);padding:3px 12px;border-radius:100px;
                     border:1px solid {conf_color}44;">
                CONFIDENCE · {conf_label}
              </span>
            </div>
            """, unsafe_allow_html=True)

            st.markdown(answer)

            # Deduplicated Citation Pills
            seen = set()
            unique_hits = []
            for h in hits:
                key = h.metadata.get("source_name", "?")
                if key not in seen:
                    seen.add(key)
                    unique_hits.append(h)

            pills_html = "".join(
                f'<span class="nx-pill">📎 {html.escape(h.metadata.get("source_name","?"))} · {h.metadata.get("doc_date","?")} <span class="nx-match-score">{_match_score(h.distance)}% match</span></span>'
                for h in unique_hits
            )
            if pills_html:
                st.markdown(f'<div class="nx-citations">{pills_html}</div>', unsafe_allow_html=True)

            # Context inspector
            with st.expander("🔍 Inspect Retrieved Chunks"):
                for idx, h in enumerate(hits, 1):
                    st.markdown(f"**[{idx}] {h.citation}** — Match Score: `{_match_score(h.distance)}%` (`cosine distance: {round(h.distance, 4)}`)")
                    st.code(h.text, language="text")

            # Log Audit
            try:
                from audit import log_qa_event
                log_qa_event(query, answer, hits, conflicts)
            except Exception:
                pass

            # Action Buttons
            msg_idx = len(st.session_state.history)
            ca1, ca2 = st.columns(2)
            with ca1:
                if st.button("📝 Convert to CRM Ticket", key=f"crm_{msg_idx}", type="primary", use_container_width=True):
                    st.session_state.last_context = {
                        "query": query, "answer": answer,
                        "hits": [{"text": h.text, "citation": h.citation} for h in hits],
                        "conflicts": [{"topic": c["topic"], "trusted": c["trusted"].citation} for c in conflicts],
                    }
                    st.session_state.crm_notice = True
                    st.success("Transferred context to CRM Ticket Studio! Switch to 📝 CRM STUDIO tab.")
            with ca2:
                if st.button("🚩 Flag Response", key=f"flag_{msg_idx}", use_container_width=True):
                    try:
                        from audit import log_qa_event
                        log_qa_event(f"[FLAGGED] {query}", answer, hits, conflicts)
                    except Exception:
                        pass
                    st.warning("Flagged and logged for audit review.")

            st.session_state.history.append({"role": "assistant", "content": answer})
            st.session_state.last_context = {
                "query": query, "answer": answer,
                "hits": [{"text": h.text, "citation": h.citation} for h in hits],
                "conflicts": [{"topic": c["topic"], "trusted": c["trusted"].citation} for c in conflicts],
            }


# ── TAB 2: KNOWLEDGE REPOSITORY ───────────────────────────────────────────────
with tab_docs:
    st.markdown("### Document Repository Management")
    st.caption("Inspect indexed documents, preview raw content, or trigger proactive conflict audits.")

    all_docs = get_all_documents()
    if not all_docs:
        st.info("No documents indexed yet. Upload files using the sidebar.")
    else:
        search_term = st.text_input("🔍 Search files...", key="doc_search", placeholder="Filter by document name...").strip().lower()
        filtered_docs = [d for d in all_docs if not search_term or search_term in d["name"].lower()]

        for idx, doc in enumerate(filtered_docs):
            with st.container():
                cols = st.columns([0.5, 3, 1.5, 1.5, 2])
                with cols[0]: st.markdown(f"### {doc['icon']}")
                with cols[1]:
                    st.markdown(f"**{doc['name']}**")
                    st.caption(f"Path: `{doc['path']}`")
                with cols[2]: st.caption(f"Type: {doc['type']} | Size: {doc['size_kb']} KB")
                with cols[3]: st.caption(f"Date: `{doc['date']}`")
                with cols[4]:
                    if st.button("🗑️ Delete Document", key=f"del_{idx}_{doc['name']}", use_container_width=True):
                        chunks_deleted = delete_document_from_index(doc["name"])
                        if os.path.exists(doc["path"]):
                            os.remove(doc["path"])
                        st.cache_data.clear()
                        st.success(f"Deleted `{doc['name']}` ({chunks_deleted} vector chunks removed).")
                        st.rerun()

                st.divider()

        st.markdown("### 🔎 Proactive Policy Conflict Scanner")
        if st.button("Scan All Indexed Documents for Contradictions", type="primary"):
            with st.spinner("Scanning entire vector corpus..."):
                active_conflicts = scan_all_conflicts()
                if not active_conflicts:
                    st.success("Clean Corpus: Zero policy conflicts detected across all documents!")
                else:
                    st.warning(f"Detected {len(active_conflicts)} active policy conflict(s):")
                    for c in active_conflicts:
                        st.markdown(f"""
                        <div class="nx-conflict">
                          <div class="nx-conflict-title">⚠️ CONFLICT · «{html.escape(c['topic'].replace('_', ' ').upper())}»</div>
                          <div class="nx-conflict-row"><span class="nx-tag trusted">TRUSTED</span><span>{html.escape(c['trusted'].citation)}</span></div>
                          {''.join(f'<div class="nx-conflict-row"><span class="nx-tag outdated">SUPERSEDED</span><span>{html.escape(o.citation)}</span></div>' for o in c['outdated'])}
                        </div>
                        """, unsafe_allow_html=True)


# ── TAB 3: CRM STUDIO ─────────────────────────────────────────────────────────
with tab_crm:
    st.markdown("### CRM Ticket Generator")
    st.caption("Convert AI Copilot answers into ready-to-send support tickets for HubSpot, Salesforce, or Zendesk.")

    if st.session_state.get("crm_notice"):
        st.success("Context loaded from AI Copilot!")
        st.session_state.crm_notice = False

    ctx = st.session_state.last_context
    col1, col2 = st.columns(2)

    with col1:
        subject = st.text_input("Ticket Subject", value=(ctx["query"] if ctx else ""), placeholder="e.g. Bulk order refund inquiry")
        auto_client = _detect_client(ctx["query"]) if ctx else ""
        client = st.text_input("Client Name", value=auto_client, placeholder="e.g. Acme Corp")
        priority = st.selectbox("Priority Level", ["Low", "Medium", "High", "Urgent"], index=1)
        ticket_type = st.selectbox("Ticket Category", ["Policy Inquiry", "Refund Request", "Payment Dispute", "Warranty Claim"])

    with col2:
        body_default = ""
        if ctx:
            body_default = (
                f"Generated from Nexa AI on {datetime.now():%Y-%m-%d %H:%M}\n\n"
                f"Question: {ctx['query']}\n\n"
                f"Resolution:\n{ctx['answer']}\n\n"
                f"Citations:\n" + "\n".join(f"- {h['citation']}" for h in ctx['hits'])
            )
        body = st.text_area("Ticket Response Draft", value=body_default, height=220)

    if st.button("Generate Ticket Record 🚀", type="primary"):
        if not subject.strip():
            st.warning("Please enter a subject.")
        else:
            ticket = {
                "id": f"TCK-{int(datetime.now().timestamp())}",
                "subject": subject, "client": client,
                "priority": priority, "type": ticket_type,
                "body": body, "created_at": datetime.now().isoformat(),
            }
            st.success(f"Ticket `{ticket['id']}` generated!")
            
            t_json = json.dumps(ticket, indent=2)
            t_csv = pd.DataFrame([ticket]).to_csv(index=False)

            c_dl1, c_dl2 = st.columns(2)
            with c_dl1:
                st.download_button("📥 Download Ticket (.json)", data=t_json, file_name=f"{ticket['id']}.json", mime="application/json", use_container_width=True)
            with c_dl2:
                st.download_button("📊 Download Ticket (.csv)", data=t_csv, file_name=f"{ticket['id']}.csv", mime="text/csv", use_container_width=True)


# ── TAB 4: ANALYTICS & AUDIT ──────────────────────────────────────────────────
with tab_analytics:
    st.markdown("### Analytics & Live Audit Log")

    audit_file = os.path.join(DATA_DIR, "audit_log.jsonl")
    audit_entries = []
    if os.path.exists(audit_file):
        with open(audit_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        audit_entries.append(json.loads(line))
                    except Exception:
                        pass

    # Metrics
    m1, m2, m3, m4 = st.columns(4)
    with m1: st.metric("Total Queries", len(audit_entries))
    with m2:
        conf_count = sum(1 for e in audit_entries if e.get("conflicts_detected"))
        st.metric("Conflicts Resolved", conf_count)
    with m3:
        flagged = sum(1 for e in audit_entries if str(e.get("query","")).startswith("[FLAGGED]"))
        st.metric("Flagged Queries", flagged)
    with m4: st.metric("Embedding Model", "384-dim MiniLM")

    st.divider()

    # Visual Charts
    col_c1, col_c2 = st.columns(2)
    with col_c1:
        st.caption("📄 Document Types in Knowledge Base")
        df_docs = pd.DataFrame({
            "Source Type": ["PDFs", "Excel Workbooks", "Email Threads", "CSVs"],
            "Count": [pdf_count, sheet_count, email_count, csv_count]
        }).set_index("Source Type")
        st.bar_chart(df_docs, color="#6366f1")

    with col_c2:
        st.caption("📊 Resolution Breakdown")
        df_res = pd.DataFrame({
            "Category": ["Direct Answers", "Conflict Warnings", "Flagged Queries"],
            "Count": [max(0, len(audit_entries)-conf_count-flagged), conf_count, flagged]
        }).set_index("Category")
        st.bar_chart(df_res, color="#10b981")

    st.divider()

    # Export + Recent Audit Log Table
    st.markdown("### Recent Audit Trail")
    if audit_entries:
        # Download button
        try:
            from audit import export_audit_csv
            csv_data = export_audit_csv()
            st.download_button(
                "📥 Export Full Audit Log (.csv)",
                data=csv_data,
                file_name=f"nexa_audit_{datetime.now():%Y%m%d_%H%M}.csv",
                mime="text/csv",
                use_container_width=False,
            )
        except Exception:
            pass

    if audit_entries:
        for entry in reversed(audit_entries[-15:]):
            ts = str(entry.get("timestamp", ""))[:19].replace("T", " ")
            q = entry.get("query", "")
            conf = bool(entry.get("conflicts_detected"))
            flag = str(q).startswith("[FLAGGED]")
            
            st.markdown(f"""
            <div class="nx-audit-entry">
              <div class="nx-audit-time">🕒 {ts} · Call ID: {entry.get('call_id', 'N/A')}</div>
              <div class="nx-audit-query">{html.escape(str(q))}</div>
              <div style="font-size:0.8rem;color:#94a3b8;margin-top:4px;">{html.escape(str(entry.get('answer_preview', entry.get('answer','')))[:140])}...</div>
              <div style="margin-top:6px;font-size:0.7rem;font-family:'Fira Code',monospace;color:#64748b;">
                {'⚠️ CONFLICT DETECTED · ' if conf else ''}{'🚩 FLAGGED · ' if flag else ''}Confidence: {entry.get('confidence_level', 'N/A')}
              </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.caption("No audit events recorded yet.")
