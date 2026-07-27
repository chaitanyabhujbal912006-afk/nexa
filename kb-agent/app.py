import os
import glob
from datetime import datetime

import streamlit as st

from rag_engine import retrieve, detect_conflicts, generate_answer

st.set_page_config(page_title="Nexa — SME Knowledge Agent", page_icon="⚡", layout="wide")

# ---------------------------------------------------------------------------
# LLM provider layer — supports Gemini Flash (primary) and Groq (secondary).
# ---------------------------------------------------------------------------

def _load_secrets():
    for key in ("GEMINI_API_KEY", "GROQ_API_KEY"):
        if key not in os.environ:
            try:
                os.environ[key] = st.secrets[key]
            except (KeyError, FileNotFoundError):
                pass

_load_secrets()

GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-1.5-flash"


def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    import requests
    api_key = os.environ["GEMINI_API_KEY"]
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_MODEL}:generateContent?key={api_key}"
    )
    payload = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"parts": [{"text": user_prompt}]}],
    }
    r = requests.post(url, json=payload, timeout=45)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]


def _call_groq(system_prompt: str, user_prompt: str) -> str:
    import requests
    api_key = os.environ["GROQ_API_KEY"]
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1024,
    }
    r = requests.post(url, json=payload, headers=headers, timeout=45)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def call_llm(system_prompt: str, user_prompt: str) -> str:
    if os.environ.get("GEMINI_API_KEY"):
        return _call_gemini(system_prompt, user_prompt)
    if os.environ.get("GROQ_API_KEY"):
        return _call_groq(system_prompt, user_prompt)
    raise RuntimeError("No LLM API key configured.")


def get_active_provider() -> str:
    if os.environ.get("GEMINI_API_KEY"):
        return "GEMINI FLASH"
    if os.environ.get("GROQ_API_KEY"):
        return f"GROQ · {GROQ_MODEL}"
    return "DEMO MODE"


def get_llm_fn():
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY"):
        return call_llm
    return None


# ---------------------------------------------------------------------------
# 🔥 CRAZY UI — Cyberpunk Bento Grid Design System
# ---------------------------------------------------------------------------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap');

/* ─── RESET & BASE ─── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, [data-testid="stAppViewContainer"] {
    background: #050008 !important;
    color: #e2d9f3 !important;
}

[data-testid="stAppViewContainer"] {
    background:
        radial-gradient(ellipse 80% 50% at 20% -10%, rgba(124,58,237,0.35) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 110%, rgba(236,72,153,0.25) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%),
        #050008 !important;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.6); border-radius: 4px; }

/* Hide Streamlit chrome */
#MainMenu, footer, header, [data-testid="stToolbar"] { visibility: hidden !important; }
[data-testid="stSidebarNav"] { display: none !important; }

/* ─── GLOBAL FONT ─── */
html, body, [class*="css"], .stMarkdown, p, span, div {
    font-family: 'Inter', sans-serif !important;
}
h1, h2, h3, h4, h5 {
    font-family: 'Orbitron', sans-serif !important;
}
code, pre, .mono {
    font-family: 'JetBrains Mono', monospace !important;
}

/* ─── SIDEBAR ─── */
[data-testid="stSidebar"] {
    background: rgba(10,0,20,0.92) !important;
    border-right: 1px solid rgba(124,58,237,0.3) !important;
    backdrop-filter: blur(20px) !important;
}
[data-testid="stSidebar"] * { color: #c4b5fd !important; }
[data-testid="stSidebar"] h3 {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 0.75rem !important;
    letter-spacing: 0.15em !important;
    color: #7c3aed !important;
    text-transform: uppercase !important;
}

/* ─── HERO ─── */
.nx-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg,
        rgba(124,58,237,0.15) 0%,
        rgba(99,102,241,0.1) 40%,
        rgba(236,72,153,0.08) 100%);
    border: 1px solid rgba(124,58,237,0.4);
    border-radius: 24px;
    padding: 40px 48px;
    margin-bottom: 28px;
}
.nx-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 40px,
        rgba(124,58,237,0.03) 40px,
        rgba(124,58,237,0.03) 41px
    ),
    repeating-linear-gradient(
        90deg,
        transparent,
        transparent 80px,
        rgba(124,58,237,0.02) 80px,
        rgba(124,58,237,0.02) 81px
    );
    border-radius: 24px;
    pointer-events: none;
}
.nx-hero::after {
    content: '';
    position: absolute;
    top: -40%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%);
    pointer-events: none;
    animation: pulse-orb 4s ease-in-out infinite;
}
@keyframes pulse-orb {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.15); opacity: 1; }
}

