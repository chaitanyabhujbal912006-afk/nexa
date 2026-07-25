import os
from datetime import datetime

import streamlit as st

from rag_engine import retrieve, detect_conflicts, generate_answer

st.set_page_config(page_title="Nexa — SME Knowledge Agent", page_icon="⚡", layout="wide")

# ---------------------------------------------------------------------------
# LLM provider layer — supports Gemini Flash (primary) and Groq (secondary).
# Falls back to the deterministic mock in rag_engine.py when no key is set,
# so the demo always works with zero setup and zero cost (RULES.md §LLM).
#
# Priority order (per RULES.md §LLM provider policy):
#   1. Gemini Flash — generous free tier, no credit card required
#   2. Groq (llama-3.3-70b-versatile) — free tier, ultra-fast inference
#   3. Demo mode — rule-based mock, always works offline
#
# Keys are read from (in priority order):
#   1. os.environ  — set by CI/CD, Docker, or PowerShell $env:
#   2. .streamlit/secrets.toml — local dev convenience (never commit to git)
#   3. Streamlit Cloud Secrets — production deployment
# ---------------------------------------------------------------------------

def _load_secrets():
    """Pull any keys defined in st.secrets into os.environ if not already set.
    This lets secrets.toml work locally and Streamlit Cloud secrets work in prod
    without changing any of the provider call functions below."""
    for key in ("GEMINI_API_KEY", "GROQ_API_KEY"):
        if key not in os.environ:
            try:
                os.environ[key] = st.secrets[key]
            except (KeyError, FileNotFoundError):
                pass  # not configured — that's fine, demo mode will kick in

_load_secrets()

GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-1.5-flash"


def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    """Call Google Gemini via REST. Raises on failure."""
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
    """Call Groq OpenAI-compatible API. Raises on failure."""
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
    """Dispatch to the best available LLM provider (Gemini → Groq → demo)."""
    if os.environ.get("GEMINI_API_KEY"):
        return _call_gemini(system_prompt, user_prompt)
    if os.environ.get("GROQ_API_KEY"):
        return _call_groq(system_prompt, user_prompt)
    # Caller should have checked get_llm_fn() first; this shouldn't be reached.
    raise RuntimeError("No LLM API key configured.")


def get_active_provider() -> str:
    """Return a human-readable label for the currently active LLM provider."""
    if os.environ.get("GEMINI_API_KEY"):
        return f"🟢 Gemini Flash (live)"
    if os.environ.get("GROQ_API_KEY"):
        return f"🟢 Groq · {GROQ_MODEL} (live)"
    return "🟡 Demo mode"


def get_llm_fn():
    """Return call_llm if any real key is configured, else None (→ demo mode)."""
    if os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY"):
        return call_llm
    return None


# ---------------------------------------------------------------------------
# Styling & Typography
# ---------------------------------------------------------------------------
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');

html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
}

h1, h2, h3, h4 {
    font-family: 'Outfit', sans-serif !important;
}

#MainMenu, footer, header {visibility: hidden;}

