import os
import glob
import html
import subprocess
import threading
from datetime import datetime

import streamlit as st

from rag_engine import retrieve, detect_conflicts, generate_answer, delete_document_from_index, scan_all_conflicts
from llm_config import load_secrets, get_active_provider, get_llm_fn

st.set_page_config(
    page_title="Nexa — SME Knowledge Agent",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

load_secrets()

# ── Ingestion lock (shared with API server concept) ────────────────────────────
_ingest_lock = threading.Lock()

# ─────────────────────────────────────────────────────────────────────────────
# CSS — Same cyberpunk theme, fully fixed
# ─────────────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');

/* ─── RESET ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, [data-testid="stAppViewContainer"] {
    background: #050008 !important;
    color: #e2d9f3 !important;
}
[data-testid="stAppViewContainer"] {
    background:
        radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.35) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 110%, rgba(236,72,153,0.25) 0%, transparent 60%),
        #050008 !important;
}

/* Reset webkit fill so .nx-hero gradient doesn't bleed */
body * { -webkit-text-fill-color: unset; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.6); border-radius: 4px; }

/* Hide Streamlit chrome */
#MainMenu, footer, header, [data-testid="stToolbar"] { visibility: hidden !important; }
[data-testid="stSidebarNav"] { display: none !important; }

/* ─── GLOBAL FONT ─── */
html, body, [class*="css"], .stMarkdown {
    font-family: 'Inter', sans-serif !important;
    color: #e2d9f3 !important;
}
h1, h2, h3, h4, h5 { font-family: 'Orbitron', sans-serif !important; }
code, pre, .mono { font-family: 'JetBrains Mono', monospace !important; }

/* ─── SIDEBAR ─── */
[data-testid="stSidebar"] {
    background: rgba(8,0,16,0.96) !important;
    border-right: 1px solid rgba(124,58,237,0.25) !important;
    backdrop-filter: blur(20px) !important;
}
[data-testid="stSidebar"] * { color: #c4b5fd !important; }
[data-testid="stSidebar"] h3 {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 0.7rem !important;
    letter-spacing: 0.18em !important;
    color: #6d28d9 !important;
    text-transform: uppercase !important;
}

/* ─── HERO ─── */
.nx-hero {
    position: relative; overflow: hidden;
    background: linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 50%, rgba(236,72,153,0.06) 100%);
    border: 1px solid rgba(124,58,237,0.35);
    border-radius: 20px;
    padding: 32px 44px;
    margin-bottom: 24px;
}
.nx-hero::before {
    content: '';
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(124,58,237,0.025) 40px, rgba(124,58,237,0.025) 41px),
                repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(124,58,237,0.015) 80px, rgba(124,58,237,0.015) 81px);
    border-radius: 20px; pointer-events: none;
}
.nx-hero::after {
    content: '';
    position: absolute; top: -40%; right: -10%;
    width: 350px; height: 350px;
    background: radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%);
    pointer-events: none;
    animation: pulse-orb 4s ease-in-out infinite;
}
@keyframes pulse-orb {
    0%, 100% { transform: scale(1); opacity: 0.5; }
    50% { transform: scale(1.15); opacity: 0.9; }
}
.nx-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(124,58,237,0.18);
    border: 1px solid rgba(167,139,250,0.35);
    color: #c4b5fd;
    padding: 5px 14px; border-radius: 100px;
    font-size: 0.68rem; font-weight: 600; letter-spacing: 0.12em;
    text-transform: uppercase; margin-bottom: 14px;
    font-family: 'JetBrains Mono', monospace !important;
}
.nx-badge .dot {
    width: 6px; height: 6px; background: #a78bfa;
    border-radius: 50%; animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }

.nx-hero h1 {
    font-size: 2.6rem !important; font-weight: 900 !important; line-height: 1.1 !important;
    background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 45%, #ec4899 100%);
    -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    margin-bottom: 10px !important; letter-spacing: -0.02em !important;
}
.nx-hero p {
    color: #94a3b8; font-size: 0.92rem; line-height: 1.7; max-width: 600px;
}
.nx-provider-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.28);
    color: #34d399; padding: 4px 12px; border-radius: 100px;
    font-size: 0.68rem; font-family: 'JetBrains Mono', monospace !important;
    font-weight: 600; letter-spacing: 0.06em; margin-top: 14px;
}
.nx-provider-pill .live-dot {
    width: 6px; height: 6px; background: #34d399; border-radius: 50%;
    box-shadow: 0 0 6px #34d399; animation: blink 1.2s ease-in-out infinite;
}

/* ─── BENTO STAT CARDS ─── */
.bento-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 12px 0;
}
.bento-card {
    background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.22);
    border-radius: 14px; padding: 14px; text-align: center;
    transition: all 0.22s ease; cursor: default; position: relative; overflow: hidden;
}
.bento-card:hover { border-color: rgba(167,139,250,0.55); transform: translateY(-2px); }
.bento-card .num {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 1.6rem; font-weight: 900; color: #a78bfa;
    display: block; line-height: 1.1;
}
.bento-card .lbl {
    font-size: 0.6rem; color: #64748b; text-transform: uppercase;
    letter-spacing: 0.1em; font-weight: 600;
    font-family: 'JetBrains Mono', monospace !important; margin-top: 4px;
}

/* ─── DOCUMENT BROWSER ─── */
.doc-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 10px; border-radius: 10px;
    border: 1px solid rgba(124,58,237,0.15);
    background: rgba(124,58,237,0.04);
    margin-bottom: 6px; transition: all 0.2s;
}
.doc-item:hover { border-color: rgba(167,139,250,0.4); background: rgba(124,58,237,0.1); }
.doc-icon { font-size: 1rem; flex-shrink: 0; }
.doc-name {
    font-size: 0.72rem; font-family: 'JetBrains Mono', monospace;
    color: #c4b5fd !important; -webkit-text-fill-color: #c4b5fd !important;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;
}
.doc-date {
    font-size: 0.6rem; color: #4b5563 !important; -webkit-text-fill-color: #4b5563 !important;
    font-family: 'JetBrains Mono', monospace; flex-shrink: 0;
}