.nx-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(124,58,237,0.2);
    border: 1px solid rgba(167,139,250,0.4);
    color: #c4b5fd;
    padding: 6px 16px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 16px;
    font-family: 'JetBrains Mono', monospace !important;
}
.nx-badge .dot {
    width: 6px; height: 6px;
    background: #a78bfa;
    border-radius: 50%;
    animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.2; }
}

.nx-hero h1 {
    font-size: 2.8rem !important;
    font-weight: 900 !important;
    line-height: 1.1 !important;
    background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 40%, #ec4899 100%);
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
    margin-bottom: 12px !important;
    letter-spacing: -0.02em !important;
}
.nx-hero p {
    color: #94a3b8;
    font-size: 0.95rem;
    line-height: 1.7;
    max-width: 640px;
}
.nx-provider-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16,185,129,0.1);
    border: 1px solid rgba(16,185,129,0.3);
    color: #34d399;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-family: 'JetBrains Mono', monospace !important;
    font-weight: 600;
    letter-spacing: 0.06em;
    margin-top: 16px;
}
.nx-provider-pill .live-dot {
    width: 6px; height: 6px;
    background: #34d399;
    border-radius: 50%;
    box-shadow: 0 0 6px #34d399;
    animation: blink 1.2s ease-in-out infinite;
}

/* ─── BENTO STAT CARDS ─── */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin: 16px 0;
}
.bento-card {
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.25);
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    transition: all 0.25s ease;
    cursor: default;
    position: relative;
    overflow: hidden;
}
.bento-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(124,58,237,0.05), transparent);
    opacity: 0;
    transition: opacity 0.25s;
}
.bento-card:hover { border-color: rgba(167,139,250,0.6); transform: translateY(-2px); }
.bento-card:hover::before { opacity: 1; }
.bento-card .num {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 1.8rem;
    font-weight: 900;
    color: #a78bfa;
    display: block;
    line-height: 1.1;
}
.bento-card .lbl {
    font-size: 0.62rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 600;
    font-family: 'JetBrains Mono', monospace !important;
    margin-top: 4px;
}

/* ─── TABS ─── */
[data-testid="stTabs"] button {
    font-family: 'Orbitron', sans-serif !important;
    font-size: 0.72rem !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    color: #64748b !important;
    border-radius: 8px 8px 0 0 !important;
    padding: 10px 20px !important;
    transition: all 0.2s !important;
}
[data-testid="stTabs"] button[aria-selected="true"] {
    color: #a78bfa !important;
    border-bottom: 2px solid #7c3aed !important;
    background: rgba(124,58,237,0.08) !important;
}
[data-testid="stTabs"] button:hover {
    color: #c4b5fd !important;
    background: rgba(124,58,237,0.05) !important;
}

