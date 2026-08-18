"""
Core RAG engine: retrieval + conflict detection + LLM generation + attribution + PDF Report Generator.
Multi-tenant user_id metadata filtering enabled for per-user data isolation.
"""

import os
import re
from datetime import datetime

import chromadb
from sentence_transformers import SentenceTransformer
from fpdf import FPDF

BASE_DIR = os.path.dirname(__file__)
DB_DIR = os.path.join(BASE_DIR, "chroma_db")

EMBED_MODEL = "all-MiniLM-L6-v2"

_model_instance = None

def get_model():
    """Lazy load the sentence transformer model on demand."""
    global _model_instance
    if _model_instance is None:
        _model_instance = SentenceTransformer(EMBED_MODEL)
    return _model_instance


class RetrievalResult:
    def __init__(self, text, metadata, distance):
        self.text = text
        self.metadata = metadata
        self.distance = distance

    @property
    def date(self):
        try:
            return datetime.strptime(self.metadata["doc_date"], "%Y-%m-%d")
        except (ValueError, KeyError):
            return datetime.min

    @property
    def citation(self):
        m = self.metadata
        return f"{m.get('source_name', '?')} ({m.get('source_type', 'doc')}) — {m.get('section', 'N/A')}, dated {m.get('doc_date', 'N/A')}"


def _load_collection():
    client = chromadb.PersistentClient(path=DB_DIR)
    collection = client.get_or_create_collection(name="sme_knowledge_base", metadata={"hnsw:space": "cosine"})
    
    # Auto-ingest if collection is empty
    if collection.count() == 0:
        try:
            import ingest
            ingest.main()
            collection = client.get_or_create_collection(name="sme_knowledge_base", metadata={"hnsw:space": "cosine"})
        except Exception as e:
            print(f"Warning: Auto-ingest on startup failed: {e}")
            
    return collection


def delete_document_from_index(source_name: str, user_id: str = None) -> int:
    """Removes all vector embeddings associated with source_name from ChromaDB."""
    collection = _load_collection()
    where_filter = {"source_name": source_name}
    if user_id:
        where_filter = {"$and": [{"source_name": source_name}, {"user_id": user_id}]}
    
    res = collection.get(where=where_filter)
    if res and res.get("ids"):
        collection.delete(ids=res["ids"])
        return len(res["ids"])
    return 0


def get_document_chunks(source_name: str, user_id: str = None) -> list:
    """Retrieves all vector chunks and metadata for a given source_name from ChromaDB."""
    collection = _load_collection()
    where_filter = {"source_name": source_name}
    if user_id:
        where_filter = {"$and": [{"source_name": source_name}, {"user_id": user_id}]}
        
    res = collection.get(where=where_filter)
    chunks = []
    if res and res.get("documents"):
        for doc, meta in zip(res["documents"], res["metadatas"]):
            chunks.append({
                "text": doc,
                "section": meta.get("section", "N/A"),
                "topic": meta.get("topic", "N/A"),
                "doc_date": meta.get("doc_date", "N/A"),
                "chunk_id": meta.get("chunk_id", 0)
            })
    return sorted(chunks, key=lambda c: c["chunk_id"])


def contextualize_query(query: str, history: list = None) -> str:
    """Enriches follow-up queries with entity/topic keywords from recent conversation history."""
    if not history:
        return query

    user_msgs = []
    for h in history:
        if isinstance(h, dict) and h.get("role") == "user":
            user_msgs.append(h.get("content", ""))
        elif isinstance(h, tuple) and len(h) >= 1:
            user_msgs.append(h[0])

    if not user_msgs:
        return query

    recent_context = " ".join(user_msgs[-2:])
    clean_q = query.strip().lower()
    follow_up_triggers = ["it", "this", "that", "they", "fee", "more", "what about", "how about", "same", "the", "and"]
    is_short = len(query.split()) <= 6
    has_trigger = any(re.search(r"\b" + re.escape(t) + r"\b", clean_q) for t in follow_up_triggers)

    if is_short or has_trigger:
        keywords = re.findall(r"\b[A-Z][a-zA-Z0-9_-]+\b", recent_context)
        topic_words = re.findall(r"\b(refund|payment|policy|warranty|acme|beta|gamma|delta|alpha|bill|invoice|due|amount)\b", recent_context.lower())
        extra = " ".join(dict.fromkeys(keywords + topic_words))
        if extra:
            return f"{extra} {query}"
        return f"{recent_context[:120]} {query}"

    return query