/* ─── TABS ─── */
[data-testid="stTabs"] button {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 0.7rem !important; font-weight: 700 !important;
    letter-spacing: 0.08em !important; text-transform: uppercase !important;
    color: #4b5563 !important; border-radius: 8px 8px 0 0 !important;
    padding: 10px 20px !important; transition: all 0.2s !important;
}
[data-testid="stTabs"] button[aria-selected="true"] {
    color: #a78bfa !important;
    border-bottom: 2px solid #7c3aed !important;
    background: rgba(124,58,237,0.08) !important;
}
[data-testid="stTabs"] button:hover {
    color: #c4b5fd !important; background: rgba(124,58,237,0.05) !important;
}

/* ─── BUTTONS ─── */
[data-testid="stButton"] > button {
    background: rgba(124,58,237,0.1) !important;
    border: 1px solid rgba(124,58,237,0.35) !important;
    color: #c4b5fd !important; -webkit-text-fill-color: #c4b5fd !important;
    border-radius: 12px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.82rem !important; font-weight: 500 !important;
    padding: 10px 18px !important; transition: all 0.2s ease !important; cursor: pointer !important;
}
[data-testid="stButton"] > button:hover {
    background: rgba(124,58,237,0.25) !important;
    border-color: rgba(167,139,250,0.6) !important;
    color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;
    box-shadow: 0 0 20px rgba(124,58,237,0.3) !important;
    transform: translateY(-1px) !important;
}
[data-testid="stButton"] > button[kind="primary"],
[data-testid="stButton"] > button[data-testid="baseButton-primary"] {
    background: linear-gradient(135deg, #7c3aed, #6366f1) !important;
    border: none !important;
    color: #ffffff !important; -webkit-text-fill-color: #ffffff !important;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4) !important;
}
[data-testid="stButton"] > button[kind="primary"]:hover {
    box-shadow: 0 6px 30px rgba(124,58,237,0.6) !important;
    transform: translateY(-2px) !important;
}

/* ─── CHAT INPUT ─── */
[data-testid="stChatInput"] { background: transparent !important; border: none !important; padding: 0 !important; }
[data-testid="stChatInput"] > div {
    background: rgba(16, 8, 32, 0.9) !important;
    border: 1px solid rgba(124, 58, 237, 0.45) !important;
    border-radius: 16px !important; backdrop-filter: blur(12px) !important;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 18px rgba(124,58,237,0.12) !important;
    overflow: hidden !important;
}
[data-testid="stChatInput"] textarea,
[data-testid="stChatInputTextArea"] textarea,
[data-testid="stChatInput"] [data-baseweb="textarea"] textarea {
    background: transparent !important; border: none !important;
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
    caret-color: #a78bfa !important;
    font-family: 'Inter', sans-serif !important; font-size: 0.92rem !important;
    padding: 12px 16px !important; box-shadow: none !important;
}
[data-testid="stChatInput"] textarea::placeholder,
[data-testid="stChatInputTextArea"] textarea::placeholder {
    color: rgba(148,130,200,0.4) !important;
    -webkit-text-fill-color: rgba(148,130,200,0.4) !important;
}
[data-testid="stChatInput"] button {
    background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
    border-radius: 10px !important; border: none !important;
    color: #ffffff !important; margin-right: 6px !important;
}

/* ─── FILE UPLOADER ─── */
[data-testid="stFileUploader"] { background: transparent !important; border: none !important; padding: 0 !important; }
[data-testid="stFileUploader"] section[data-testid="stFileUploaderDropzone"] {
    background: rgba(124,58,237,0.04) !important;
    border: 1px dashed rgba(124,58,237,0.3) !important;
    border-radius: 12px !important; padding: 12px !important; color: #c4b5fd !important;
}
[data-testid="stFileUploaderDropzone"] span { display: none !important; }
[data-testid="stFileUploaderDropzone"] button span { display: inline !important; }
[data-testid="stFileUploader"] section[data-testid="stFileUploaderDropzone"] button {
    background: rgba(124,58,237,0.18) !important;
    border: 1px solid rgba(167,139,250,0.35) !important;
    border-radius: 8px !important; color: #e2d9f3 !important;
    -webkit-text-fill-color: #e2d9f3 !important;
    padding: 6px 14px !important; font-size: 0.78rem !important;
}
[data-testid="stFileUploader"] small {
    color: #6d28d9 !important; font-size: 0.68rem !important;
}

/* ─── ALL INPUTS / TEXTAREAS / SELECTS ─── */
[data-testid="stTextInput"] > div,
[data-testid="stTextArea"] > div,
[data-testid="stSelectbox"] > div,
[data-baseweb="input"],
[data-baseweb="base-input"],
[data-baseweb="textarea"],
[data-baseweb="select"] > div,
[data-baseweb="select"] > div > div {
    background-color: rgba(14, 6, 30, 0.9) !important;
    border: 1px solid rgba(124,58,237,0.38) !important;
    border-radius: 12px !important;
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
    box-shadow: 0 2px 12px rgba(0,0,0,0.3) !important;
    transition: all 0.22s ease !important;
}
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-baseweb="input"] input,
[data-baseweb="base-input"] input,
[data-baseweb="textarea"] textarea,
textarea {
    background-color: transparent !important; background: transparent !important;
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
    caret-color: #a78bfa !important;
    font-family: 'Inter', sans-serif !important; font-size: 0.92rem !important;
    border: none !important; box-shadow: none !important;
}
[data-testid="stTextInput"] input::placeholder,
[data-testid="stTextArea"] textarea::placeholder,
textarea::placeholder {
    color: rgba(148,130,200,0.4) !important;
    -webkit-text-fill-color: rgba(148,130,200,0.4) !important;
}
[data-testid="stTextInput"] > div:focus-within,
[data-testid="stTextArea"] > div:focus-within,
[data-baseweb="input"]:focus-within,
[data-baseweb="textarea"]:focus-within {
    border-color: rgba(167,139,250,0.7) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.18), 0 0 18px rgba(124,58,237,0.18) !important;
    background-color: rgba(22,10,45,0.95) !important;
}
[data-testid="stSelectbox"] [data-baseweb="select"] span,
[data-testid="stSelectbox"] [data-baseweb="select"] div,
[data-baseweb="select"] span {
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
    background: transparent !important;
}
[data-testid="stSelectbox"] svg { fill: #a78bfa !important; }

/* Dropdown menu */
[data-baseweb="popover"], [data-baseweb="menu"], ul[data-baseweb="menu"] {
    background-color: #0a0318 !important;
    border: 1px solid rgba(124,58,237,0.4) !important;
    border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.8) !important;
}
li[data-baseweb="option"] {
    background-color: transparent !important;
    color: #cbd5e1 !important; -webkit-text-fill-color: #cbd5e1 !important;
    font-family: 'Inter', sans-serif !important;
}
li[data-baseweb="option"]:hover,
li[data-baseweb="option"][aria-selected="true"] {
    background-color: rgba(124,58,237,0.28) !important;
    color: #a78bfa !important; -webkit-text-fill-color: #a78bfa !important;
}