/* ─── EXAMPLE BUTTONS ─── */
[data-testid="stButton"] > button {
    background: rgba(124,58,237,0.1) !important;
    border: 1px solid rgba(124,58,237,0.35) !important;
    color: #c4b5fd !important;
    border-radius: 12px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    padding: 10px 18px !important;
    transition: all 0.2s ease !important;
    cursor: pointer !important;
}
[data-testid="stButton"] > button:hover {
    background: rgba(124,58,237,0.25) !important;
    border-color: rgba(167,139,250,0.6) !important;
    color: #ffffff !important;
    box-shadow: 0 0 20px rgba(124,58,237,0.3) !important;
    transform: translateY(-1px) !important;
}
[data-testid="stButton"] > button[kind="primary"] {
    background: linear-gradient(135deg, #7c3aed, #6366f1) !important;
    border: none !important;
    color: #ffffff !important;
    box-shadow: 0 4px 20px rgba(124,58,237,0.4) !important;
}
[data-testid="stButton"] > button[kind="primary"]:hover {
    box-shadow: 0 6px 30px rgba(124,58,237,0.6) !important;
    transform: translateY(-2px) !important;
}

/* ─── CHAT INPUT ─── */
[data-testid="stChatInput"] textarea {
    background: rgba(124,58,237,0.06) !important;
    border: 1px solid rgba(124,58,237,0.3) !important;
    border-radius: 16px !important;
    color: #e2d9f3 !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 0.92rem !important;
    transition: all 0.2s !important;
}
[data-testid="stChatInput"] textarea:focus {
    border-color: rgba(167,139,250,0.7) !important;
    box-shadow: 0 0 0 3px rgba(124,58,237,0.15), 0 0 30px rgba(124,58,237,0.1) !important;
    background: rgba(124,58,237,0.1) !important;
}
[data-testid="stChatInput"] button {
    background: linear-gradient(135deg, #7c3aed, #ec4899) !important;
    border-radius: 10px !important;
    border: none !important;
}

/* ─── CHAT MESSAGES ─── */
[data-testid="stChatMessage"] {
    background: transparent !important;
    border: none !important;
}
[data-testid="stChatMessage"][data-testid*="user"] {
    background: rgba(124,58,237,0.07) !important;
    border: 1px solid rgba(124,58,237,0.2) !important;
    border-radius: 16px !important;
    margin: 8px 0 !important;
}

/* ─── CONFLICT BOX ─── */
.nx-conflict {
    background: linear-gradient(135deg,
        rgba(236,72,153,0.06) 0%,
        rgba(251,146,60,0.04) 100%);
    border: 1px solid rgba(236,72,153,0.4);
    border-left: 4px solid #ec4899;
    border-radius: 16px;
    padding: 18px 22px;
    margin: 14px 0;
    position: relative;
    overflow: hidden;
}
.nx-conflict::before {
    content: '⚠ CONFLICT';
    position: absolute;
    top: 12px;
    right: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #ec4899;
    background: rgba(236,72,153,0.12);
    padding: 3px 8px;
    border-radius: 100px;
    border: 1px solid rgba(236,72,153,0.3);
}
.nx-conflict-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    color: #f9a8d4;
    margin-bottom: 8px;
    padding-right: 80px;
}
.nx-conflict-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 6px 0;
    font-size: 0.83rem;
    color: #cbd5e1;
    line-height: 1.5;
}
.nx-conflict-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 100px;
    white-space: nowrap;
    flex-shrink: 0;
}
.nx-conflict-tag.trusted {
    background: rgba(52,211,153,0.12);
    color: #34d399;
    border: 1px solid rgba(52,211,153,0.3);
}
.nx-conflict-tag.outdated {
    background: rgba(236,72,153,0.12);
    color: #f9a8d4;
    border: 1px solid rgba(236,72,153,0.3);
}

/* ─── ANSWER BOX ─── */
.nx-answer {
    background: rgba(15,0,30,0.6);
    border: 1px solid rgba(124,58,237,0.35);
    border-top: 3px solid #7c3aed;
    border-radius: 0 0 20px 20px;
    padding: 24px 28px;
    margin: 0 0 16px 0;
    font-size: 0.95rem;
    line-height: 1.75;
    color: #e2d9f3;
    position: relative;
    backdrop-filter: blur(10px);
}
.nx-answer-header {
    display: flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.1));
    border: 1px solid rgba(124,58,237,0.35);
    border-bottom: none;
    border-radius: 20px 20px 0 0;
    padding: 12px 20px;
    margin-top: 14px;
}
.nx-answer-header-text {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #a78bfa;
    text-transform: uppercase;
}