.hero {
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 20px;
    padding: 32px 38px;
    margin-bottom: 24px;
    color: white;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.1);
}
.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(99, 102, 241, 0.25);
    border: 1px solid rgba(165, 180, 252, 0.3);
    color: #c7d2fe;
    padding: 5px 14px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.04em;
    margin-bottom: 14px;
}
.hero h1 { margin: 0 0 6px 0; font-size: 2.1rem; font-weight: 700; color: #ffffff; }
.hero p { margin: 0; opacity: 0.88; font-size: 0.96rem; line-height: 1.5; color: #e2e8f0; }

.stat-card {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 14px 16px; text-align: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.06); }
.stat-card .num { font-family: 'Outfit', sans-serif; font-size: 1.5rem; font-weight: 700; color: #4f46e5; }
.stat-card .lbl { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }

.source-pill {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 5px 14px; margin: 4px 6px 4px 0;
    border-radius: 20px; font-size: 0.78rem; font-weight: 500;
    background: #eef2ff; color: #4338ca; border: 1px solid #c7d2fe;
}
.conflict-box {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-left: 5px solid #f97316; border-radius: 12px;
    padding: 16px 20px; margin: 14px 0; font-size: 0.92rem; color: #9a3412;
    box-shadow: 0 4px 6px -1px rgba(249, 115, 22, 0.08);
}
.answer-box {
    background: #ffffff; border: 1px solid #e2e8f0; border-left: 5px solid #4f46e5;
    border-radius: 14px; padding: 20px 24px; margin: 12px 0;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); font-size: 0.98rem; line-height: 1.65;
}
.ticket-card {
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 14px;
    padding: 18px 22px; margin-top: 14px; color: #166534;
}
.analytics-card {
    background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
    padding: 20px 24px; margin-bottom: 16px;
}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="hero">
  <div class="hero-badge">⚡ NEXA INTELLIGENCE ENGINE v2.0</div>
  <h1>Nexa Knowledge Agent</h1>
  <p>Ask natural questions across policy PDFs, multi-sheet spreadsheets, and email threads — get one instant, cited answer with conflict detection and automated auditability.</p>
</div>
""", unsafe_allow_html=True)

if "history" not in st.session_state:
    st.session_state.history = []
if "last_context" not in st.session_state:
    st.session_state.last_context = None

# ---------------------------------------------------------------------------
# Sidebar
# ---------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 📚 Knowledge Base")
    
    # Dynamic counts from data directory
    pdf_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "pdf_src", "*.pdf")))
    sheet_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "*.xlsx")))
    email_count = len(glob.glob(os.path.join(os.path.dirname(__file__), "data", "emails", "*.*")))

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f'<div class="stat-card"><div class="num">{pdf_count}</div><div class="lbl">PDF</div></div>', unsafe_allow_html=True)
    with c2:
        st.markdown(f'<div class="stat-card"><div class="num">{sheet_count}</div><div class="lbl">Sheet</div></div>', unsafe_allow_html=True)
    with c3:
        st.markdown(f'<div class="stat-card"><div class="num">{email_count}</div><div class="lbl">Emails</div></div>', unsafe_allow_html=True)

    st.write("")
    provider_label = get_active_provider()
    st.markdown(f"**Answer Engine:** {provider_label}")
    if not (os.environ.get("GEMINI_API_KEY") or os.environ.get("GROQ_API_KEY")):
        st.caption("Set `GROQ_API_KEY` or `GEMINI_API_KEY` for live LLM reasoning.")

    st.divider()
    st.markdown("### 📤 Upload Workspace")
    uploaded_file = st.file_uploader("Add PDF, Excel, TXT, or EML document", type=["pdf", "xlsx", "txt", "eml"])
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
            save_path = os.path.join(target_dir, fname)
            with open(save_path, "wb") as f:
                f.write(uploaded_file.getbuffer())

            st.success(f"Saved {fname}! Re-indexing knowledge base...")
            import subprocess
            subprocess.run(["python3", "ingest.py"], cwd=os.path.dirname(__file__))
            st.success("Re-ingestion complete!")
            st.rerun()

    if st.button("🔄 Re-run Full Ingestion", use_container_width=True):
        import subprocess
        subprocess.run(["python3", "ingest.py"], cwd=os.path.dirname(__file__))
        st.success("Re-ingested all source files.")

# ---------------------------------------------------------------------------
# Main Tabbed Workspaces
# ---------------------------------------------------------------------------
tab_copilot, tab_crm, tab_analytics = st.tabs([
    "💬 Nexa AI Copilot", 
    "🎫 CRM Ticket Studio", 
    "📊 Knowledge Analytics & Audit Log"
])

with tab_copilot:
    if not st.session_state.history:
        st.markdown("**Suggested Questions:**")
        examples = [
            "What is our refund policy for bulk orders quoted to Acme Corp last month?",
            "What did Beta LLC order and how much did they pay?",
            "What's the restocking fee on standard orders?",
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

    query = st.chat_input("Ask a question across your policies, pricing, and email threads...")
    if not query and st.session_state.get("pending_query"):
        query = st.session_state.pop("pending_query")

    if query:
        st.session_state.history.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        with st.chat_message("assistant"):
            with st.spinner("Searching PDFs, spreadsheets, and emails..."):
                hits = retrieve(query, top_k=5)
                conflicts = detect_conflicts(hits)
                answer, context_block = generate_answer(query, hits, conflicts, llm_call_fn=get_llm_fn())

            if conflicts:
                for c in conflicts:
                    st.markdown(f"""
    <div class="conflict-box">
    ⚠️ <b>Conflict detected on <code>{c['topic']}</code></b><br>
    <b>Trusted (most recent):</b> {c['trusted'].citation}<br>
    <b>Superseded:</b> {', '.join(o.citation for o in c['outdated'])}
    </div>
                    """, unsafe_allow_html=True)

            st.markdown(f'<div class="answer-box">{answer}</div>', unsafe_allow_html=True)

            st.markdown("**Citations & Sources Used:**")
            pills = "".join(f'<span class="source-pill">📄 {h.citation}</span>' for h in hits)
            st.markdown(pills, unsafe_allow_html=True)

            with st.expander("🔍 Inspect Retrieved Context Block & Prompt"):
                st.code(context_block, language="markdown")

            # Audit log Q&A turn
            try:
                from audit import log_qa_event
                log_qa_event(query, answer, hits, conflicts)
            except Exception:
                pass

            # Feedback flag button
            if st.button("🚩 Flag Answer as Incorrect", key=f"flag-{len(st.session_state.history)}"):
                try:
                    from audit import log_qa_event
                    log_qa_event(f"[USER FLAGGED INCORRECT] {query}", answer, hits, conflicts)
                except Exception:
                    pass
                st.warning("Flagged! Logged for administrator review.")

            st.session_state.history.append({"role": "assistant", "content": answer})
            st.session_state.last_context = {
                "query": query,
                "answer": answer,
                "hits": [{"text": h.text, "citation": h.citation} for h in hits],
                "conflicts": [{"topic": c["topic"], "trusted": c["trusted"].citation} for c in conflicts],
            }
            st.rerun()

with tab_crm:
    st.markdown("### 🎫 CRM Support Ticket Generator")
    st.caption("Auto-populate customer support tickets directly from Nexa's cited answers.")

    ctx = st.session_state.last_context
    col1, col2 = st.columns(2)

    with col1:
        subject = st.text_input("Ticket Subject", value=(ctx["query"] if ctx else ""))
        client = st.text_input("Client Name", value="Acme Corp" if ctx and "acme" in ctx["query"].lower() else "")
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

    if st.button("Create CRM Ticket ➜", type="primary"):
        ticket = {
            "id": f"TCK-{int(datetime.now().timestamp())}",
            "subject": subject,
            "client": client,
            "priority": priority,
            "body": body,
            "created_at": datetime.now().isoformat(),
        }
        st.markdown(f"""
    <div class="ticket-card">
    ✅ <b>Ticket {ticket['id']} Created Successfully</b> (Ready for sync with HubSpot/Zendesk)
    </div>
        """, unsafe_allow_html=True)
        st.json(ticket)

with tab_analytics:
    st.markdown("### 📊 Knowledge Base Analytics & Audit Log")
    st.caption("Inspect live system performance metrics and historical Q&A audit trails.")

    col_a, col_b, col_c = st.columns(3)
    
    # Read audit log entries
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

    with col_a:
        st.metric("Total Queries Handled", len(audit_entries))
    with col_b:
        conflicts_count = sum(1 for e in audit_entries if e.get("conflicts_detected"))
        st.metric("Document Conflicts Resolved", conflicts_count)
    with col_c:
        st.metric("Embedder Dimension", "384 (MiniLM-L6)")

    st.divider()
    st.markdown("#### 📜 Recent Audit Trail")
    if audit_entries:
        for entry in reversed(audit_entries[-10:]):
            with st.expander(f"⏱️ {entry.get('timestamp', '')[:19]} — Question: {entry.get('query', '')[:60]}..."):
                st.write(f"**Full Query:** {entry.get('query')}")
                st.write(f"**Generated Answer:**\n{entry.get('answer')}")
                if entry.get("conflicts_detected"):
                    st.warning(f"Conflicts Detected: {entry.get('conflicts_detected')}")
                st.json(entry.get("citations"))
    else:
        st.info("No Q&A turns logged yet. Ask a question in the Copilot tab to start tracking.")

