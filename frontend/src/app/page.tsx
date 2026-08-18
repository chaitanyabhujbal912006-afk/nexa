"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Confetti trigger helper
const triggerConfetti = () => {
  // Safe browser visual trigger
};
import {
  BrainCircuit,
  MessageSquare,
  FileText,
  Ticket,
  BarChart3,
  Sparkles,
  ShieldAlert,
  Search,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Mail,
  FileCode,
  Download,
  Copy,
  ExternalLink,
  ChevronRight,
  Zap,
  Activity,
  Layers,
  Database,
  Lock,
  ArrowUpRight,
  Filter,
  Check,
} from "lucide-react";
import {
  api,
  QueryResponse,
  HealthResponse,
  DocumentItem,
  Conflict,
  AuditEntry,
} from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  responseMeta?: QueryResponse;
  timestamp: string;
}

export default function NexaDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"copilot" | "docs" | "crm" | "analytics">("copilot");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [selectedContext, setSelectedContext] = useState<QueryResponse | null>(null);

  // Repository Filters
  const [docSearch, setDocSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // CRM Ticket Form State
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketClient, setTicketClient] = useState("");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketCategory, setTicketCategory] = useState("Policy Inquiry");
  const [ticketBody, setTicketBody] = useState("");
  const [generatedTicket, setGeneratedTicket] = useState<any>(null);

  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchHealthAndData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchHealthAndData = async () => {
    try {
      setError(null);
      const [hRes, docRes, confRes, auditRes] = await Promise.allSettled([
        api.getHealth(),
        api.listDocuments(),
        api.getConflicts(),
        api.getAuditLog(50),
      ]);

      if (hRes.status === "fulfilled") setHealth(hRes.value);
      if (docRes.status === "fulfilled") setDocuments(docRes.value.documents);
      if (confRes.status === "fulfilled") setConflicts(confRes.value.conflicts);
      if (auditRes.status === "fulfilled") setAuditEntries(auditRes.value.entries);
    } catch (err: any) {
      console.error("API error:", err);
      setError("Unable to connect to backend API. Make sure FastAPI server is running.");
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    const userMsgId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setLoading(true);
    setError(null);

    try {
      const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await api.query({ query: q, top_k: 5, history: historyPayload });

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: response.answer,
        responseMeta: response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSelectedContext(response);

      // Refresh audit log in background
      api.getAuditLog(50).then((res) => setAuditEntries(res.entries)).catch(() => {});
    } catch (err: any) {
      console.error("Query failed:", err);
      setError(err.message || "Failed to retrieve response from AI engine.");
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: `⚠️ System Error: ${err.message || "Failed to process query."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIngesting(true);
    setError(null);
    try {
      const file = files[0];
      await api.uploadDocument(file);
      triggerConfetti();
      await fetchHealthAndData();
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setIngesting(false);
      e.target.value = "";
    }
  };

  const handleDeleteDocument = async (docName: string) => {
    if (!confirm(`Are you sure you want to delete ${docName}?`)) return;
    try {
      await api.deleteDocument(docName);
      await fetchHealthAndData();
    } catch (err: any) {
      setError(err.message || "Failed to delete document.");
    }
  };

  const handleReingest = async () => {
    setIngesting(true);
    try {
      await api.triggerIngest();
      await fetchHealthAndData();
    } catch (err: any) {
      setError(err.message || "Re-ingestion failed.");
    } finally {
      setIngesting(false);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConvertToCrm = (meta: QueryResponse) => {
    setTicketSubject(meta.query);
    setTicketBody(
      `Generated from Nexa AI Knowledge Engine\n\nQuestion: ${meta.query}\n\nAnswer:\n${meta.answer}\n\nCitations:\n` +
        meta.citations.map((c) => `- ${c.citation} (${c.match_score_pct}% match)`).join("\n")
    );

    // Client auto-detection
    const qLow = meta.query.toLowerCase();
    if (qLow.includes("acme")) setTicketClient("Acme Corp");
    else if (qLow.includes("beta")) setTicketClient("Beta LLC");
    else if (qLow.includes("gamma")) setTicketClient("Gamma Inc");
    else setTicketClient("General Client");

    setActiveTab("crm");
  };

  const handleCreateTicket = () => {
    if (!ticketSubject.trim()) return;
    const ticket = {
      id: `TCK-${Date.now()}`,
      subject: ticketSubject,
      client: ticketClient,
      priority: ticketPriority,
      category: ticketCategory,
      body: ticketBody,
      created_at: new Date().toISOString(),
    };
    setGeneratedTicket(ticket);
    triggerConfetti();
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered docs
  const filteredDocs = documents.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(docSearch.toLowerCase());
    const matchesType = typeFilter === "ALL" || d.type.toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans">
      {/* ── Ambient Background Glows ────────────────────────────────────────────── */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="fixed top-1/3 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* ── HEADER BAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xl tracking-tight gradient-text">Nexa Intelligence Engine</h1>
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full">
                v2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Policy Conflict-Aware RAG Agent</p>
          </div>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GROQ · {health?.provider || "openai/gpt-oss-120b"}</span>
          </div>

          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-mono">
            <Database className="w-3.5 h-3.5" />
            <span>{health ? `${health.kb_stats.pdfs + health.kb_stats.excel + health.kb_stats.csv + health.kb_stats.emails} Source Docs` : "Connecting..."}</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-80 glass-panel rounded-2xl p-5 gap-6 border border-slate-800/80">
          {/* Knowledge Base Metrics Bento */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> KB Metrics
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-3 rounded-xl text-center">
                <span className="block text-2xl font-bold font-mono text-indigo-400">{health?.kb_stats.pdfs ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">PDFs</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <span className="block text-2xl font-bold font-mono text-emerald-400">{health?.kb_stats.excel ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Excel</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <span className="block text-2xl font-bold font-mono text-amber-400">{health?.kb_stats.emails ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Emails</span>
              </div>
              <div className="glass-card p-3 rounded-xl text-center">
                <span className="block text-2xl font-bold font-mono text-rose-400">{health?.kb_stats.csv ?? 0}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">CSVs</span>
              </div>
            </div>
          </div>

          {/* Upload Box */}
          <div>
            <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-indigo-400" /> Upload Document
            </h3>
            <label className="glass-card border-dashed border-indigo-500/40 hover:border-indigo-400 p-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-indigo-400" />
              <span className="text-xs text-slate-300 text-center font-medium">Drop PDF, Excel, CSV, EML</span>
              <span className="text-[10px] text-slate-500">Auto-routes & re-indexes</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.xlsx,.xls,.csv,.txt,.eml" disabled={ingesting} />
            </label>
            {ingesting && (
              <div className="mt-2 text-xs font-mono text-indigo-400 flex items-center gap-2 justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ingesting & embedding...
              </div>
            )}
          </div>

          {/* Quick Document List */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-indigo-400" /> Recent Docs
              </h3>
              <button onClick={handleReingest} className="text-[10px] font-mono text-indigo-400 hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Sync
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {documents.slice(0, 7).map((doc, idx) => (
                <div key={idx} className="glass-card p-2.5 rounded-xl flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {doc.type === "pdf" && <FileText className="w-4 h-4 text-indigo-400 shrink-0" />}
                    {doc.type === "excel" && <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {doc.type === "email" && <Mail className="w-4 h-4 text-amber-400 shrink-0" />}
                    {doc.type === "csv" && <FileCode className="w-4 h-4 text-rose-400 shrink-0" />}
                    <span className="truncate text-slate-300 font-mono text-[11px]" title={doc.name}>
                      {doc.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.name)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── DASHBOARD MAIN PANELS ────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
          {/* Top Tabs */}
          <div className="flex items-center border-b border-slate-800/80 bg-slate-950/40 px-4 pt-2 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "copilot"
                  ? "border-indigo-500 text-white bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              AI COPILOT
            </button>

            <button
              onClick={() => setActiveTab("docs")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "docs"
                  ? "border-indigo-500 text-white bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              KNOWLEDGE REPOSITORY
              <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full text-[10px]">{documents.length}</span>
            </button>

            <button
              onClick={() => setActiveTab("crm")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "crm"
                  ? "border-indigo-500 text-white bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ticket className="w-4 h-4 text-amber-400" />
              CRM STUDIO
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-mono font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === "analytics"
                  ? "border-indigo-500 text-white bg-indigo-500/10"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 className="w-4 h-4 text-rose-400" />
              ANALYTICS & AUDIT
            </button>
          </div>

          {/* Alert Notification */}
          {error && (
            <div className="bg-rose-500/10 border-b border-rose-500/30 p-3 px-6 text-xs text-rose-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError(null)} className="text-slate-400 hover:text-white text-xs">
                Dismiss
              </button>
            </div>
          )}

          {/* ── TAB 1: COPILOT CHAT ────────────────────────────────────────── */}
          {activeTab === "copilot" && (
            <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
              {/* Prompt Suggestions Bar */}
              <div className="mb-4">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">Suggested Prompt Chips</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What is the bulk order refund policy?",
                    "What client payment terms apply to Beta LLC?",
                    "What is the current hardware warranty duration?",
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuery(prompt)}
                      className="glass-button text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:scale-105"
                    >
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Message Trajectory */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 neon-glow">
                      <BrainCircuit className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-200">How can I assist you today?</h3>
                    <p className="text-xs text-slate-400 max-width-md mt-1">
                      Ask any question across policies, contract terms, or client records. Nexa will cite documents & detect contradictions automatically.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center shrink-0">
                          <Zap className="w-4 h-4 text-indigo-300" />
                        </div>
                      )}

                      <div className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${msg.role === "user" ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100" : "glass-card text-slate-200"}`}>
                        {/* Header for assistant message */}
                        {msg.role === "assistant" && msg.responseMeta && (
                          <div className="flex items-center justify-between border-b border-slate-700/50 pb-2 mb-3">
                            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">Nexa Response</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                  msg.responseMeta.confidence_level === "HIGH"
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : msg.responseMeta.confidence_level === "MEDIUM"
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                    : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                }`}
                              >
                                CONFIDENCE · {msg.responseMeta.confidence_level}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">{msg.responseMeta.latency_ms}ms</span>
                            </div>
                          </div>
                        )}

                        {/* Text Content */}
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Conflicts Notice Card */}
                        {msg.responseMeta?.conflicts_detected && msg.responseMeta.conflicts_detected.length > 0 && (
                          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200">
                            <div className="font-mono font-bold flex items-center gap-1.5 text-amber-400 mb-1">
                              <ShieldAlert className="w-4 h-4" /> CONFLICT DETECTED
                            </div>
                            {msg.responseMeta.conflicts_detected.map((c, i) => (
                              <div key={i} className="mt-1 text-[11px] space-y-1">
                                <div className="text-slate-300">Topic: <span className="font-mono text-amber-300">{c.topic}</span></div>
                                <div className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                                  <span className="bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/40">TRUSTED</span> {c.trusted_source}
                                </div>
                                {c.outdated_sources.map((o, j) => (
                                  <div key={j} className="flex items-center gap-1 text-rose-400 font-mono text-[10px]">
                                    <span className="bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40">SUPERSEDED</span> {o.citation}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Citations Pills */}
                        {msg.responseMeta?.citations && msg.responseMeta.citations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                            {msg.responseMeta.citations.map((c, i) => (
                              <span key={i} className="text-[10px] font-mono bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-1 rounded-full flex items-center gap-1">
                                <span>📎 {c.source_name} ({c.doc_date})</span>
                                <span className="bg-indigo-500/20 text-indigo-300 px-1 rounded-full">{c.match_score_pct}% match</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Assistant Toolbar */}
                        {msg.role === "assistant" && msg.responseMeta && (
                          <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                            <button
                              onClick={() => handleCopyToClipboard(msg.content, msg.id)}
                              className="hover:text-white flex items-center gap-1 font-mono"
                            >
                              {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              {copiedId === msg.id ? "Copied" : "Copy"}
                            </button>

                            <button
                              onClick={() => handleConvertToCrm(msg.responseMeta!)}
                              className="hover:text-amber-300 flex items-center gap-1 font-mono text-amber-400/90"
                            >
                              <Ticket className="w-3 h-3" /> Convert to CRM Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleQuery(inputQuery)}
                  placeholder="Ask a question across your policy PDFs, Excel workbooks, or emails..."
                  className="flex-1 glass-input rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleQuery(inputQuery)}
                  disabled={loading || !inputQuery.trim()}
                  className="glass-button px-5 py-3 rounded-xl text-xs font-semibold font-mono flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-indigo-400" />}
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: REPOSITORY ────────────────────────────────────────────── */}
          {activeTab === "docs" && (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">Knowledge Repository</h2>
                  <p className="text-xs text-slate-400">Manage indexed files and trigger proactive policy contradiction scans.</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search files..."
                      className="glass-input pl-9 pr-3 py-1.5 rounded-lg text-xs w-44"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="glass-input px-3 py-1.5 rounded-lg text-xs font-mono"
                  >
                    <option value="ALL">All Types</option>
                    <option value="PDF">PDFs</option>
                    <option value="EXCEL">Excel</option>
                    <option value="CSV">CSV</option>
                    <option value="EMAIL">Emails</option>
                  </select>
                </div>
              </div>

              {/* Document Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredDocs.map((doc, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                        {doc.type === "pdf" && <FileText className="w-5 h-5 text-indigo-400" />}
                        {doc.type === "excel" && <FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
                        {doc.type === "email" && <Mail className="w-5 h-5 text-amber-400" />}
                        {doc.type === "csv" && <FileCode className="w-5 h-5 text-rose-400" />}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-slate-200 truncate" title={doc.name}>{doc.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                          <span>{doc.type.toUpperCase()}</span>
                          <span>·</span>
                          <span>{(doc.size_bytes / 1024).toFixed(1)} KB</span>
                          <span>·</span>
                          <span>{doc.chunks} chunks</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteDocument(doc.name)}
                      className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Proactive Conflict Scanner */}
              <div className="glass-card p-5 rounded-2xl border-indigo-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-sm text-slate-200">Proactive Policy Conflict Scanner</h3>
                  </div>
                  <button
                    onClick={() => api.getConflicts().then((res) => setConflicts(res.conflicts))}
                    className="glass-button px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Scan Corpus
                  </button>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Scans all vector embeddings across your documents to uncover contradicting policy terms before employees encounter them.
                </p>

                {conflicts.length === 0 ? (
                  <div className="text-xs text-emerald-400 font-mono bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Clean Corpus: Zero policy conflicts detected across all indexed files.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {conflicts.map((c, i) => (
                      <div key={i} className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs">
                        <div className="font-mono font-bold text-amber-300">Topic: {c.topic}</div>
                        <div className="mt-1 text-[11px] text-emerald-400 font-mono">
                          <span className="bg-emerald-500/20 px-1 rounded">TRUSTED</span> {c.trusted_source} (dated {c.trusted_date})
                        </div>
                        {c.outdated_sources.map((o, j) => (
                          <div key={j} className="text-[11px] text-rose-400 font-mono mt-0.5">
                            <span className="bg-rose-500/20 px-1 rounded">SUPERSEDED</span> {o.citation} (dated {o.date})
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB 3: CRM STUDIO ────────────────────────────────────────────── */}
          {activeTab === "crm" && (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-100">CRM Support Ticket Generator</h2>
                <p className="text-xs text-slate-400">Convert cited AI answers into formatted support tickets for HubSpot, Salesforce, or Zendesk.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Ticket Subject</label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Bulk order refund policy dispute"
                      className="glass-input w-full p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 block mb-1">Client Name</label>
                    <input
                      type="text"
                      value={ticketClient}
                      onChange={(e) => setTicketClient(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="glass-input w-full p-2.5 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Priority</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="glass-input w-full p-2.5 rounded-xl text-xs font-mono"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-mono text-slate-400 block mb-1">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="glass-input w-full p-2.5 rounded-xl text-xs font-mono"
                      >
                        <option value="Policy Inquiry">Policy Inquiry</option>
                        <option value="Refund Request">Refund Request</option>
                        <option value="Payment Dispute">Payment Dispute</option>
                        <option value="Warranty Claim">Warranty Claim</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Ticket Body & Resolution</label>
                  <textarea
                    value={ticketBody}
                    onChange={(e) => setTicketBody(e.target.value)}
                    rows={8}
                    className="glass-input w-full p-2.5 rounded-xl text-xs font-mono leading-relaxed"
                  />
                </div>
              </div>

              <button onClick={handleCreateTicket} className="glass-button px-6 py-3 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2">
                <Ticket className="w-4 h-4 text-amber-400" /> Generate Ticket Package
              </button>

              {generatedTicket && (
                <div className="glass-card p-4 rounded-xl border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Ticket Created: {generatedTicket.id}
                    </span>
                    <span className="text-[10px] text-slate-400">{generatedTicket.created_at}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadFile(`${generatedTicket.id}.json`, JSON.stringify(generatedTicket, null, 2), "application/json")}
                      className="glass-button px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" /> Export JSON
                    </button>
                    <button
                      onClick={() =>
                        downloadFile(
                          `${generatedTicket.id}.csv`,
                          `id,subject,client,priority,category\n"${generatedTicket.id}","${generatedTicket.subject}","${generatedTicket.client}","${generatedTicket.priority}","${generatedTicket.category}"`,
                          "text/csv"
                        )
                      }
                      className="glass-button px-4 py-2 rounded-lg text-xs font-mono flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" /> Export CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 4: ANALYTICS & AUDIT ────────────────────────────────────── */}
          {activeTab === "analytics" && (
            <div className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-100">Analytics & Audit Trail</h2>
                <p className="text-xs text-slate-400">Track question volume, latency metrics, and historical compliance logs.</p>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="block text-2xl font-bold font-mono text-indigo-400">{auditEntries.length}</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Total Queries Logged</span>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="block text-2xl font-bold font-mono text-amber-400">
                    {auditEntries.filter((e) => e.conflicts_detected && e.conflicts_detected.length > 0).length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Conflicts Detected</span>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="block text-2xl font-bold font-mono text-rose-400">
                    {auditEntries.filter((e) => e.flagged).length}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Flagged Queries</span>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <span className="block text-2xl font-bold font-mono text-emerald-400">384-dim</span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase">MiniLM Vector Space</span>
                </div>
              </div>

              {/* Audit Log Entries */}
              <div>
                <h3 className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider mb-3">Live Traceability Log</h3>
                <div className="space-y-2">
                  {auditEntries.map((entry, idx) => (
                    <div key={idx} className="glass-card p-3 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span>🕒 {entry.timestamp}</span>
                        <span>Call ID: {entry.call_id || "N/A"}</span>
                      </div>
                      <div className="font-semibold text-slate-200">{entry.query}</div>
                      <div className="text-slate-400 line-clamp-1">{entry.answer_preview}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