/* ─── SOURCE PILLS ─── */
.nx-citations {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0;
}
.nx-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 100px;
    font-size: 0.72rem;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    border: 1px solid;
    transition: all 0.2s;
}
.nx-pill.pdf {
    background: rgba(99,102,241,0.1);
    border-color: rgba(99,102,241,0.35);
    color: #a5b4fc;
}
.nx-pill.email {
    background: rgba(234,179,8,0.08);
    border-color: rgba(234,179,8,0.3);
    color: #fde68a;
}
.nx-pill.excel {
    background: rgba(52,211,153,0.08);
    border-color: rgba(52,211,153,0.3);
    color: #6ee7b7;
}
.nx-pill:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* ─── TICKET CARD ─── */
.nx-ticket {
    background: rgba(52,211,153,0.05);
    border: 1px solid rgba(52,211,153,0.25);
    border-radius: 16px;
    padding: 20px 24px;
    margin-top: 16px;
    position: relative;
}
.nx-ticket-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #34d399;
    text-transform: uppercase;
    background: rgba(52,211,153,0.1);
    border: 1px solid rgba(52,211,153,0.25);
    padding: 3px 10px;
    border-radius: 100px;
    display: inline-block;
    margin-bottom: 10px;
}

/* ─── ANALYTICS CARDS ─── */
.nx-analytics {
    background: rgba(10,0,25,0.5);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 14px;
    backdrop-filter: blur(8px);
}
.nx-metric-num {
    font-family: 'Orbitron', sans-serif;
    font-size: 2.2rem;
    font-weight: 900;
    background: linear-gradient(135deg, #a78bfa, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
}
.nx-metric-label {
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 6px;
}

/* ─── EXPANDER ─── */
[data-testid="stExpander"] {
    background: rgba(124,58,237,0.05) !important;
    border: 1px solid rgba(124,58,237,0.2) !important;
    border-radius: 12px !important;
}
[data-testid="stExpander"] summary {
    color: #94a3b8 !important;
    font-size: 0.82rem !important;
    font-family: 'JetBrains Mono', monospace !important;
}

/* ─── INPUTS ─── */
[data-testid="stTextInput"] input,
[data-testid="stTextArea"] textarea,
[data-testid="stSelectbox"] select {
    background: rgba(124,58,237,0.06) !important;
    border: 1px solid rgba(124,58,237,0.25) !important;
    border-radius: 10px !important;
    color: #e2d9f3 !important;
    font-family: 'Inter', sans-serif !important;
}
[data-testid="stTextInput"] input:focus,
[data-testid="stTextArea"] textarea:focus {
    border-color: rgba(167,139,250,0.6) !important;
    box-shadow: 0 0 0 2px rgba(124,58,237,0.15) !important;
}

label, [data-testid="stWidgetLabel"] {
    color: #94a3b8 !important;
    font-size: 0.78rem !important;
    font-family: 'JetBrains Mono', monospace !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
}

/* ─── FILE UPLOADER ─── */
[data-testid="stFileUploader"] {
    background: rgba(124,58,237,0.05) !important;
    border: 1px dashed rgba(124,58,237,0.3) !important;
    border-radius: 12px !important;
}

/* ─── DIVIDER ─── */
hr { border-color: rgba(124,58,237,0.15) !important; }

/* ─── METRIC ─── */
[data-testid="stMetric"] {
    background: rgba(124,58,237,0.07);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 14px;
    padding: 16px !important;
}
[data-testid="stMetricValue"] {
    font-family: 'Orbitron', sans-serif !important;
    color: #a78bfa !important;
}
[data-testid="stMetricLabel"] {
    color: #64748b !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.7rem !important;
    text-transform: uppercase !important;
    letter-spacing: 0.08em !important;
}

/* ─── ALERTS / INFO ─── */
[data-testid="stInfo"] {
    background: rgba(124,58,237,0.06) !important;
    border: 1px solid rgba(124,58,237,0.2) !important;
    border-radius: 12px !important;
    color: #c4b5fd !important;
}
[data-testid="stWarning"] {
    background: rgba(251,146,60,0.06) !important;
    border: 1px solid rgba(251,146,60,0.2) !important;
    border-radius: 12px !important;
}
[data-testid="stSuccess"] {
    background: rgba(52,211,153,0.06) !important;
    border: 1px solid rgba(52,211,153,0.2) !important;
    border-radius: 12px !important;
}

/* ─── SPINNER ─── */
[data-testid="stSpinner"] p { color: #a78bfa !important; font-family: 'JetBrains Mono', monospace !important; }

/* ─── CODE BLOCK ─── */
pre, code {
    background: rgba(0,0,0,0.4) !important;
    border: 1px solid rgba(124,58,237,0.2) !important;
    border-radius: 8px !important;
    color: #c4b5fd !important;
    font-family: 'JetBrains Mono', monospace !important;
}

/* ─── SCAN LINE OVERLAY ─── */
body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(0,0,0,0.04) 3px,
        rgba(0,0,0,0.04) 4px
    );
    pointer-events: none;
    z-index: 9999;
}

