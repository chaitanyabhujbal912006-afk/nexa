"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  UserCheck,
  LogOut,
  ShieldCheck,
  FileCheck,
} from "lucide-react";
import {
  api,
  QueryResponse,
  HealthResponse,
  DocumentItem,
  Conflict,
  AuditEntry,
  clearAuthToken,
} from "@/lib/api";
import { AuthModal } from "@/components/AuthModal";

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

  // Auth State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
  const [exportingPdf, setExportingPdf] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("nexa_user_email");
      if (savedEmail) setUserEmail(savedEmail);
    }
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

  const handleSignOut = () => {
    clearAuthToken();
    setUserEmail(null);
    fetchHealthAndData();
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
      setError(err.message || "Ingestion failed.");
    } finally {
      setIngesting(false);
    }
  };

  const handleExportPdfReport = async (title: string, summaryText: string, citations: any[] = []) => {
    setExportingPdf(true);
    try {
      await api.downloadPdfReport(title, summaryText, citations);
    } catch (err: any) {
      setError(err.message || "Failed to generate PDF report.");
    } finally {
      setExportingPdf(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const convertToTicket = (msgContent: string) => {
    setTicketSubject("Policy Inquiry Resolution");
    setTicketBody(msgContent);
    setActiveTab("crm");
  };

  // Filtered documents for Repository
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(docSearch.toLowerCase());
    const matchesType = typeFilter === "ALL" || doc.type.toUpperCase() === typeFilter.toUpperCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Cyber Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="w-full glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-white">Nexa Intelligence Engine</h1>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v3.0 Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Policy & Household Vault RAG Agent</p>
          </div>
        </div>

        {/* Live Status & Auth Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GROQ · {health?.provider || "openai/gpt-oss-120b"}</span>
          </div>

          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-full text-xs font-mono">
            <Database className="w-3.5 h-3.5" />
            <span>{health ? `${health.kb_stats.pdfs + health.kb_stats.excel + health.kb_stats.csv + health.kb_stats.emails} Source Docs` : "Connecting..."}</span>
          </div>

          {userEmail ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-mono">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-200">{userEmail}</span>
              <button onClick={handleSignOut} className="ml-1 text-slate-400 hover:text-rose-400 transition-colors" title="Sign Out">
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Email OTP Vault Auth</span>
            </button>
          )}
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

        {/* ── WORKSPACE TABS AREA ────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-800/80">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("copilot")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "copilot"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <MessageSquare className="w-4 h-4" /> AI Copilot
              </button>
              <button
                onClick={() => setActiveTab("docs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "docs"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <FileText className="w-4 h-4" /> Knowledge Repository
              </button>
              <button
                onClick={() => setActiveTab("crm")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "crm"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Ticket className="w-4 h-4" /> CRM Studio
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === "analytics"
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" /> Analytics & Audit
              </button>
            </div>

            {/* Quick Export PDF Action */}
            <button
              onClick={() => handleExportPdfReport("Nexa Executive Knowledge & Bill Summary", messages.length > 0 ? messages[messages.length - 1].content : "Knowledge Base Audit Summary.", selectedContext?.citations)}
              disabled={exportingPdf}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-all disabled:opacity-50"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{exportingPdf ? "Generating..." : "Export PDF Report"}</span>
            </button>
          </div>

          {error && (
            <div className="m-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 font-bold hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: AI COPILOT */}
          {activeTab === "copilot" && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-4">
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">Ask Anything Across Your Vault</h3>
                    <p className="text-xs text-slate-400">
                      Query your uploaded PDFs, Excel sheets, emails, or personal household bills with cited answers and policy conflict detection.
                    </p>

                    <div className="w-full grid grid-cols-1 gap-2 pt-2">
                      {[
                        "What is the bulk order refund policy?",
                        "Compare Acme payment terms between v1.0 and v2.0",
                        "Summarize my recent household bills and due dates",
                        "What is the warranty period for support hardware?",
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuery(prompt)}
                          className="glass-card p-3 rounded-xl text-left text-xs text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 transition-all flex items-center justify-between group"
                        >
                          <span>{prompt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} space-y-2`}
                    >
                      <div
                        className={`max-w-3xl p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20"
                            : "glass-card text-slate-200 rounded-bl-none border border-slate-700/60"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>

                        {/* Citation & Conflict Pill Metadata */}
                        {msg.responseMeta && (
                          <div className="mt-4 pt-3 border-t border-slate-700/60 space-y-3">
                            {/* Confidence Pill */}
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400 flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-indigo-400" /> Confidence:
                                <span
                                  className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                                    msg.responseMeta.confidence_level === "HIGH"
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : msg.responseMeta.confidence_level === "MEDIUM"
                                      ? "bg-amber-500/20 text-amber-300"
                                      : "bg-rose-500/20 text-rose-300"
                                  }`}
                                >
                                  {msg.responseMeta.confidence_level}
                                </span>
                              </span>
                              <span className="text-slate-500 text-[10px]">{msg.responseMeta.latency_ms}ms</span>
                            </div>

                            {/* Conflicts Warning */}
                            {msg.responseMeta.conflicts_detected.length > 0 && (
                              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                                <div className="font-semibold flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Conflict Detected & Resolved:
                                </div>
                                {msg.responseMeta.conflicts_detected.map((c, i) => (
                                  <div key={i} className="text-[11px] text-amber-300/90 font-mono">
                                    Topic: <strong>{c.topic}</strong> | Trusted: {c.trusted_source}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Citations List */}
                            <div className="flex flex-wrap gap-1.5">
                              {msg.responseMeta.citations.map((cite, i) => (
                                <span
                                  key={i}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-indigo-300"
                                >
                                  <FileText className="w-3 h-3 text-indigo-400" />
                                  {cite.source_name} ({cite.doc_date})
                                  <span className="text-[9px] text-slate-400 font-sans ml-1">
                                    {cite.match_score_pct}% match
                                  </span>
                                </span>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-1">
                              <button
                                onClick={() => copyToClipboard(msg.content, msg.id)}
                                className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
                              >
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copiedId === msg.id ? "Copied" : "Copy"}
                              </button>
                              <button
                                onClick={() => convertToTicket(msg.content)}
                                className="text-xs font-mono text-indigo-400 hover:underline flex items-center gap-1"
                              >
                                <Ticket className="w-3 h-3" /> Convert to CRM Ticket
                              </button>
                              <button
                                onClick={() => handleExportPdfReport("Query Resolution PDF", msg.content, msg.responseMeta?.citations)}
                                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" /> Download PDF
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 px-1">{msg.timestamp}</span>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Form */}
              <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQuery(inputQuery);
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask a question across your policy PDFs, Excel workbooks, or emails..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={loading || !inputQuery.trim()}
                    className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: KNOWLEDGE REPOSITORY */}
          {activeTab === "docs" && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
              {/* Header & Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-lg text-white">Knowledge Base Directory</h2>
                  <p className="text-xs text-slate-400">All indexed policy PDFs, Excel workbooks, and email threads</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-300 px-3 py-2 focus:outline-none"
                  >
                    <option value="ALL">All Types</option>
                    <option value="PDF">PDFs</option>
                    <option value="EXCEL">Excel</option>
                    <option value="EMAIL">Emails</option>
                    <option value="CSV">CSVs</option>
                  </select>
                </div>
              </div>

              {/* Grid of Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocs.map((doc, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-xl flex items-start justify-between border border-slate-800/80 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 mt-0.5">
                        {doc.type === "pdf" && <FileText className="w-5 h-5 text-indigo-400" />}
                        {doc.type === "excel" && <FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
                        {doc.type === "email" && <Mail className="w-5 h-5 text-amber-400" />}
                        {doc.type === "csv" && <FileCode className="w-5 h-5 text-rose-400" />}
                      </div>
                      <div>
                        <h4 className="font-mono text-sm font-semibold text-white">{doc.name}</h4>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono mt-1">
                          <span className="uppercase">{doc.type}</span>
                          <span>{(doc.size_bytes / 1024).toFixed(1)} KB</span>
                          <span>{doc.chunks} chunks</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.name)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Proactive Conflict Scanner Card */}
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Proactive Policy Conflict Scanner</span>
                  </div>
                  <button onClick={handleReingest} className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Scan Corpus
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Scans all vector embeddings across your documents to uncover contradicting policy terms before employees encounter them.
                </p>

                <div className="space-y-2 pt-1">
                  {conflicts.length === 0 ? (
                    <div className="text-xs font-mono text-emerald-400 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" /> No active policy conflicts found in current knowledge base.
                    </div>
                  ) : (
                    conflicts.map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono space-y-1">
                        <div className="text-indigo-300 font-semibold">Topic: {c.topic}</div>
                        <div className="text-emerald-400">TRUSTED: {c.trusted_source} (dated {c.trusted_date})</div>
                        {c.outdated_sources.map((o, j) => (
                          <div key={j} className="text-rose-400/90">SUPERSEDED: {o.citation} (dated {o.date})</div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRM STUDIO */}
          {activeTab === "crm" && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
              <div>
                <h2 className="font-display font-bold text-lg text-white">CRM Support Ticket Studio</h2>
                <p className="text-xs text-slate-400">Generate policy-backed customer responses and export structured ticket packages</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Input */}
                <div className="space-y-4 glass-card p-5 rounded-2xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">CLIENT NAME</label>
                    <input
                      type="text"
                      value={ticketClient}
                      onChange={(e) => setTicketClient(e.target.value)}
                      placeholder="e.g. Acme Corp / Retail Client"
                      className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">PRIORITY</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-400 mb-1">CATEGORY</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none"
                      >
                        <option value="Policy Inquiry">Policy Inquiry</option>
                        <option value="Refund Request">Refund Request</option>
                        <option value="Warranty Claim">Warranty Claim</option>
                        <option value="Payment Terms">Payment Terms</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">POLICY RESPONSE BODY</label>
                    <textarea
                      rows={8}
                      value={ticketBody}
                      onChange={(e) => setTicketBody(e.target.value)}
                      placeholder="Paste resolution text or query answer here..."
                      className="w-full p-3 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Live Ticket Preview */}
                <div className="glass-card p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                      <span className="font-mono text-xs font-bold text-indigo-400">CRM-TICKET-PREVIEW</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">READY</span>
                    </div>

                    <div className="space-y-2 text-xs font-mono text-slate-300">
                      <div><strong className="text-slate-400">Client:</strong> {ticketClient || "N/A"}</div>
                      <div><strong className="text-slate-400">Priority:</strong> {ticketPriority}</div>
                      <div><strong className="text-slate-400">Category:</strong> {ticketCategory}</div>
                      <div className="pt-2"><strong className="text-slate-400">Resolution Payload:</strong></div>
                      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto">
                        {ticketBody || "No response content selected."}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify({ client: ticketClient, priority: ticketPriority, category: ticketCategory, body: ticketBody }, null, 2), "json-ticket")}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20 text-center"
                    >
                      {copiedId === "json-ticket" ? "Copied JSON Package" : "Export JSON Ticket Package"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & AUDIT */}
          {activeTab === "analytics" && (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
              <div>
                <h2 className="font-display font-bold text-lg text-white">System Analytics & Audit Log</h2>
                <p className="text-xs text-slate-400">Real-time query performance metrics and audit traceability log</p>
              </div>

              {/* Bento Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Total Audit Log Entries</span>
                  <span className="block text-2xl font-bold font-mono text-white mt-1">{auditEntries.length}</span>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Active Provider</span>
                  <span className="block text-xl font-bold font-mono text-emerald-400 mt-1 truncate">{health?.provider || "Groq"}</span>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Embedding Model</span>
                  <span className="block text-sm font-bold font-mono text-indigo-400 mt-1">{health?.embedding_model || "all-MiniLM-L6-v2"}</span>
                </div>
                <div className="glass-card p-4 rounded-xl">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Conflict Scanner Status</span>
                  <span className="block text-sm font-bold font-mono text-amber-400 mt-1">{conflicts.length} Active Warnings</span>
                </div>
              </div>

              {/* Audit Table */}
              <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
                <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 text-xs font-mono font-semibold text-slate-400">
                  RECENT AUDIT LOG ENTRIES
                </div>
                <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto">
                  {auditEntries.map((entry, idx) => (
                    <div key={idx} className="p-4 text-xs font-mono hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold">{entry.call_id?.slice(0, 8)}...</span>
                          <span className="text-slate-500 text-[10px]">{entry.timestamp}</span>
                        </div>
                        <div className="text-slate-200 truncate">Q: {entry.query}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                          {entry.latency_ms}ms
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            entry.confidence_level === "HIGH"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {entry.confidence_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(email) => setUserEmail(email)}
      />
    </div>
  );
}