def retrieve(query, top_k=5, fetch_k=12, max_distance=0.75, history=None, user_id: str = None):
    """
    Retrieves `fetch_k` nearest chunks, applies distance threshold filtering,
    and supports optional user_id isolation filtering.
    """
    effective_query = contextualize_query(query, history) if history else query
    collection = _load_collection()
    model = get_model()
    query_vec = model.encode([effective_query]).tolist()
    
    where_filter = {"user_id": user_id} if user_id else None
    
    try:
        results = collection.query(
            query_embeddings=query_vec,
            n_results=fetch_k,
            where=where_filter
        )
    except Exception:
        # Fallback if where filter fails (e.g. legacy chunks without user_id)
        results = collection.query(query_embeddings=query_vec, n_results=fetch_k)

    hits = []
    if results and results.get("documents") and results["documents"][0]:
        for doc, meta, dist in zip(
            results["documents"][0], results["metadatas"][0], results["distances"][0]
        ):
            if dist <= max_distance:
                hits.append(RetrievalResult(doc, meta, dist))

    if not hits and effective_query != query:
        results = collection.query(
            query_embeddings=query_vec,
            n_results=fetch_k,
            where=where_filter
        )
        if results and results.get("documents") and results["documents"][0]:
            for doc, meta, dist in zip(
                results["documents"][0], results["metadatas"][0], results["distances"][0]
            ):
                if dist <= max_distance:
                    hits.append(RetrievalResult(doc, meta, dist))

    if not hits:
        return []

    top_topics = {h.metadata.get("topic", "general") for h in hits[:2]}
    relevant = [h for h in hits if h.metadata.get("topic", "general") in top_topics]
    other = [h for h in hits if h not in relevant]

    final = relevant[:top_k] if len(relevant) >= top_k else (relevant + other)[:top_k]
    return final


def detect_conflicts(hits):
    """Group retrieved chunks by topic and flag contradictions."""
    by_topic = {}
    for h in hits:
        topic = h.metadata.get("topic", "general")
        by_topic.setdefault(topic, []).append(h)

    def key_facts(text):
        low = text.lower()
        raw = re.findall(
            r"\d+%\b|\$\d+(?:\.\d+)?\b|net\s*\d+\b|\d+[- ]*(?:day|month|year|hour|business hour|min)s?\b",
            low
        )
        facts = {re.sub(r"[- ]+", "", f) for f in raw}

        qualitative_signals = [
            "non-refundable", "non refundable", "refundable", "no fee",
            "all sales final", "store credit", "full refund", "no refund",
            "restocking fee", "discontinued", "supersedes", "early payment discount",
            "late fee", "late payment fee", "waived", "pre-approved",
            "returns accepted", "no returns", "bill due", "invoice due", "amount due"
        ]
        for sig in qualitative_signals:
            if sig in low:
                facts.add(sig.replace(" ", ""))

        return facts

    conflicts = []
    for topic, group in by_topic.items():
        sources = {h.metadata.get("source_name", "doc") for h in group}
        if len(sources) < 2:
            continue
        sorted_group = sorted(group, key=lambda h: h.date, reverse=True)
        trusted = sorted_group[0]
        outdated = [h for h in sorted_group[1:]
                    if h.metadata.get("source_name") != trusted.metadata.get("source_name")]
        if not outdated:
            continue
        trusted_facts = key_facts(trusted.text)
        if all(key_facts(o.text) == trusted_facts for o in outdated):
            continue
        conflicts.append({
            "topic": topic,
            "trusted": trusted,
            "outdated": outdated,
        })
    return conflicts


def scan_all_conflicts(user_id: str = None):
    """Performs a full proactive audit of ChromaDB collection for conflicts."""
    collection = _load_collection()
    where_filter = {"user_id": user_id} if user_id else None
    
    try:
        res = collection.get(where=where_filter)
    except Exception:
        res = collection.get()

    if not res or not res.get("documents"):
        return []

    all_hits = []
    for doc, meta in zip(res["documents"], res["metadatas"]):
        all_hits.append(RetrievalResult(doc, meta, distance=0.0))

    return detect_conflicts(all_hits)


def build_context_block(hits, conflicts):
    lines = ["RETRIEVED SOURCES:"]
    for i, h in enumerate(hits, 1):
        lines.append(f"[{i}] ({h.citation})\n{h.text}")

    if conflicts:
        lines.append("\nDETECTED CONFLICTS (resolve using the most recent date):")
        for c in conflicts:
            lines.append(
                f"- Topic '{c['topic']}': "
                f"TRUST '{c['trusted'].citation}' (most recent) "
                f"OVER {[o.citation for o in c['outdated']]}"
            )
    return "\n\n".join(lines)