/* ─── CAPTION ─── */
.stCaption, [data-testid="stCaptionContainer"] {
    color: #475569 !important;
    font-family: 'JetBrains Mono', monospace !important;
    font-size: 0.72rem !important;
}

/* ─── SUGGESTED QUESTIONS LABEL ─── */
.nx-section-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    color: #4b5563;
    text-transform: uppercase;
    margin-bottom: 12px;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 10px;
}
.nx-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(124,58,237,0.3), transparent);
}
</style>
""", unsafe_allow_html=True)


# ─── HERO ───
provider_label = get_active_provider()
pdf_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "pdf_src", "*.pdf")))
sheet_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "*.xlsx")))
email_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "emails", "*.*")))

st.markdown(f"""
<div class="nx-hero">
  <div class="nx-badge"><span class="dot"></span>NEXA INTELLIGENCE ENGINE v2.0</div>
  <h1>Knowledge Agent</h1>
  <p>Ask natural questions across policy PDFs, multi-sheet spreadsheets, and email threads —
     get one instant, cited answer with AI-powered conflict detection and full audit traceability.</p>
  <div class="nx-provider-pill"><span class="live-dot"></span>{provider_label} &nbsp;·&nbsp; LIVE INFERENCE</div>
</div>
""", unsafe_allow_html=True)

if "history" not in st.session_state:
    st.session_state.history = []
if "last_context" not in st.session_state:
    st.session_state.last_context = None

# ─── SIDEBAR ───
with st.sidebar:
    st.markdown("### 📚 Knowledge Base")

    st.markdown(f"""
    <div class="bento-grid">
      <div class="bento-card"><span class="num">{pdf_count}</span><span class="lbl">PDFs</span></div>
      <div class="bento-card"><span class="num">{sheet_count}</span><span class="lbl">Sheets</span></div>
      <div class="bento-card"><span class="num">{email_count}</span><span class="lbl">Emails</span></div>
    </div>
    """, unsafe_allow_html=True)

    st.write("")
    if not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY")):
        st.caption("Set `GROQ_API_KEY` or `GEMINI_API_KEY` for live LLM.")

    st.divider()
    st.markdown("### 📤 Upload Workspace")
    uploaded_file = st.file_uploader("Add PDF, Excel, TXT, or EML", type=["pdf", "xlsx", "txt", "eml"])
    if uploaded_file is not None:
        if st.button("Save & Ingest Document", use_container_width=True, type="primary"):
            fname = uploaded_file.name
            ext = fname.split(".")[-1].lower()
            target_dir = os.path.join(os.path.dirname(__file__), "data")
            if ext == "pdf":
                target_dir = os.path.join(target_dir, "pdf_src")
            elif ext in ("txt", "eml"):
                target_dir = os.path.join(target_dir, "emails")
            os.makedirs(target_dir, exist_ok=True)
            with open(os.path.join(target_dir, fname), "wb") as f:
                f.write(uploaded_file.getbuffer())
            st.success(f"Saved {fname}! Re-indexing...")
            import subprocess
            subprocess.run(["python", "ingest.py"], cwd=os.path.dirname(__file__))
            st.success("Re-ingestion complete!")
            st.rerun()

    if st.button("🔄 Re-run Full Ingestion", use_container_width=True):
        import subprocess
        subprocess.run(["python", "ingest.py"], cwd=os.path.dirname(__file__))
        st.success("Re-ingested all source files.")

# ─── MAIN TABS ───
tab_copilot, tab_crm, tab_analytics = st.tabs([
    "◈  AI COPILOT",
    "◈  CRM STUDIO",
    "◈  ANALYTICS",
])

# ─── TAB 1: COPILOT ───
with tab_copilot:
    if not st.session_state.history:
        st.markdown('<div class="nx-section-label">Suggested Queries</div>', unsafe_allow_html=True)
        examples = [
            "What is our refund policy for bulk orders quoted to Acme Corp last month?",
            "What payment terms apply to Beta LLC orders now?",
            "What's the current warranty period for hardware products?",
        ]
        cols = st.columns(len(examples))
        clicked = None
        for col, ex in zip(cols, examples):
            with col:
                if st.button(ex, use_container_width=True, key=f"ex-{ex}"):
                    clicked = ex
        st.session_state.setdefault("pending_query", None)
        if clicked:
            st.session_state.pending_query = clicked

    for msg in st.session_state.history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    query = st.chat_input("Query your knowledge base...")
    if not query and st.session_state.get("pending_query"):
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

            if conflicts:
                for c in conflicts:
                    st.markdown(f"""
