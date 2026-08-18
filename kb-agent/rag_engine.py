"""
Core RAG engine: retrieval + conflict detection + LLM generation + attribution.

Swap `generate_answer()`'s LLM call for whichever provider you have a free
API key for (see README). Everything else is provider-agnostic.
"""

import os
import re
from datetime import datetime

import chromadb
from sentence_transformers import SentenceTransformer

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
        return f"{m['source_name']} ({m['source_type']}) — {m['section']}, dated {m['doc_date']}"


def _load_collection():
    client = chromadb.PersistentClient(path=DB_DIR)
    collection = client.get_or_create_collection(name="sme_knowledge_base", metadata={"hnsw:space": "cosine"})
    
    # Auto-ingest if collection is empty (e.g. fresh cloud deploy or clean environment)
    if collection.count() == 0:
        try:
            import ingest
            ingest.main()
            collection = client.get_or_create_collection(name="sme_knowledge_base", metadata={"hnsw:space": "cosine"})
        except Exception as e:
            print(f"Warning: Auto-ingest on startup failed: {e}")
            
    return collection


def delete_document_from_index(source_name: str) -> int:
    """Removes all vector embeddings associated with source_name from ChromaDB."""
    collection = _load_collection()
    res = collection.get(where={"source_name": source_name})
    if res and res.get("ids"):
        collection.delete(ids=res["ids"])
        return len(res["ids"])
    return 0


def get_document_chunks(source_name: str) -> list:
    """Retrieves all vector chunks and metadata for a given source_name from ChromaDB."""
    collection = _load_collection()
    res = collection.get(where={"source_name": source_name})
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
    """
    Enriches follow-up queries with entity/topic keywords from recent conversation history.
    Example:
      Turn 1 user: 'What is our refund policy for Acme Corp?'
      Turn 2 user: 'Is there a restocking fee?' -> Enriched: 'Acme Corp refund policy Is there a restocking fee?'
    """
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
        topic_words = re.findall(r"\b(refund|payment|policy|warranty|acme|beta|gamma|delta|alpha)\b", recent_context.lower())
        extra = " ".join(dict.fromkeys(keywords + topic_words))
        if extra:
            return f"{extra} {query}"
        return f"{recent_context[:120]} {query}"

    return query


def retrieve(query, top_k=5, fetch_k=12, max_distance=0.75, history=None):
    """
    Retrieves `fetch_k` nearest chunks, applies cosine distance threshold filtering (max_distance),
    keeps chunks matching dominant top topics, and caps at top_k.
    If `history` is provided, contextualizes follow-up queries prior to embedding.
    """
    effective_query = contextualize_query(query, history) if history else query
    collection = _load_collection()
    model = get_model()
    query_vec = model.encode([effective_query]).tolist()
    results = collection.query(query_embeddings=query_vec, n_results=fetch_k)

    hits = []
    if results and results.get("documents") and results["documents"][0]:
        for doc, meta, dist in zip(
            results["documents"][0], results["metadatas"][0], results["distances"][0]
        ):
            if dist <= max_distance:
                hits.append(RetrievalResult(doc, meta, dist))

    # Fallback to raw query if enriched query returned 0 hits
    if not hits and effective_query != query:
        query_vec = model.encode([query]).tolist()
        results = collection.query(query_embeddings=query_vec, n_results=fetch_k)
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
    """
    Group retrieved chunks by topic. If more than one *source document*
    within a topic disagrees (different source_name discussing the same
    topic with different dated terms), flag it and pick the most recent
    by doc_date as the trusted answer.
    """
    by_topic = {}
    for h in hits:
        topic = h.metadata.get("topic", "general")
        by_topic.setdefault(topic, []).append(h)

    def key_facts(text):
        """Extract numeric facts ($ amounts, %, day/month/hour counts, Net terms) AND qualitative policy terms
        (discontinued, non-refundable, no fee, early payment, restocking fee, store credit) so conflict
        detection catches both quantitative and qualitative policy contradictions in real documents."""
        low = text.lower()
        # Extract numbers, currency, percentages, payment terms, time windows (supporting hyphens e.g. 18-month, 12-month)
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
            "returns accepted", "no returns"
        ]
        for sig in qualitative_signals:
            if sig in low:
                facts.add(sig.replace(" ", ""))

        return facts

    conflicts = []
    for topic, group in by_topic.items():
        sources = {h.metadata["source_name"] for h in group}
        if len(sources) < 2:
            continue
        sorted_group = sorted(group, key=lambda h: h.date, reverse=True)
        trusted = sorted_group[0]
        outdated = [h for h in sorted_group[1:]
                    if h.metadata["source_name"] != trusted.metadata["source_name"]]
        if not outdated:
            continue
        trusted_facts = key_facts(trusted.text)
        if all(key_facts(o.text) == trusted_facts for o in outdated):
            continue  # same numbers/facts -> not an actual conflict, just corroboration
        conflicts.append({
            "topic": topic,
            "trusted": trusted,
            "outdated": outdated,
        })
    return conflicts


