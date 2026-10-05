"""
llm_config.py — Shared LLM configuration for Nexa.
Imported by both app.py (Streamlit) and api.py (FastAPI).
No Streamlit dependency here.
"""

import logging
import os

logger = logging.getLogger("nexa.llm")

# Primary Groq model — updated 2026-08 (llama-3.3-70b-versatile retired from this account)
GROQ_MODEL = "compound"          # Groq's own high-quality chat model
GROQ_MODEL_FALLBACK = "qwen/qwen3.6-27b"  # fallback if compound unavailable
GEMINI_MODEL = "gemini-2.0-flash"


def load_secrets():
    """Try to load API keys from Streamlit secrets into env (no-op if not in Streamlit)."""
    for key in ("GEMINI_API_KEY", "GROQ_API_KEY", "PINECONE_API_KEY", "PINECONE_INDEX", "RESEND_API_KEY", "RESEND_FROM_EMAIL"):
        if key not in os.environ:
            try:
                import streamlit as st
                val = st.secrets.get(key)
                if val:
                    os.environ[key] = val
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

    for model in (GROQ_MODEL, GROQ_MODEL_FALLBACK):
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.2,
            "max_tokens": 1024,
        }
        r = requests.post(url, json=payload, headers=headers, timeout=45)
        if r.status_code == 404:
            continue  # model not found, try fallback
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]

    raise RuntimeError(f"No available Groq model found. Tried: {GROQ_MODEL}, {GROQ_MODEL_FALLBACK}")


def call_llm(system_prompt: str, user_prompt: str) -> str:
    """
    Intelligent dual-provider dispatcher:
    1. If GROQ_API_KEY configured, attempt Groq first.
    2. If Groq fails (rate limit, model unavailable) and GEMINI_API_KEY is available, fail over to Gemini.
    3. If only GEMINI_API_KEY is configured, call Gemini directly.
    """
    groq_key = os.environ.get("GROQ_API_KEY")
    gemini_key = os.environ.get("GEMINI_API_KEY")

    if groq_key:
        try:
            return _call_groq(system_prompt, user_prompt)
        except Exception as groq_err:
            if gemini_key:
                logger.warning("Groq call encountered error (%s). Seamlessly failing over to Gemini...", groq_err)
                return _call_gemini(system_prompt, user_prompt)
            raise

    if gemini_key:
        return _call_gemini(system_prompt, user_prompt)

    raise RuntimeError("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured.")


def get_active_provider() -> str:
    has_groq = bool(os.environ.get("GROQ_API_KEY"))
    has_gemini = bool(os.environ.get("GEMINI_API_KEY"))

    if has_groq and has_gemini:
        return f"GROQ · {GROQ_MODEL} (Gemini failover)"
    if has_groq:
        return f"GROQ · {GROQ_MODEL}"
    if has_gemini:
        return f"GEMINI · {GEMINI_MODEL}"
    return "DEMO MODE (no API key set)"


def get_llm_fn():
    if os.environ.get("GROQ_API_KEY") or os.environ.get("GEMINI_API_KEY"):
        return call_llm
    return None