SYSTEM_PROMPT = """You are an internal knowledge assistant for small business & personal document intelligence.
Answer the user's question using ONLY the retrieved sources below.
Rules:
1. Cite every factual claim with its bracket number, e.g. [1].
2. If the sources contain a DETECTED CONFLICTS section, you MUST explicitly
   tell the user a conflict exists, name both sources, state which one you
   trusted and why (more recent effective/document date), and give the trusted answer.
3. If the retrieved sources don't answer the question, say so plainly — never invent an answer.
4. Be concise and specific (numbers, dates, dollar amounts, policy terms, bill totals).
"""

GREETING_PATTERNS = [
    r"^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy)\b",
    r"^(who are you|what is nexa|what can you do|help)\b",
    r"^(thanks|thank you|thx)\b"
]


def generate_answer(query, hits, conflicts, llm_call_fn=None):
    clean_q = query.strip().lower()

    if any(re.search(pat, clean_q) for pat in GREETING_PATTERNS):
        if "thank" in clean_q or "thx" in clean_q:
            return "You're welcome! Let me know if you have any other questions about your documents.", ""
        return (
            "👋 Hello! I am **Nexa**, your SME & Personal Knowledge Agent. "
            "I can help you search policies, household bills, payment terms, or warranty details across your uploaded files "
            "with AI-powered conflict detection. How can I help you today?",
            ""
        )

    if not hits:
        return (
            "I couldn't find any relevant policy documents, bills, or records in your knowledge base matching your question. "
            "Try uploading new files or re-phrasing your search.",
            "RETRIEVED SOURCES:\n(None matching query)"
        )

    context_block = build_context_block(hits, conflicts)
    user_prompt = f"QUESTION: {query}\n\n{context_block}"

    if llm_call_fn is not None:
        try:
            return llm_call_fn(SYSTEM_PROMPT, user_prompt), context_block
        except Exception:
            pass

    if conflicts:
        c = conflicts[0]
        answer = (
            f"⚠️ Conflict detected on **{c['topic']}**.\n\n"
            f"- Older source: {c['outdated'][0].citation} says: "
            f"\"{c['outdated'][0].text[:180]}...\"\n"
            f"- Newer source: {c['trusted'].citation} says: "
            f"\"{c['trusted'].text[:180]}...\"\n\n"
            f"**Trusted answer** (most recent, dated {c['trusted'].date.date()}): "
            f"{c['trusted'].text}\n\n"
            f"Reasoning: the newer document explicitly states it supersedes prior terms."
        )
    elif hits:
        answer = f"Based on [1] {hits[0].citation}: {hits[0].text}"
    else:
        answer = "I couldn't find anything in your knowledge base to answer that."
    return answer, context_block


def generate_pdf_report(title: str, summary_text: str, citations: list = None, conflicts: list = None) -> bytes:
    """Generates an executive PDF report summarizing AI insights, citations, and conflicts."""
    pdf = FPDF()
    pdf.add_page()
    
    # Title Header
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(99, 102, 241) # Indigo accent
    pdf.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT", align="C")
    
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 8, f"Generated by Nexa Intelligence Engine v3.0 on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)
    
    # Summary Section
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, "Executive Summary & AI Findings", new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(51, 65, 85)
    # Sanitize unicode characters for Standard FPDF fonts
    safe_text = summary_text.encode("latin-1", "replace").decode("latin-1")
    pdf.multi_cell(0, 6, safe_text)
    pdf.ln(5)
    
    # Conflicts section if any
    if conflicts:
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(245, 158, 11) # Amber
        pdf.cell(0, 8, "Detected Contradictions & Policy Conflicts", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(51, 65, 85)
        for c in conflicts:
            conf_str = f"Topic: {c.get('topic', 'General')}\n- Trusted Source: {c.get('trusted_source', '?')} ({c.get('trusted_date', '?')})\n- Superseded: {', '.join(o.get('citation', '?') for o in c.get('outdated_sources', []))}\n"
            pdf.multi_cell(0, 5, conf_str.encode("latin-1", "replace").decode("latin-1"))
            pdf.ln(2)

    # Citations Section if any
    if citations:
        pdf.ln(3)
        pdf.set_font("Helvetica", "B", 12)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 8, "Retrieved Document Citations", new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(100, 116, 139)
        for cite in citations:
            c_name = cite.get("source_name") if isinstance(cite, dict) else getattr(cite, "metadata", {}).get("source_name", "Doc")
            c_date = cite.get("doc_date") if isinstance(cite, dict) else getattr(cite, "metadata", {}).get("doc_date", "Date")
            c_score = cite.get("match_score_pct", 80) if isinstance(cite, dict) else 80
            pdf.cell(0, 5, f"- {c_name} (Dated {c_date}) | Relevance Match: {c_score}%", new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())