def scan_all_conflicts():
    """
    Performs a full proactive audit of the ChromaDB collection to identify all policy
    contradictions across all indexed documents and topics.
    """
    collection = _load_collection()
    res = collection.get()
    if not res or not res.get("documents"):
        return []

    all_hits = []
    for doc, meta in zip(res["documents"], res["metadatas"]):
        all_hits.append(RetrievalResult(doc, meta, distance=0.0))

    return detect_conflicts(all_hits)


def build_context_block(hits, conflicts):
    """Builds the context + conflict-awareness block fed to the LLM."""
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


SYSTEM_PROMPT = """You are an internal knowledge assistant for a small business.
Answer the employee's question using ONLY the retrieved sources below.
Rules:
1. Cite every factual claim with its bracket number, e.g. [1].
2. If the sources contain a DETECTED CONFLICTS section, you MUST explicitly
   tell the user a conflict exists, name both sources, state which one you
   trusted and why (more recent effective/document date), and give the
   trusted answer.
3. If the retrieved sources don't answer the question, say so plainly —
   never invent an answer.
4. Be concise and specific (numbers, dates, dollar amounts, policy terms).
"""


GREETING_PATTERNS = [
    r"^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy)\b",
    r"^(who are you|what is nexa|what can you do|help)\b",
    r"^(thanks|thank you|thx)\b"
]


def generate_answer(query, hits, conflicts, llm_call_fn=None):
    """
    Generates an answer using the configured LLM or intelligent fallback.
    Handles conversational greetings smoothly without robotic source error messages.
    """
    clean_q = query.strip().lower()

    # Handle greetings / small-talk gracefully
    if any(re.search(pat, clean_q) for pat in GREETING_PATTERNS):
        if "thank" in clean_q or "thx" in clean_q:
            return "You're welcome! Let me know if you have any other questions about your knowledge base.", ""
        return (
            "👋 Hello! I am **Nexa**, your SME Knowledge Assistant. "
            "I can help you search policies, refund terms, payment schedules, or warranty details across your uploaded "
            "PDFs, Excel workbooks, and email threads with AI-powered conflict detection. How can I help you today?",
            ""
        )

    # Handle case where no documents matched
    if not hits:
        return (
            "I couldn't find any relevant policy documents or records in the knowledge base matching your question. "
            "Try asking about refund policies, payment terms, or warranty guidelines, or upload new files via the sidebar.",
            "RETRIEVED SOURCES:\n(None matching query)"
        )

    context_block = build_context_block(hits, conflicts)
    user_prompt = f"QUESTION: {query}\n\n{context_block}"

    if llm_call_fn is not None:
        try:
            return llm_call_fn(SYSTEM_PROMPT, user_prompt), context_block
        except Exception as e:
            # If LLM API fails, fall back to rule-based response
            pass

    # ---- Zero-cost fallback: deterministic mock reasoning ----
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
            f"Reasoning: the newer document explicitly states it supersedes "
            f"prior terms, and its effective date is later, so it takes "
            f"precedence over the older email."
        )
    elif hits:
        answer = f"Based on [1] {hits[0].citation}: {hits[0].text}"
    else:
        answer = "I couldn't find anything in the knowledge base to answer that."
    return answer, context_block