<div class="nx-conflict">
  <div class="nx-conflict-title">Policy conflict detected on &laquo;{c['topic'].replace('_', ' ').upper()}&raquo;</div>
  <div class="nx-conflict-row">
    <span class="nx-conflict-tag trusted">TRUSTED</span>
    <span>{c['trusted'].citation}</span>
  </div>
  {''.join(f'<div class="nx-conflict-row"><span class="nx-conflict-tag outdated">SUPERSEDED</span><span>{o.citation}</span></div>' for o in c['outdated'])}
</div>
                    """, unsafe_allow_html=True)

            st.markdown("""<div class="nx-answer-header">
  <span style="color:#7c3aed;font-size:1rem;">◈</span>
  <span class="nx-answer-header-text">Nexa Response</span>
</div>""", unsafe_allow_html=True)
            st.markdown(f'<div class="nx-answer">{answer}</div>', unsafe_allow_html=True)

            # Citations
            def pill_class(h):
                t = h.metadata.get("source_type", "pdf")
                if t == "email": return "email"
                if t == "excel": return "excel"
                return "pdf"
            def pill_icon(h):
                t = h.metadata.get("source_type", "pdf")
                if t == "email": return "✉"
                if t == "excel": return "⊞"
                return "⬡"

            pills_html = "".join(
                f'<span class="nx-pill {pill_class(h)}">{pill_icon(h)} {h.metadata.get("source_name","?")} · {h.metadata.get("doc_date","?")}</span>'
                for h in hits
            )
            st.markdown(f'<div class="nx-section-label" style="margin-top:16px;">Citations</div><div class="nx-citations">{pills_html}</div>', unsafe_allow_html=True)

            with st.expander("◈  Inspect Retrieved Context & Prompt"):
                st.code(context_block, language="markdown")

            # Audit
            try:
                from audit import log_qa_event
                log_qa_event(query, answer, hits, conflicts)
            except Exception:
                pass

            if st.button("⚑ Flag as Incorrect", key=f"flag-{len(st.session_state.history)}"):
                try:
                    from audit import log_qa_event
                    log_qa_event(f"[USER FLAGGED] {query}", answer, hits, conflicts)
                except Exception:
                    pass
                st.warning("Flagged and logged for administrator review.")

            st.session_state.history.append({"role": "assistant", "content": answer})
            st.session_state.last_context = {
                "query": query, "answer": answer,
                "hits": [{"text": h.text, "citation": h.citation} for h in hits],
                "conflicts": [{"topic": c["topic"], "trusted": c["trusted"].citation} for c in conflicts],
            }
            st.rerun()

# ─── TAB 2: CRM ───
with tab_crm:
    st.markdown('<div class="nx-section-label">CRM Support Ticket Generator</div>', unsafe_allow_html=True)
    st.caption("Auto-populate customer support tickets directly from Nexa's cited answers.")

    ctx = st.session_state.last_context
    col1, col2 = st.columns(2)

    with col1:
        subject = st.text_input("Ticket Subject", value=(ctx["query"] if ctx else ""))
        client = st.text_input("Client Name", value="Acme Corp" if ctx and "acme" in (ctx.get("query","")).lower() else "")
        priority = st.selectbox("Priority Level", ["Low", "Medium", "High", "Urgent"], index=1)

    with col2:
        body_default = ""
        if ctx:
            body_default = (
                f"Auto-populated from Nexa on {datetime.now():%Y-%m-%d %H:%M}\n\n"
                f"Question: {ctx['query']}\n\n"
                f"Answer:\n{ctx['answer']}\n\n"
                f"Citations: {', '.join(h['citation'] for h in ctx['hits'])}"
            )
        body = st.text_area("Ticket Response Body", value=body_default, height=180)

    if st.button("Create CRM Ticket ⟶", type="primary"):
        ticket = {
            "id": f"TCK-{int(datetime.now().timestamp())}",
            "subject": subject, "client": client,
            "priority": priority, "body": body,
            "created_at": datetime.now().isoformat(),
        }
        st.markdown(f"""