/* Widget labels */
[data-testid="stWidgetLabel"] > p,
[data-testid="stWidgetLabel"] label {
    color: #6b7280 !important; -webkit-text-fill-color: #6b7280 !important;
    font-size: 0.72rem !important; font-family: 'JetBrains Mono', monospace !important;
    text-transform: uppercase !important; letter-spacing: 0.08em !important;
}

/* ─── CHAT MESSAGES ─── */
[data-testid="stChatMessage"] {
    background: transparent !important; border: none !important;
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
}
[data-testid="stChatMessage"]:has([data-testid="chatAvatarIcon-user"]) {
    background: rgba(124,58,237,0.07) !important;
    border: 1px solid rgba(124,58,237,0.2) !important;
    border-radius: 16px !important; padding: 12px 16px !important; margin: 8px 0 !important;
}
[data-testid="stChatMessage"] p,
[data-testid="stChatMessage"] span,
[data-testid="stChatMessage"] div {
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
}

/* ─── CONFLICT BOX ─── */
.nx-conflict {
    background: linear-gradient(135deg, rgba(236,72,153,0.05) 0%, rgba(251,146,60,0.03) 100%);
    border: 1px solid rgba(236,72,153,0.38); border-left: 4px solid #ec4899;
    border-radius: 16px; padding: 16px 20px; margin: 12px 0;
    position: relative; overflow: hidden;
}
.nx-conflict::before {
    content: '⚠ CONFLICT';
    position: absolute; top: 10px; right: 14px;
    font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
    font-weight: 700; letter-spacing: 0.12em; color: #ec4899;
    background: rgba(236,72,153,0.1); padding: 3px 8px;
    border-radius: 100px; border: 1px solid rgba(236,72,153,0.28);
}
.nx-conflict-title {
    font-family: 'Orbitron', sans-serif; font-size: 0.82rem; font-weight: 700;
    color: #f9a8d4; margin-bottom: 8px; padding-right: 80px;
}
.nx-conflict-row { display: flex; align-items: flex-start; gap: 10px; margin: 6px 0; font-size: 0.82rem; color: #cbd5e1; line-height: 1.5; }
.nx-conflict-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; font-weight: 700;
    padding: 2px 8px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
}
.nx-conflict-tag.trusted { background: rgba(52,211,153,0.1); color: #34d399; border: 1px solid rgba(52,211,153,0.28); }
.nx-conflict-tag.outdated { background: rgba(236,72,153,0.1); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.28); }

/* ─── ANSWER BOX ─── */
.nx-answer-header {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(99,102,241,0.08));
    border: 1px solid rgba(124,58,237,0.32); border-bottom: none;
    border-radius: 16px 16px 0 0; padding: 10px 18px; margin-top: 12px;
}
.nx-answer-header-text {
    font-family: 'Orbitron', sans-serif; font-size: 0.68rem; font-weight: 700;
    letter-spacing: 0.12em; color: #a78bfa; text-transform: uppercase;
}
.nx-answer {
    background: rgba(12,0,28,0.7); border: 1px solid rgba(124,58,237,0.32);
    border-top: 3px solid #7c3aed; border-radius: 0 0 16px 16px;
    padding: 20px 24px; margin: 0 0 14px 0;
    font-size: 0.93rem; line-height: 1.78; color: #e2d9f3;
    backdrop-filter: blur(10px);
}
.nx-answer p, .nx-answer span, .nx-answer div {
    color: #e2d9f3 !important; -webkit-text-fill-color: #e2d9f3 !important;
}

/* ─── SECTION LABEL ─── */
.nx-section-label {
    font-family: 'Orbitron', sans-serif; font-size: 0.62rem; font-weight: 700;
    letter-spacing: 0.18em; color: #374151; text-transform: uppercase;
    margin-bottom: 10px; margin-top: 4px;
    display: flex; align-items: center; gap: 10px;
}
.nx-section-label::after {
    content: ''; flex: 1; height: 1px;
    background: linear-gradient(90deg, rgba(124,58,237,0.28), transparent);
}

