"""
llm_config.py — Shared LLM configuration for Nexa.
Imported by both app.py (Streamlit) and api.py (FastAPI).
No Streamlit dependency here.
"""

import os

GROQ_MODEL = "llama-3.3-70b-versatile"
GEMINI_MODEL = "gemini-1.5-flash"


def load_secrets():
    """Try to load API keys from Streamlit secrets into env (no-op if not in Streamlit)."""
    for key in ("GEMINI_API_KEY", "GROQ_API_KEY"):
        if key not in os.environ:
            try:
                import streamlit as st
                os.environ[key] = st.secrets[key]
            except Exception:
                pass


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
    errors = []
    if os.environ.get("GEMINI_API_KEY"):
        try:
            return _call_gemini(system_prompt, user_prompt)
        except Exception as e:
            errors.append(f"Gemini error: {e}")
    if os.environ.get("GROQ_API_KEY"):
        try:
            return _call_groq(system_prompt, user_prompt)
        except Exception as e:
            errors.append(f"Groq error: {e}")

    if errors:
        raise RuntimeError(" | ".join(errors))
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
