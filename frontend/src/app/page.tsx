"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  FileText,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  Lock,
  ChevronRight,
  Download,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Mail,
  FileCode,
} from "lucide-react";
import { KineticBackground } from "@/components/KineticBackground";

export default function LandingPage() {
  const [demoQuery, setDemoQuery] = useState("What is the bulk order refund policy?");
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleRunDemo = (query: string) => {
    setDemoQuery(query);
    setDemoLoading(true);
    setDemoAnswer(null);

    setTimeout(() => {
      setDemoLoading(false);
      if (query.includes("refund")) {
        setDemoAnswer(
          "According to Commercial Refund Policy v2.0 (dated Jan 15, 2026), bulk orders exceeding $10,000 are eligible for full refund within 30 days of delivery, subject to a 5% restocking fee."
        );
      } else if (query.includes("payment")) {
        setDemoAnswer(
          "Acme Supplier Agreement (dated Feb 01, 2026) specifies Net-30 payment terms with 2% early payment discount if settled within 10 days."
        );
      } else {
        setDemoAnswer(
          "Household Utility Statement (dated Feb 10, 2026): Electricity bill for $142.50 due on March 01, 2026."
        );
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#0c1324] text-[#dce1fb] font-sans selection:bg-[#4d8eff] selection:text-white relative overflow-x-hidden">
      {/* Three.js Kinetic Core Background */}
      <KineticBackground />

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="w-full glass-panel sticky top-0 z-30 border-b border-[#424754]/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#adc6ff]/20 to-[#4cd7f6]/20 border border-[#adc6ff]/30 text-[#adc6ff] shadow-lg">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-white">NEXA</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#4d8eff]/20 text-[#adc6ff] border border-[#adc6ff]/30">
                Obsidian Kinetic
              </span>
            </div>
            <p className="text-[11px] text-[#c2c6d6]">Knowledge Intelligence Engine</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-mono text-[#c2c6d6]">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-mono text-[#c2c6d6] hover:text-white px-4 py-2 rounded-xl glass-card transition-all"
          >
            Vault Auth
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#191f31] border border-[#adc6ff]/30 text-xs font-mono text-[#adc6ff]">
          <Sparkles className="w-3.5 h-3.5 text-[#4cd7f6]" />
          <span>Strict Policy Conflict-Aware RAG Engine v3.0</span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Precision Knowledge Intelligence for <span className="gradient-text">Enterprise & Household Vaults</span>
        </h1>

        <p className="text-base sm:text-lg text-[#c2c6d6] max-w-2xl mx-auto leading-relaxed">
          Instantly query PDFs, Excel workbooks, emails, and bills with zero-hallucination citations, proactive version conflict detection, and executive PDF report export.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Open Intelligence Copilot</span>
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3.5 rounded-xl glass-card text-white font-semibold text-sm hover:border-[#adc6ff]/50 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#adc6ff]" />
            <span>Register Isolated Vault</span>
          </Link>
        </div>

        {/* Live System Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="glass-card p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold font-mono text-[#adc6ff]">120B</span>
            <span className="text-[11px] text-[#c2c6d6] font-mono">GROQ LLM Parameter Model</span>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold font-mono text-[#4cd7f6]">&lt;200ms</span>
            <span className="text-[11px] text-[#c2c6d6] font-mono">Vector Query Retrieval</span>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold font-mono text-emerald-400">100%</span>
            <span className="text-[11px] text-[#c2c6d6] font-mono">Source Citation Integrity</span>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold font-mono text-[#c0c1ff]">ChromaDB</span>
            <span className="text-[11px] text-[#c2c6d6] font-mono">Multi-Tenant Vault Store</span>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE QUERY DEMO ────────────────────────────────────────── */}
      <section id="demo" className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-[#424754] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#adc6ff]" />
              <h3 className="font-display text-lg font-bold text-white">Try Live Intelligence Demo</h3>
            </div>
            <span className="text-xs font-mono text-[#4cd7f6] bg-[#4cd7f6]/10 px-2.5 py-1 rounded-full border border-[#4cd7f6]/30">
              Interactive Preview
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={demoQuery}
              onChange={(e) => setDemoQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#0c1324] border border-[#424754] rounded-xl text-sm text-[#dce1fb] focus:outline-none focus:border-[#adc6ff]"
              placeholder="Ask a question..."
            />
            <button
              onClick={() => handleRunDemo(demoQuery)}
              disabled={demoLoading}
              className="px-5 py-3 rounded-xl bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-medium text-xs font-mono transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {demoLoading ? "Processing..." : "Run Query"}
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {[
              "What is the bulk order refund policy?",
              "What are the Acme payment terms?",
              "Summarize household bill due dates",
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => handleRunDemo(p)}
                className="px-3 py-1.5 rounded-lg glass-card text-[#c2c6d6] hover:text-white hover:border-[#adc6ff]/40 transition-all text-left"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Result Output */}
          {demoAnswer && (
            <div className="p-5 rounded-2xl bg-[#191f31] border border-[#adc6ff]/30 text-xs font-mono space-y-3">
              <div className="flex items-center justify-between text-[#adc6ff]">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> CONFIDENCE · HIGH
                </span>
                <span className="text-slate-500">142ms</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed">{demoAnswer}</p>
              <div className="pt-2 border-t border-[#424754] flex items-center justify-between text-[11px] text-[#c2c6d6]">
                <span>Source: Commercial_Refund_Policy_v2.pdf</span>
                <Link href="/dashboard" className="text-[#adc6ff] hover:underline flex items-center gap-1">
                  View in Copilot <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 max-w-6xl mx-auto px-6 py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="font-display text-3xl font-bold text-white">Engineered for Absolute Accuracy</h2>
          <p className="text-sm text-[#c2c6d6]">Designed to eliminate RAG hallucinations and resolve document version conflicts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl border border-[#424754] space-y-4">
            <div className="p-3 rounded-xl bg-[#adc6ff]/10 text-[#adc6ff] w-fit">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Proactive Conflict Scanner</h3>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              Scans all vector embeddings to detect contradicting policy clauses across older and newer document revisions, flagging outdated terms automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl border border-[#424754] space-y-4">
            <div className="p-3 rounded-xl bg-[#4cd7f6]/10 text-[#4cd7f6] w-fit">
              <Lock className="w-6 h-6 text-[#4cd7f6]" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Multi-Tenant Vault Isolation</h3>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              Passwordless Email OTP authentication isolates vector data per user ID. Store company SOPs or household bills with zero cross-tenant leakage.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl border border-[#424754] space-y-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
              <Download className="w-6 h-6 text-[#c0c1ff]" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Executive PDF Report Studio</h3>
            <p className="text-xs text-[#c2c6d6] leading-relaxed">
              Generate PDF reports complete with executive summaries, policy conflict tables, and match score citations in a single click.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[#424754] py-8 text-center text-xs font-mono text-[#c2c6d6]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#adc6ff]" />
            <span className="font-bold text-white">NEXA Intelligence Engine</span>
            <span>v3.0</span>
          </div>
          <p>© 2026 Nexa Intelligence. Built with Next.js 15, FastAPI & Groq 120B.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white">Vault Auth</Link>
            <Link href="/dashboard" className="hover:text-white">Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