/* ─── CITATION PILLS ─── */
.nx-citations { display: flex; flex-wrap: wrap; gap: 7px; margin: 12px 0; }
.nx-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 100px; font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace; font-weight: 500;
    border: 1px solid; transition: all 0.2s;
}
.nx-pill.pdf { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.32); color: #a5b4fc; }
.nx-pill.email { background: rgba(234,179,8,0.07); border-color: rgba(234,179,8,0.28); color: #fde68a; }
.nx-pill.excel { background: rgba(52,211,153,0.07); border-color: rgba(52,211,153,0.28); color: #6ee7b7; }
.nx-pill:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.3); }

/* ─── SUGGESTION CHIP ─── */
.nx-suggestion-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.nx-suggestion-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(124,58,237,0.07); border: 1px solid rgba(124,58,237,0.28);
    color: #a78bfa; padding: 6px 14px; border-radius: 100px;
    font-size: 0.78rem; font-family: 'Inter', sans-serif;
    cursor: pointer; transition: all 0.2s;
    white-space: nowrap;
}
.nx-suggestion-chip:hover {
    background: rgba(124,58,237,0.2); border-color: rgba(167,139,250,0.6);
    color: #e2d9f3; transform: translateY(-1px);
}

/* ─── TICKET CARD ─── */
.nx-ticket {
    background: rgba(52,211,153,0.04); border: 1px solid rgba(52,211,153,0.22);
    border-radius: 16px; padding: 18px 22px; margin-top: 14px; position: relative;
}
.nx-ticket-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 700;
    letter-spacing: 0.1em; color: #34d399; text-transform: uppercase;
    background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.22);
    padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 8px;
}

/* ─── ANALYTICS ─── */
.nx-analytics {
    background: rgba(8,0,22,0.5); border: 1px solid rgba(124,58,237,0.18);
    border-radius: 16px; padding: 18px 22px; margin-bottom: 12px; backdrop-filter: blur(8px);
}
.nx-audit-entry {
    padding: 12px 16px; border-radius: 12px;
    border: 1px solid rgba(124,58,237,0.15);
    background: rgba(124,58,237,0.04); margin-bottom: 8px;
    transition: all 0.2s;
}
.nx-audit-entry:hover { border-color: rgba(124,58,237,0.35); background: rgba(124,58,237,0.08); }
.nx-audit-time {
    font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; color: #4b5563;
    -webkit-text-fill-color: #4b5563 !important; margin-bottom: 4px;
}
.nx-audit-query {
    font-size: 0.85rem; color: #c4b5fd; -webkit-text-fill-color: #c4b5fd !important; font-weight: 500;
}
.nx-audit-conflict-tag {
    display: inline-block; font-size: 0.6rem; font-family: 'JetBrains Mono', monospace;
    background: rgba(236,72,153,0.1); color: #f9a8d4; border: 1px solid rgba(236,72,153,0.28);
    padding: 2px 8px; border-radius: 100px; margin-top: 4px; font-weight: 700;
}

/* ─── METRIC ─── */
[data-testid="stMetric"] {
    background: rgba(124,58,237,0.06); border: 1px solid rgba(124,58,237,0.18);
    border-radius: 14px; padding: 14px !important;
}
[data-testid="stMetricValue"] { font-family: 'Orbitron', sans-serif !important; color: #a78bfa !important; }
[data-testid="stMetricLabel"] {
    color: #64748b !important; font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.68rem !important; text-transform: uppercase !important; letter-spacing: 0.08em !important;
}

/* ─── MISC ─── */
[data-testid="stExpander"] {
    background: rgba(124,58,237,0.04) !important; border: 1px solid rgba(124,58,237,0.18) !important;
    border-radius: 12px !important;
}
[data-testid="stExpander"] summary { color: #6b7280 !important; font-size: 0.8rem !important; font-family: 'JetBrains Mono', monospace !important; }
[data-testid="stInfo"] { background: rgba(124,58,237,0.05) !important; border: 1px solid rgba(124,58,237,0.18) !important; border-radius: 12px !important; color: #c4b5fd !important; }
[data-testid="stSuccess"] { background: rgba(52,211,153,0.05) !important; border: 1px solid rgba(52,211,153,0.18) !important; border-radius: 12px !important; }
[data-testid="stWarning"] { background: rgba(251,146,60,0.05) !important; border: 1px solid rgba(251,146,60,0.18) !important; border-radius: 12px !important; }
[data-testid="stSpinner"] p { color: #a78bfa !important; font-family: 'JetBrains Mono', monospace !important; }
pre, code { background: rgba(0,0,0,0.4) !important; border: 1px solid rgba(124,58,237,0.18) !important; border-radius: 8px !important; color: #c4b5fd !important; font-family: 'JetBrains Mono', monospace !important; }
hr { border-color: rgba(124,58,237,0.12) !important; }
.stCaption, [data-testid="stCaptionContainer"] { color: #374151 !important; font-family: 'JetBrains Mono', monospace !important; font-size: 0.7rem !important; }

/* Scan-line overlay */
body::after {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.03) 3px, rgba(0,0,0,0.03) 4px);
    pointer-events: none; z-index: 9999;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 768px) {
    .nx-hero { padding: 20px 18px !important; border-radius: 14px !important; }
    .nx-hero h1 { font-size: 1.7rem !important; }
    .bento-grid { grid-template-columns: 1fr !important; gap: 7px !important; }
    .nx-suggestion-bar { flex-direction: column !important; }
}
</style>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")

KNOWN_CLIENTS = ["acme", "beta", "gamma", "delta", "alpha"]


def count_docs():
    pdfs = glob.glob(os.path.join(DATA_DIR, "pdf_src", "*.pdf"))
    sheets = glob.glob(os.path.join(DATA_DIR, "*.xlsx"))
    emails = glob.glob(os.path.join(DATA_DIR, "emails", "*.*"))
    return len(pdfs), len(sheets), len(emails)


def get_all_documents():
    """Return structured document objects for the document browser and management tab."""
    docs = []
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "pdf_src", "*.pdf"))):
        name = os.path.basename(p)
        size_kb = round(os.path.getsize(p) / 1024, 1)
        docs.append({"icon": "📄", "name": name, "type": "PDF", "date": _hint_date(name), "path": p, "size_kb": size_kb})
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "*.xlsx"))):
        name = os.path.basename(p)
        size_kb = round(os.path.getsize(p) / 1024, 1)
        docs.append({"icon": "📊", "name": name, "type": "Excel", "date": "—", "path": p, "size_kb": size_kb})
    for p in sorted(glob.glob(os.path.join(DATA_DIR, "emails", "*.*"))):
        name = os.path.basename(p)
        size_kb = round(os.path.getsize(p) / 1024, 1)
        docs.append({"icon": "✉", "name": name, "type": "Email", "date": _hint_date(name), "path": p, "size_kb": size_kb})
    return docs