<div class="nx-ticket">
  <div class="nx-ticket-badge">✓ TICKET CREATED</div>
  <div style="font-family:'Orbitron',sans-serif;font-size:1rem;color:#34d399;margin-bottom:6px;">{ticket['id']}</div>
  <div style="font-size:0.82rem;color:#94a3b8;">Ready for sync · HubSpot / Zendesk / Salesforce</div>
</div>
        """, unsafe_allow_html=True)
        st.json(ticket)

# ─── TAB 3: ANALYTICS ───
with tab_analytics:
    st.markdown('<div class="nx-section-label">Knowledge Base Analytics & Audit Log</div>', unsafe_allow_html=True)

    audit_file = os.path.join(os.path.dirname(__file__), "data", "audit_log.jsonl")
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

    col_a, col_b, col_c = st.columns(3)
    with col_a:
        st.metric("Total Queries", len(audit_entries))
    with col_b:
        conflicts_count = sum(1 for e in audit_entries if e.get("conflicts_detected"))
        st.metric("Conflicts Resolved", conflicts_count)
    with col_c:
        st.metric("Embedder", "384-dim MiniLM")

    st.divider()
    st.markdown('<div class="nx-section-label">Recent Audit Trail</div>', unsafe_allow_html=True)
    if audit_entries:
        for entry in reversed(audit_entries[-10:]):
            with st.expander(f"◈  {entry.get('timestamp','')[:19]}  ·  {entry.get('query','')[:55]}..."):
                st.write(f"**Query:** {entry.get('query')}")
                st.write(f"**Answer:**\n{entry.get('answer')}")
                if entry.get("conflicts_detected"):
                    st.warning(f"Conflicts: {entry.get('conflicts_detected')}")
                st.json(entry.get("citations"))
    else:
        st.info("No Q&A turns logged yet. Ask a question in the AI Copilot tab.")