def _hint_date(fname):
    """Extract YYYY-MM-DD from filename like email_2024-10-14_..."""
    import re
    m = re.search(r"(\d{4}-\d{2}-\d{2})", fname)
    return m.group(1) if m else "—"


def _detect_client(query: str) -> str:
    """Best-effort client extraction from query text."""
    q = query.lower()
    for client in KNOWN_CLIENTS:
        if client in q:
            return client.title() + " Corp" if client in ("acme", "beta", "gamma") else client.title()
    return ""


def pill_class(h):
    t = h.metadata.get("source_type", "pdf")
    return "email" if t == "email" else ("excel" if t == "excel" else "pdf")

def pill_icon(h):
    t = h.metadata.get("source_type", "pdf")
    return "✉" if t == "email" else ("⊞" if t == "excel" else "⬡")


def run_ingestion_with_spinner():
    """Run ingest.py in subprocess with a lock to prevent concurrent runs."""
    if not _ingest_lock.acquire(blocking=False):
        st.warning("⏳ Ingestion already running. Please wait.")
        return False
    try:
        with st.spinner("🔄 Re-indexing knowledge base..."):
            ingest_script = os.path.join(BASE_DIR, "ingest.py")
            result = subprocess.run(
                ["python", ingest_script],
                cwd=BASE_DIR,
                capture_output=True, text=True, timeout=300,
            )
        if result.returncode != 0:
            st.error(f"Ingestion failed: {result.stderr[:300]}")
            return False
        return True
    except subprocess.TimeoutExpired:
        st.error("Ingestion timed out after 5 minutes.")
        return False
    finally:
        _ingest_lock.release()


# ─────────────────────────────────────────────────────────────────────────────
# Session state & Authentication
# ─────────────────────────────────────────────────────────────────────────────
if "history" not in st.session_state:
    st.session_state.history = []
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
    <div class="nx-hero" style="max-width:500px;margin:80px auto;text-align:center;">
      <div class="nx-badge"><span class="dot"></span>NEXA SECURITY GATE</div>
      <h2>Authentication Required</h2>
      <p style="margin:12px 0 24px 0;">Enter workspace passkey to access knowledge base.</p>
    </div>
    """, unsafe_allow_html=True)
    
    col_a, col_b, col_c = st.columns([1, 2, 1])
    with col_b:
        pass_input = st.text_input("Workspace Passkey", type="password", key="auth_pass")
        if st.button("Unlock Workspace 🔑", use_container_width=True, type="primary"):
            if pass_input == APP_PASS:
                st.session_state.authenticated = True
                st.success("Access Granted")
                st.rerun()
            else:
                st.error("Invalid Passkey")
    st.stop()


# ─────────────────────────────────────────────────────────────────────────────
# HERO
# ─────────────────────────────────────────────────────────────────────────────
provider_label = get_active_provider()
pdf_count, sheet_count, email_count = count_docs()

st.markdown(f"""
<div class="nx-hero">
  <div class="nx-badge"><span class="dot"></span>NEXA INTELLIGENCE ENGINE v2.0</div>
  <h1>Knowledge Agent</h1>
  <p>Ask natural questions across policy PDFs, multi-sheet spreadsheets, and email threads —
     get one instant, cited answer with AI-powered conflict detection and full audit traceability.</p>
  <div class="nx-provider-pill"><span class="live-dot"></span>{provider_label} &nbsp;·&nbsp; LIVE INFERENCE</div>
</div>
""", unsafe_allow_html=True)


# ─────────────────────────────────────────────────────────────────────────────
# SIDEBAR
# ─────────────────────────────────────────────────────────────────────────────
with st.sidebar:
    # Stats
    st.markdown("### 📚 Knowledge Base")
    st.markdown(f"""
    <div class="bento-grid">
      <div class="bento-card"><span class="num">{pdf_count}</span><span class="lbl">PDFs</span></div>
      <div class="bento-card"><span class="num">{sheet_count}</span><span class="lbl">Sheets</span></div>
      <div class="bento-card"><span class="num">{email_count}</span><span class="lbl">Emails</span></div>
    </div>
    """, unsafe_allow_html=True)

    if not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY")):
        st.caption("⚠ Set `GROQ_API_KEY` or `GEMINI_API_KEY` for live LLM.")

    st.divider()

    # Document browser
    st.markdown("### 📁 Documents")
    all_docs = get_all_documents()
    if all_docs:
        docs_html = ""
        for d in all_docs:
            name = d["name"]
            short = name[:28] + "…" if len(name) > 28 else name
            docs_html += f"""
            <div class="doc-item">
              <span class="doc-icon">{d['icon']}</span>
              <span class="doc-name" title="{name}">{short}</span>
              <span class="doc-date">{d['date']}</span>
            </div>"""
        st.markdown(docs_html, unsafe_allow_html=True)
    else:
        st.caption("No documents ingested yet.")

    st.divider()

    # Upload
    st.markdown("### 📤 Upload")
    st.caption("PDF · Excel · TXT · EML")
    uploaded_file = st.file_uploader(
        " ", type=["pdf", "xlsx", "txt", "eml"],
        label_visibility="collapsed", key="file_uploader"
    )
    if uploaded_file is not None:
        if st.button("💾 Save & Ingest", use_container_width=True, type="primary"):
            # Security: sanitize filename — no path traversal
            fname = os.path.basename(uploaded_file.name)
            ext = fname.rsplit(".", 1)[-1].lower()
            target_dir = DATA_DIR
            if ext == "pdf":
                target_dir = os.path.join(DATA_DIR, "pdf_src")
            elif ext in ("txt", "eml"):
                target_dir = os.path.join(DATA_DIR, "emails")
            os.makedirs(target_dir, exist_ok=True)
            save_path = os.path.join(target_dir, fname)
            with open(save_path, "wb") as f:
                f.write(uploaded_file.getbuffer())
            st.success(f"✓ Saved `{fname}`")
            if run_ingestion_with_spinner():
                st.success("✓ Re-indexed!")
                st.rerun()

    if st.button("🔄 Re-index All", use_container_width=True):
        if run_ingestion_with_spinner():
            st.success("✓ Re-indexed all documents.")

    st.divider()

    # Clear chat & Sign Out
    if st.session_state.history:
        if st.button("🗑 Clear Chat", use_container_width=True):
            st.session_state.history = []
            st.session_state.last_context = None
            st.rerun()

    if APP_PASS:
        if st.button("🔒 Sign Out", use_container_width=True):
            st.session_state.authenticated = False
            st.rerun()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN TABS
# ─────────────────────────────────────────────────────────────────────────────
tab_copilot, tab_docs, tab_crm, tab_analytics = st.tabs([
    "◈  AI COPILOT",
    "◈  DOCUMENTS",
    "◈  CRM STUDIO",
    "◈  ANALYTICS",
])


# ── TAB 1: COPILOT ────────────────────────────────────────────────────────────
with tab_copilot:

    # Suggested queries — always visible as chips above the input
    EXAMPLES = [
        "What is our refund policy for bulk orders quoted to Acme Corp?",
        "What payment terms apply to Beta LLC orders now?",
        "What's the current warranty period for hardware products?",
    ]
    st.markdown('<div class="nx-section-label">Suggested Queries</div>', unsafe_allow_html=True)
    cols = st.columns(len(EXAMPLES))
    for i, (col, ex) in enumerate(zip(cols, EXAMPLES)):
        with col:
            if st.button(ex, use_container_width=True, key=f"suggestion-{i}"):
                st.session_state.pending_query = ex

    st.write("")

    # Chat history
    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # Chat input
    query = st.chat_input("Query your knowledge base...")
    if not query and st.session_state.pending_query:
        query = st.session_state.pop("pending_query")

    if query:
        st.session_state.history.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        with st.chat_message("assistant"):
            with st.spinner("Scanning knowledge base..."):
                hits = retrieve(query, top_k=5)
                conflicts = detect_conflicts(hits)
                answer, context_block = generate_answer(query, hits, conflicts, llm_call_fn=get_llm_fn())

            # Conflict boxes
            if conflicts:
                for c in conflicts:
                    st.markdown(f"""
<div class="nx-conflict">
  <div class="nx-conflict-title">Policy conflict on &laquo;{html.escape(c['topic'].replace('_', ' ').upper())}&raquo;</div>
  <div class="nx-conflict-row">
    <span class="nx-conflict-tag trusted">TRUSTED</span>
    <span>{html.escape(c['trusted'].citation)}</span>
  </div>
  {''.join(f'<div class="nx-conflict-row"><span class="nx-conflict-tag outdated">SUPERSEDED</span><span>{html.escape(o.citation)}</span></div>' for o in c['outdated'])}
</div>
                    """, unsafe_allow_html=True)

            # Answer — XSS safe: escape LLM output before injecting
            st.markdown("""<div class="nx-answer-header">
  <span style="color:#7c3aed;font-size:1rem;">◈</span>
  <span class="nx-answer-header-text">Nexa Response</span>
</div>""", unsafe_allow_html=True)

            # Render LLM answer safely via st.markdown (not raw HTML injection)
            with st.container():
                st.markdown(answer)

            # Citation pills — deduplicated by source file
            seen = set()
            unique_hits = []
            for h in hits:
                key = h.metadata.get("source_name", "?")
                if key not in seen:
                    seen.add(key)
                    unique_hits.append(h)

            pills_html = "".join(
                f'<span class="nx-pill {pill_class(h)}">{pill_icon(h)} {html.escape(h.metadata.get("source_name","?"))} · {h.metadata.get("doc_date","?")}</span>'
                for h in unique_hits
            )
            st.markdown(
                f'<div class="nx-section-label" style="margin-top:14px;">Citations</div>'
                f'<div class="nx-citations">{pills_html}</div>',
                unsafe_allow_html=True,
            )

            # Context inspector
            with st.expander("◈  Inspect Retrieved Context"):
                st.code(context_block, language="markdown")

            # Audit log
            try:
                from audit import log_qa_event
                log_qa_event(query, answer, hits, conflicts)
            except Exception:
                pass

            # Flag button — stable key based on history length at time of response
            msg_index = len(st.session_state.history)
            if st.button("⚑ Flag as Incorrect", key=f"flag-{msg_index}"):
                try:
                    from audit import log_qa_event
                    log_qa_event(f"[FLAGGED] {query}", answer, hits, conflicts)
                except Exception:
                    pass
                st.warning("Flagged and logged for review.")

            st.session_state.history.append({"role": "assistant", "content": answer})
            st.session_state.last_context = {
                "query": query, "answer": answer,
                "hits": [{"text": h.text, "citation": h.citation} for h in hits],
                "conflicts": [{"topic": c["topic"], "trusted": c["trusted"].citation} for c in conflicts],
            }


# ── TAB 2: DOCUMENTS (LIFECYCLE MANAGEMENT) ──────────────────────────────────
with tab_docs:
    st.markdown('<div class="nx-section-label">Document Repository & Index Management</div>', unsafe_allow_html=True)
    st.caption("Manage ingested business records, view index status, and delete outdated source files.")

    all_docs = get_all_documents()

    if not all_docs:
        st.info("No documents currently stored. Upload files via the sidebar.")
    else:
        # Search & filter bar
        col_search, col_filter = st.columns([3, 1])
        with col_search:
            search_term = st.text_input("🔍 Search documents...", key="doc_search", placeholder="Filter by document name or keyword...").strip().lower()
        with col_filter:
            doc_type_filter = st.selectbox("Type Filter", ["All", "PDF", "Excel", "Email"], key="doc_filter")

        filtered_docs = [
            d for d in all_docs
            if (not search_term or search_term in d["name"].lower())
            and (doc_type_filter == "All" or d["type"] == doc_type_filter)
        ]

        st.write("")
        st.markdown(f"**Showing {len(filtered_docs)} of {len(all_docs)} documents**")

        for idx, doc in enumerate(filtered_docs):
            with st.container():
                cols = st.columns([0.5, 3, 1.5, 1.5, 2])
                with cols[0]:
                    st.markdown(f"### {doc['icon']}")
                with cols[1]:
                    st.markdown(f"**{doc['name']}**")
                    st.caption(f"Path: `data/{doc['type'].lower() if doc['type'] != 'Excel' else ''}/{doc['name']}`")
                with cols[2]:
                    st.markdown(f"**Type:** {doc['type']}")
                    st.caption(f"Size: {doc['size_kb']} KB")
                with cols[3]:
                    st.markdown(f"**Document Date:**")
                    st.caption(f"`{doc['date']}`")
                with cols[4]:
                    if st.button("🗑 Delete File", key=f"del_doc_{idx}_{doc['name']}", type="secondary", use_container_width=True):
                        # Delete vector embeddings from ChromaDB
                        chunks_deleted = delete_document_from_index(doc["name"])
                        # Remove file from disk
                        try:
                            if os.path.exists(doc["path"]):
                                os.remove(doc["path"])
                            st.success(f"Deleted `{doc['name']}` ({chunks_deleted} vector chunks removed).")
                            st.rerun()
                        except Exception as err:
                            st.error(f"Failed to delete file: {err}")

                st.divider()

        st.markdown('<div class="nx-section-label">⚡ Proactive Policy Conflict Scanner</div>', unsafe_allow_html=True)
        st.caption("Perform a proactive full-database scan to identify all active policy contradictions across your knowledge base.")

        if st.button("🔎 Scan Entire Knowledge Base for Conflicts", key="btn_scan_all_conflicts", use_container_width=False):
            with st.spinner("Scanning all indexed documents..."):
                active_conflicts = scan_all_conflicts()
                if not active_conflicts:
                    st.success("✅ Clean Knowledge Base: Zero contradictions detected across indexed documents!")
                else:
                    st.warning(f"⚠️ Detected {len(active_conflicts)} active policy conflict(s) across your documents:")
                    for c in active_conflicts:
                        st.markdown(f"""
<div class="nx-conflict">
  <div class="nx-conflict-title">Policy conflict on &laquo;{html.escape(c['topic'].replace('_', ' ').upper())}&raquo;</div>
  <div class="nx-conflict-row">
    <span class="nx-conflict-tag trusted">TRUSTED</span>
    <span>{html.escape(c['trusted'].citation)}</span>
  </div>
  {''.join(f'<div class="nx-conflict-row"><span class="nx-conflict-tag outdated">SUPERSEDED</span><span>{html.escape(o.citation)}</span></div>' for o in c['outdated'])}
</div>
                        """, unsafe_allow_html=True)


# ── TAB 3: CRM STUDIO ─────────────────────────────────────────────────────────
with tab_crm:
    st.markdown('<div class="nx-section-label">CRM Support Ticket Generator</div>', unsafe_allow_html=True)
    st.caption("Auto-populate customer support tickets from Nexa's cited answers.")

    ctx = st.session_state.last_context
    col1, col2 = st.columns(2)

    with col1:
        subject = st.text_input("Ticket Subject", value=(ctx["query"] if ctx else ""), placeholder="e.g. Refund policy dispute")
        # Smart client detection — not hardcoded to Acme
        auto_client = _detect_client(ctx["query"]) if ctx else ""
        client = st.text_input("Client Name", value=auto_client, placeholder="e.g. Acme Corp")
        priority = st.selectbox("Priority Level", ["Low", "Medium", "High", "Urgent"], index=1)
        ticket_type = st.selectbox("Ticket Type", ["Policy Inquiry", "Refund Request", "Payment Dispute", "Warranty Claim", "Other"])

    with col2:
        body_default = ""
        if ctx:
            body_default = (
                f"Auto-populated from Nexa on {datetime.now():%Y-%m-%d %H:%M}\n\n"
                f"Question: {ctx['query']}\n\n"
                f"Answer:\n{ctx['answer']}\n\n"
                f"Citations: {', '.join(h['citation'] for h in ctx['hits'])}"
            )
        body = st.text_area("Ticket Response Body", value=body_default, height=200, placeholder="Describe the issue and resolution...")

    if st.button("Create CRM Ticket ⟶", type="primary", use_container_width=False):
        if not subject.strip():
            st.warning("Please enter a ticket subject.")
        else:
            ticket = {
                "id": f"TCK-{int(datetime.now().timestamp())}",
                "subject": subject, "client": client,
                "priority": priority, "type": ticket_type,
                "body": body,
                "created_at": datetime.now().isoformat(),
                "source": "Nexa AI",
            }
            st.markdown(f"""
<div class="nx-ticket">
  <div class="nx-ticket-badge">✓ TICKET CREATED</div>
  <div style="font-family:'Orbitron',sans-serif;font-size:1rem;color:#34d399;margin-bottom:4px;">{ticket['id']}</div>
  <div style="font-size:0.8rem;color:#6b7280;">Priority: {priority} · Type: {ticket_type}</div>
  <div style="font-size:0.8rem;color:#6b7280;margin-top:4px;">Ready to sync · HubSpot / Zendesk / Salesforce</div>
</div>
            """, unsafe_allow_html=True)
            
            import json
            import pandas as pd
            ticket_json = json.dumps(ticket, indent=2)
            ticket_df = pd.DataFrame([ticket])
            ticket_csv = ticket_df.to_csv(index=False)

            col_dl1, col_dl2 = st.columns(2)
            with col_dl1:
                st.download_button(
                    label="📥 Download JSON Ticket",
                    data=ticket_json,
                    file_name=f"{ticket['id']}.json",
                    mime="application/json",
                    use_container_width=True
                )
            with col_dl2:
                st.download_button(
                    label="📊 Download CSV Record",
                    data=ticket_csv,
                    file_name=f"{ticket['id']}.csv",
                    mime="text/csv",
                    use_container_width=True
                )

            with st.expander("◈ View Raw JSON Payload"):
                st.json(ticket)


# ── TAB 3: ANALYTICS ──────────────────────────────────────────────────────────
with tab_analytics:
    st.markdown('<div class="nx-section-label">Knowledge Base Analytics & Audit Log</div>', unsafe_allow_html=True)

    audit_file = os.path.join(DATA_DIR, "audit_log.jsonl")
    audit_entries = []
    if os.path.exists(audit_file):
        with open(audit_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        import json
                        audit_entries.append(json.loads(line))
                    except Exception:
                        pass

    # Metrics row
    col_a, col_b, col_c, col_d = st.columns(4)
    with col_a:
        st.metric("Total Queries", len(audit_entries))
    with col_b:
        conflict_count = sum(1 for e in audit_entries if e.get("conflicts_detected"))
        st.metric("Conflicts Resolved", conflict_count)
    with col_c:
        flagged = sum(1 for e in audit_entries if e.get("query", "").startswith("[FLAGGED]"))
        st.metric("Flagged Responses", flagged)
    with col_d:
        st.metric("Embedder", "384-dim MiniLM")

    st.divider()

    # Visual Analytics Charts
    st.markdown('<div class="nx-section-label">Document Distribution & Query Metrics</div>', unsafe_allow_html=True)
    
    col_chart1, col_chart2 = st.columns(2)
    
    import pandas as pd
    
    with col_chart1:
        st.caption("📄 Knowledge Base Document Types")
        doc_counts = pd.DataFrame({
            "Source Type": ["PDF Documents", "Excel Workbooks", "Email Threads"],
            "Count": [pdf_count, sheet_count, email_count]
        }).set_index("Source Type")
        st.bar_chart(doc_counts, color="#7c3aed")
        
    with col_chart2:
        st.caption("⚡ Resolution & Conflict Rates")
        normal_queries = max(0, len(audit_entries) - conflict_count - flagged)
        resolution_counts = pd.DataFrame({
            "Category": ["Direct Answers", "Conflicts Detected", "Flagged Queries"],
            "Queries": [normal_queries, conflict_count, flagged]
        }).set_index("Category")
        st.bar_chart(resolution_counts, color="#ec4899")

    st.divider()

    # Audit timeline
    st.markdown('<div class="nx-section-label">Recent Audit Trail</div>', unsafe_allow_html=True)

    if audit_entries:
        for entry in reversed(audit_entries[-15:]):
            ts = entry.get("timestamp", "")[:19].replace("T", " ")
            q = entry.get("query", "")
            has_conflict = bool(entry.get("conflicts_detected"))
            is_flagged = q.startswith("[FLAGGED]")

            conflict_tag = '<span class="nx-audit-conflict-tag">⚠ CONFLICT</span>' if has_conflict else ""
            flagged_tag = '<span class="nx-audit-conflict-tag" style="background:rgba(251,146,60,0.1);color:#fbbf24;border-color:rgba(251,146,60,0.28);">⚑ FLAGGED</span>' if is_flagged else ""
            short_q = html.escape(q[:80]) + ("…" if len(q) > 80 else "")
            short_a = html.escape(entry.get("answer", "")[:120]) + "…"

            st.markdown(f"""
<div class="nx-audit-entry">
  <div class="nx-audit-time">🕐 {ts}</div>
  <div class="nx-audit-query">{short_q}</div>
  <div style="font-size:0.78rem;color:#4b5563;-webkit-text-fill-color:#4b5563;margin-top:4px;">{short_a}</div>
  <div style="margin-top:6px;">{conflict_tag}{flagged_tag}</div>
</div>
            """, unsafe_allow_html=True)
    else:
        st.markdown("""
<div style="text-align:center;padding:48px 0;color:#374151;">
  <div style="font-size:2.5rem;margin-bottom:12px;">📭</div>
  <div style="font-family:'Orbitron',sans-serif;font-size:0.8rem;color:#4b5563;letter-spacing:0.12em;">NO QUERIES YET</div>
  <div style="font-size:0.85rem;color:#374151;margin-top:8px;">Ask a question in the AI Copilot tab to see analytics here.</div>
</div>
        """, unsafe_allow_html=True)
