"use client";

import React, { useState } from "react";
import Link from "next/link";
import { KineticBackground } from "@/components/KineticBackground";

export default function LandingPage() {
  const [queryInput, setQueryInput] = useState("");
  const [activeAnswer, setActiveAnswer] = useState<{
    text: string;
    confidence: string;
    sourcesCount: number;
    conflictDetected: boolean;
    citations: { num: number; icon: string; name: string; detail: string; color: string }[];
  } | null>({
    text: 'For Enterprise clients, the current refund policy states that bulk order returns must be initiated within 15 days of receipt. Additionally, custom integration fees are non-refundable once deployment begins.',
    confidence: "97% CONFIDENCE",
    sourcesCount: 3,
    conflictDetected: true,
    citations: [
      { num: 1, icon: "description", name: "refund_policy_v2.pdf", detail: "Page 3, Section 2.1", color: "bg-primary text-on-primary" },
      { num: 2, icon: "description", name: "enterprise_terms.pdf", detail: "Page 8, Clause 4B", color: "bg-tertiary text-on-tertiary" }
    ]
  });
  const [isSearching, setIsSearching] = useState(false);

  const handleQuery = (promptText: string) => {
    setQueryInput(promptText);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      if (promptText.toLowerCase().includes("refund")) {
        setActiveAnswer({
          text: 'Bulk order returns must be initiated within 15 days of delivery. Outdated 30-day clause from 2021 was superseded on Mar 01, 2024.',
          confidence: "98% CONFIDENCE",
          sourcesCount: 4,
          conflictDetected: true,
          citations: [
            { num: 1, icon: "picture_as_pdf", name: "Commercial_Refund_v2.pdf", detail: "Page 2, Paragraph 4", color: "bg-primary text-on-primary" },
            { num: 2, icon: "gavel", name: "Legal_Policy_Override_2024.docx", detail: "Clause 12.A", color: "bg-tertiary text-on-tertiary" }
          ]
        });
      } else if (promptText.toLowerCase().includes("warranty")) {
        setActiveAnswer({
          text: 'Enterprise clients receive 36-month hardware replacement warranty with 24/7 dedicated SLA support and instant hot-swap parts dispatch.',
          confidence: "99% CONFIDENCE",
          sourcesCount: 3,
          conflictDetected: false,
          citations: [
            { num: 1, icon: "verified_user", name: "Enterprise_SLA_2026.pdf", detail: "Page 14, Section 5", color: "bg-primary text-on-primary" }
          ]
        });
      } else {
        setActiveAnswer({
          text: 'Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service according to Updated_Benefits_2024.docx.',
          confidence: "95% CONFIDENCE",
          sourcesCount: 2,
          conflictDetected: true,
          citations: [
            { num: 1, icon: "description", name: "Updated_Benefits_2024.docx", detail: "Section 4.2", color: "bg-primary text-on-primary" },
            { num: 2, icon: "warning", name: "HR_Handbook_2021.pdf (Deprecated)", detail: "Superseded", color: "bg-error text-on-error" }
          ]
        });
      }
    }, 450);
  };

  return (
    <div className="font-body-md antialiased min-h-screen flex flex-col relative bg-[#0c1324] text-[#dce1fb]">
      {/* Dynamic Interactive Background */}
      <KineticBackground />

      {/* Header Navigation */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] rounded-full border border-outline-variant bg-surface/40 backdrop-blur-xl shadow-[0_0_20px_rgba(77,142,255,0.15)] flex justify-between items-center px-8 py-3 max-w-container-max mx-auto z-50">
        <div className="flex items-center gap-2 font-display-xl text-headline-md tracking-tighter text-on-surface">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-white">NEXA</span>
            <span className="font-label-sm text-outline ml-3 uppercase tracking-widest hidden lg:inline">Knowledge Intelligence Engine</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8 font-body-md text-body-md">
          <a className="text-primary font-bold border-b border-primary py-1 hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.8)] transition-all duration-300" href="#platform">Platform</a>
          <a className="text-on-surface-variant font-medium hover:text-primary hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.8)] transition-all duration-300" href="#intelligence">Intelligence Core</a>
          <a className="text-on-surface-variant font-medium hover:text-primary hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.8)] transition-all duration-300" href="#conflicts">Conflict Resolution</a>
          <a className="text-on-surface-variant font-medium hover:text-primary hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.8)] transition-all duration-300" href="#citations">Traceability</a>
          <a className="text-on-surface-variant font-medium hover:text-primary hover:drop-shadow-[0_0_8px_rgba(173,198,255,0.8)] transition-all duration-300" href="#architecture">Architecture</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[12px] font-medium text-outline hover:text-primary transition-colors duration-300 px-3 py-1.5 rounded-full border border-outline-variant hover:border-primary">
            Log In
          </Link>
          <Link href="/dashboard" className="btn-primary px-6 py-2 rounded-full font-label-sm uppercase tracking-wider scale-95 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-[0_0_20px_rgba(77,142,255,0.6)]">
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-32 lg:pt-44 pb-24 px-margin-safe max-w-container-max mx-auto w-full flex flex-col gap-32 z-10">
        
        {/* Hero Section */}
        <section id="platform" className="relative grid lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 z-10">
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-primary shadow-[0_0_10px_rgba(173,198,255,0.8)]"></span>
              <span className="font-label-sm text-primary uppercase tracking-widest drop-shadow-[0_0_5px_rgba(173,198,255,0.5)]">
                Enterprise Knowledge Intelligence
              </span>
            </div>
            <h1 className="font-display-xl text-4xl lg:text-6xl text-on-surface font-bold leading-tight drop-shadow-lg">
              Your business knowledge.<br />
              <span className="gradient-text">Finally, intelligent.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              Connect documents, spreadsheets and emails. Ask questions in natural language. Get cited answers and detect conflicts before they become costly decisions.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link href="/dashboard" className="btn-primary px-8 py-3.5 rounded-full font-label-sm uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_25px_rgba(77,142,255,0.6)]">
                Enter Nexa Copilot <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
              <a href="#demo" className="btn-ghost px-8 py-3.5 rounded-full font-label-sm uppercase tracking-wider hover:bg-primary-container/20 hover:text-on-surface hover:border-primary transition-all duration-300">
                See how it works
              </a>
            </div>
          </div>

          {/* 3D Visualization Area */}
          <div className="relative h-[520px] flex items-center justify-center rounded-2xl glass-panel p-4 shadow-[0_0_40px_rgba(77,142,255,0.15)] group">
            <div className="w-full h-full relative rounded-xl overflow-hidden bg-surface-container-highest/20 border border-outline-variant/40 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60"></div>
              
              {/* Animated Core Graphic */}
              <div className="relative flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-36 h-36 rounded-full border border-primary/40 bg-surface-container-highest/30 shadow-[0_0_60px_rgba(77,142,255,0.25)] flex items-center justify-center animate-pulse">
                  <div className="w-24 h-24 rounded-full border border-tertiary/60 bg-tertiary/10 flex items-center justify-center shadow-[0_0_30px_rgba(76,215,246,0.3)]">
                    <span className="material-symbols-outlined text-primary text-[56px]">blur_on</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-lg text-white">NEXA Vector Neural Core</h4>
                  <p className="text-xs text-outline font-mono">GROQ LLM 120B · ChromaDB Multi-Tenant RAG</p>
                </div>
              </div>
            </div>

            {/* Floating Source Cards */}
            <div className="absolute top-8 left-[-15px] glass-panel rounded-xl p-3 flex items-center gap-3 animate-[pulse_4s_infinite] z-20 shadow-lg border-primary/30 hover:border-primary transition-colors cursor-default">
              <span className="material-symbols-outlined text-tertiary text-[28px]">picture_as_pdf</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-on-surface font-semibold text-xs">Policy_2024.pdf</span>
                <span className="font-label-sm text-emerald-400 text-[10px] uppercase font-mono">Ingested & Vectorized</span>
              </div>
            </div>

            <div className="absolute bottom-24 right-[-15px] glass-panel rounded-xl p-3 flex items-center gap-3 animate-[pulse_5s_infinite_0.5s] z-20 shadow-lg border-primary/30 hover:border-primary transition-colors cursor-default">
              <span className="material-symbols-outlined text-primary-container text-[28px]">mail</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-on-surface font-semibold text-xs">CEO_Memo.eml</span>
                <span className="font-label-sm text-emerald-400 text-[10px] uppercase font-mono">Ingested & Vectorized</span>
              </div>
            </div>

            {/* Verified Answer Panel Overlay */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[92%] glass-panel rounded-xl p-5 glow-active transform z-20 shadow-2xl border-primary/40 hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <span className="font-label-sm text-primary uppercase tracking-widest text-xs font-bold drop-shadow-[0_0_2px_rgba(173,198,255,0.8)]">
                    Verified Answer
                  </span>
                </div>
                <span className="font-label-sm text-outline text-[10px] bg-surface-container-highest px-2 py-0.5 rounded border border-outline-variant/40">
                  97% CONFIDENCE
                </span>
              </div>
              <p className="font-body-md text-on-surface mb-3 text-sm font-medium">
                "Bulk order returns must be initiated within 15 days of delivery."
              </p>
              <div className="flex items-center gap-4 text-[10px] font-label-sm text-outline uppercase font-mono">
                <span className="flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[14px]">library_books</span> 3 Sources Verified
                </span>
                <span className="flex items-center gap-1 text-error">
                  <span className="material-symbols-outlined text-[14px]">warning</span> 1 Conflict Detected
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Question Bar */}
        <section id="demo" className="max-w-4xl mx-auto w-full pt-4">
          <div className="text-center mb-6 space-y-2">
            <span className="font-label-sm text-primary uppercase tracking-widest text-xs">Live Interactive Playground</span>
            <h2 className="font-display-xl text-3xl font-bold text-white">Ask Nexa Anything</h2>
          </div>

          <div className="glass-panel rounded-full p-2 flex items-center gap-4 glow-active border-primary/40 hover:border-primary transition-colors duration-300 focus-within:shadow-[0_0_30px_rgba(77,142,255,0.25)]">
            <span className="material-symbols-outlined text-primary ml-4 text-[24px]">search</span>
            <input
              className="bg-transparent border-none text-on-surface font-body-lg w-full focus:outline-none focus:ring-0 placeholder:text-outline-variant text-base"
              placeholder="Ask Nexa anything about your business or household docs..."
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleQuery(queryInput || "What is our current refund policy?")}
            />
            <button
              onClick={() => handleQuery(queryInput || "What is our current refund policy?")}
              className="bg-primary-container text-white font-semibold rounded-full px-6 py-2.5 hover:bg-blue-600 transition-colors duration-300 text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
            >
              {isSearching ? <span className="material-symbols-outlined animate-spin text-[18px]">refresh</span> : <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              <span>Search</span>
            </button>
          </div>

          <div className="flex gap-3 mt-5 justify-center flex-wrap">
            <span className="font-label-sm text-outline uppercase tracking-widest text-xs pt-1.5 font-mono">Try Prompts:</span>
            <button
              onClick={() => handleQuery("What is our current refund policy?")}
              className="text-label-sm font-label-sm text-primary border border-outline-variant/60 rounded-full px-4 py-1.5 hover:border-primary hover:bg-primary/10 transition-colors bg-surface-container-low text-xs"
            >
              "What is our current refund policy?"
            </button>
            <button
              onClick={() => handleQuery("Which warranty terms apply to Enterprise clients?")}
              className="text-label-sm font-label-sm text-primary border border-outline-variant/60 rounded-full px-4 py-1.5 hover:border-primary hover:bg-primary/10 transition-colors bg-surface-container-low text-xs"
            >
              "Which warranty terms apply to Enterprise clients?"
            </button>
            <button
              onClick={() => handleQuery("What is the paid sabbatical policy?")}
              className="text-label-sm font-label-sm text-primary border border-outline-variant/60 rounded-full px-4 py-1.5 hover:border-primary hover:bg-primary/10 transition-colors bg-surface-container-low text-xs"
            >
              "What is the paid sabbatical policy?"
            </button>
          </div>

          {/* Dynamic Active Answer Box */}
          {activeAnswer && (
            <div className="mt-8 glass-panel rounded-2xl p-6 border border-primary/30 shadow-xl transition-all">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                  <span className="font-label-sm text-primary font-bold uppercase tracking-wider text-xs">Nexa Intelligence Response</span>
                </div>
                <span className="font-label-sm text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30 text-[11px] font-mono">
                  {activeAnswer.confidence}
                </span>
              </div>
              <p className="text-on-surface font-body-md text-base leading-relaxed mb-4">
                "{activeAnswer.text}"
              </p>
              <div className="pt-3 border-t border-outline-variant/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-outline">
                <div className="flex items-center gap-3">
                  <span>{activeAnswer.sourcesCount} Verified Sources</span>
                  {activeAnswer.conflictDetected && (
                    <span className="text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">warning</span> Policy Conflict Superseded
                    </span>
                  )}
                </div>
                <Link href="/dashboard" className="text-primary hover:underline flex items-center gap-1">
                  Open full workspace <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Feature Cards Section */}
        <section id="intelligence" className="grid md:grid-cols-3 gap-8 w-full">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(77,142,255,0.15)] hover:border-primary/40 group cursor-default">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px]">account_tree</span>
            </div>
            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Multi-source Intelligence</h3>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Connect structured spreadsheets and unstructured PDFs or emails seamlessly across your entire organization.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(77,142,255,0.15)] hover:border-primary/40 group cursor-default">
            <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px]">fact_check</span>
            </div>
            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Conflict Detection</h3>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Automatically identify and flag contradicting clauses between legacy documents and updated active policies.
              </p>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center gap-6 hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(77,142,255,0.15)] hover:border-primary/40 group cursor-default">
            <div className="w-20 h-20 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px]">format_quote</span>
            </div>
            <div>
              <h3 className="font-headline-md text-xl font-bold text-on-surface mb-2">Cited Answers</h3>
              <p className="font-body-md text-on-surface-variant text-sm leading-relaxed">
                Every generated insight is backed by verified, traceable source document citations and exact page references.
              </p>
            </div>
          </div>
        </section>

        {/* 1. The Problem Section */}
        <section className="w-full flex flex-col items-center gap-12 pt-8">
          <div className="text-center flex flex-col gap-4 max-w-3xl z-10">
            <h2 className="font-display-xl text-4xl lg:text-5xl font-bold text-on-surface drop-shadow-lg">
              Your knowledge is everywhere.
            </h2>
            <p className="font-headline-md text-primary font-medium text-lg">
              Information exists. Context doesn't.
            </p>
          </div>
          <div className="relative w-full h-[360px] flex items-center justify-center">
            {/* Chaos field of floating sources */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-[10%] left-[12%] glass-panel p-4 rounded-xl rotate-[-12deg] float-animation opacity-70">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-[28px]">picture_as_pdf</span>
                  <span className="font-label-sm text-outline text-xs">Q3_Report_vFinal.pdf</span>
                </div>
              </div>
              <div className="absolute top-[20%] right-[15%] glass-panel p-4 rounded-xl rotate-[8deg] float-animation opacity-80" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-tertiary text-[28px]">table_view</span>
                  <span className="font-label-sm text-outline text-xs">Client_List_2023.xlsx</span>
                </div>
              </div>
              <div className="absolute bottom-[20%] left-[20%] glass-panel p-4 rounded-xl rotate-[15deg] float-animation opacity-60" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary-container text-[28px]">mail</span>
                  <span className="font-label-sm text-outline text-xs">Re: Legal Dispute</span>
                </div>
              </div>
              <div className="absolute bottom-[10%] right-[12%] glass-panel p-4 rounded-xl rotate-[-5deg] float-animation opacity-70" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-[28px]">cloud_sync</span>
                  <span className="font-label-sm text-outline text-xs">CRM Sync Error Log</span>
                </div>
              </div>
            </div>
            {/* Central Synthesis Connection */}
            <div className="w-56 h-56 rounded-full border border-primary/30 bg-surface-container-highest/20 shadow-[0_0_80px_rgba(77,142,255,0.15)] flex items-center justify-center z-10 relative">
              <div className="w-40 h-40 rounded-full border border-tertiary/40 bg-tertiary/5 flex items-center justify-center animate-pulse">
                <div className="w-28 h-28 rounded-full border border-primary/60 bg-primary/10 flex items-center justify-center shadow-[0_0_30px_rgba(77,142,255,0.4)]">
                  <span className="material-symbols-outlined text-primary text-[44px]">blur_on</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Conflict Detection Section */}
        <section id="conflicts" className="w-full flex flex-col items-center gap-10 pt-8">
          <div className="text-center flex flex-col gap-3 max-w-3xl">
            <span className="font-label-sm text-error uppercase tracking-widest text-xs font-mono">Proactive Audit Intelligence</span>
            <h2 className="font-display-xl text-3xl lg:text-5xl font-bold text-on-surface drop-shadow-lg">
              Don't just find an answer.<br />
              <span className="text-primary">Know which answer is right.</span>
            </h2>
          </div>

          <div className="w-full max-w-5xl glass-panel rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error via-primary to-primary"></div>
            <div className="grid md:grid-cols-2 gap-8 relative z-10">
              {/* Old Policy */}
              <div className="bg-surface-container-lowest/70 rounded-xl p-6 border border-error/30 relative">
                <div className="absolute -top-3 right-4 bg-error/20 text-error border border-error/40 px-3 py-1 rounded-full font-label-sm text-[10px] uppercase font-mono flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span> Outdated Source
                </div>
                <div className="flex items-center gap-2 mb-4 text-outline">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  <span className="font-label-sm font-semibold text-xs">HR_Handbook_2021.pdf</span>
                </div>
                <p className="font-body-md text-on-surface-variant line-through decoration-error/60 text-sm leading-relaxed">
                  "Employees are entitled to 45 days of paid sabbatical after 5 years of continuous service."
                </p>
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-outline text-[11px] font-mono uppercase">
                  <span>Date: Jan 15, 2021</span>
                  <span>Confidence: 42%</span>
                </div>
              </div>

              {/* Current Policy */}
              <div className="bg-primary/10 rounded-xl p-6 border border-primary/40 relative shadow-[0_0_20px_rgba(77,142,255,0.1)]">
                <div className="absolute -top-3 right-4 bg-primary text-on-primary px-3 py-1 rounded-full font-label-sm text-[10px] uppercase font-mono flex items-center gap-1 shadow-md font-bold">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Active Policy
                </div>
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <span className="material-symbols-outlined text-[20px]">description</span>
                  <span className="font-label-sm font-semibold text-xs">Updated_Benefits_2024.docx</span>
                </div>
                <p className="font-body-md text-on-surface text-sm font-medium leading-relaxed">
                  "Employees are entitled to 15 days of paid sabbatical after 5 years of continuous service."
                </p>
                <div className="mt-4 pt-4 border-t border-outline-variant/30 flex justify-between items-center text-primary/90 text-[11px] font-mono uppercase font-semibold">
                  <span>Date: Mar 01, 2024</span>
                  <span>Confidence: 98%</span>
                </div>
              </div>
            </div>

            {/* Verdict Panel */}
            <div className="mt-8 bg-surface-container-highest/80 rounded-xl p-5 border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center border border-error/40 text-error animate-pulse">
                  <span className="material-symbols-outlined">priority_high</span>
                </div>
                <div>
                  <h4 className="font-label-sm text-error uppercase tracking-wider mb-0.5 text-xs font-bold">⚠ Conflict Detected</h4>
                  <p className="font-body-md text-on-surface-variant text-xs">Multiple conflicting sources found regarding sabbatical duration.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-l border-outline-variant/60 pl-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary">
                  <span className="material-symbols-outlined">gavel</span>
                </div>
                <div>
                  <h4 className="font-label-sm text-primary uppercase tracking-wider mb-0.5 text-xs font-bold">Nexa Verdict</h4>
                  <p className="font-body-md text-on-surface text-xs">Newer policy (Mar 2024) supersedes older handbook.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6 justify-center flex-wrap">
              <span className="bg-surface-container-low border border-outline-variant/60 px-3 py-1 rounded font-label-sm text-[10px] text-outline uppercase font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary">verified_user</span> Source Verified
              </span>
              <span className="bg-surface-container-low border border-outline-variant/60 px-3 py-1 rounded font-label-sm text-[10px] text-outline uppercase font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">calendar_today</span> Date Verified
              </span>
              <span className="bg-surface-container-low border border-outline-variant/60 px-3 py-1 rounded font-label-sm text-[10px] text-outline uppercase font-mono flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-secondary">done_all</span> Conflict Resolved
              </span>
            </div>
          </div>
        </section>

        {/* 3. Citation Section */}
        <section id="citations" className="w-full flex flex-col items-center gap-10 pt-8">
          <div className="text-center flex flex-col gap-3 max-w-3xl">
            <span className="font-label-sm text-tertiary uppercase tracking-widest text-xs font-mono">100% Traceable Evidence</span>
            <h2 className="font-display-xl text-3xl lg:text-5xl font-bold text-on-surface drop-shadow-lg">
              Every answer has evidence.
            </h2>
          </div>

          <div className="w-full max-w-4xl glass-panel rounded-2xl p-1 relative shadow-[0_0_50px_rgba(77,142,255,0.1)]">
            <div className="bg-surface-container-lowest rounded-[14px] p-6 flex flex-col gap-6">
              {/* User Query */}
              <div className="flex gap-4 self-end max-w-[80%]">
                <div className="bg-surface-variant text-on-surface p-4 rounded-2xl rounded-tr-sm font-body-md text-sm shadow-sm border border-outline-variant/30">
                  What is our current enterprise refund policy?
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center border border-primary/30">
                  <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex gap-4 max-w-[95%]">
                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(77,142,255,0.5)]">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">smart_toy</span>
                </div>
                <div className="bg-surface-container text-on-surface p-5 rounded-2xl rounded-tl-sm font-body-md border border-primary/20 shadow-md">
                  <div className="flex items-center justify-between mb-3 border-b border-outline-variant/30 pb-2">
                    <span className="font-label-sm text-primary uppercase tracking-widest text-xs flex items-center gap-1 font-bold">
                      <span className="material-symbols-outlined text-[16px]">verified</span> Nexa Intelligence
                    </span>
                    <span className="bg-surface-container-highest border border-primary/30 text-primary px-2 py-0.5 rounded font-label-sm text-[10px] font-mono">
                      97% CONFIDENCE
                    </span>
                  </div>
                  <p className="mb-4 leading-relaxed text-on-surface-variant text-sm">
                    For Enterprise clients, the current refund policy states that bulk order returns must be initiated within{" "}
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors font-mono text-xs">
                      15 days of receipt [1]
                    </span>
                    . Additionally, custom integration fees are{" "}
                    <span className="bg-tertiary/20 text-tertiary px-1.5 py-0.5 rounded border border-tertiary/30 cursor-pointer hover:bg-tertiary/30 transition-colors font-mono text-xs">
                      non-refundable once deployment begins [2]
                    </span>
                    .
                  </p>
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-outline-variant/30 font-mono">
                    <span className="font-label-sm text-outline text-[10px] uppercase">Citations & References</span>
                    <div className="flex items-center gap-2 bg-surface-container-highest p-2.5 rounded-lg border border-outline-variant/50 hover:border-primary/50 transition-colors cursor-pointer">
                      <span className="bg-primary text-on-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded">1</span>
                      <span className="material-symbols-outlined text-outline text-[16px]">description</span>
                      <span className="font-label-sm text-on-surface text-xs font-semibold">refund_policy_v2.pdf</span>
                      <span className="text-outline text-[10px] ml-auto font-body-md">Page 3, Section 2.1</span>
                    </div>
                    <div className="flex items-center gap-2 bg-surface-container-highest p-2.5 rounded-lg border border-outline-variant/50 hover:border-tertiary/50 transition-colors cursor-pointer">
                      <span className="bg-tertiary text-on-tertiary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded">2</span>
                      <span className="material-symbols-outlined text-outline text-[16px]">description</span>
                      <span className="font-label-sm text-on-surface text-xs font-semibold">enterprise_terms.pdf</span>
                      <span className="text-outline text-[10px] ml-auto font-body-md">Page 8, Clause 4B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Architecture Section */}
        <section id="architecture" className="w-full flex flex-col items-center gap-10 pt-8">
          <div className="text-center flex flex-col gap-3 max-w-2xl">
            <span className="font-label-sm text-primary uppercase tracking-widest text-xs font-mono drop-shadow-[0_0_5px_rgba(173,198,255,0.5)]">
              Enterprise Architecture
            </span>
            <h2 className="font-headline-lg text-3xl lg:text-5xl font-bold text-on-surface drop-shadow-lg">
              Powerful intelligence infrastructure
            </h2>
            <p className="font-body-lg text-on-surface-variant text-sm leading-relaxed">
              Built for uncompromising security, high-performance vector querying, and seamless integration with your existing document stack.
            </p>
          </div>

          <div className="w-full max-w-4xl glass-panel rounded-3xl p-8 border border-primary/30 shadow-2xl grid md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <span className="text-primary font-bold block text-sm">GROQ LLaMA 3.3 70B</span>
              <p className="text-outline text-[11px]">Sub-second natural language processing and conflict resolution logic.</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <span className="text-tertiary font-bold block text-sm">ChromaDB Vector Store</span>
              <p className="text-outline text-[11px]">Multi-tenant isolated embeddings with metadata filtering & versioning.</p>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2">
              <span className="text-emerald-400 font-bold block text-sm">FastAPI & PyMuPDF</span>
              <p className="text-outline text-[11px]">High-speed asynchronous ingestion pipeline for PDFs, Excel, and emails.</p>
            </div>
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="w-full flex flex-col items-center justify-center text-center py-20 relative overflow-hidden glass-panel rounded-3xl border-primary/20 shadow-[0_0_80px_rgba(77,142,255,0.1)]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60"></div>
          <div className="z-10 flex flex-col items-center gap-8 px-4">
            <h2 className="font-display-xl text-4xl lg:text-6xl font-bold text-on-surface drop-shadow-lg leading-tight">
              Stop searching.<br />
              <span className="gradient-text">Start knowing.</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <Link href="/dashboard" className="btn-primary px-10 py-4 rounded-full font-label-sm uppercase tracking-wider text-xs font-semibold hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(77,142,255,0.4)] hover:shadow-[0_0_50px_rgba(77,142,255,0.8)]">
                Get Started with Nexa
              </Link>
              <Link href="/signup" className="btn-ghost px-10 py-4 rounded-full font-label-sm uppercase tracking-wider text-xs font-semibold hover:bg-primary-container/20 hover:text-on-surface hover:border-primary transition-all duration-300">
                Register Workspace
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-10 border-t border-outline-variant bg-surface-container-lowest mt-auto relative z-10">
        <div className="max-w-container-max mx-auto px-margin-safe flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-headline-md text-on-surface tracking-wide font-bold text-lg">NEXA</div>
          <div className="flex flex-wrap gap-6 font-label-sm text-xs text-outline font-mono">
            <Link className="hover:text-primary transition-colors duration-300" href="/login">Privacy Protocol</Link>
            <Link className="hover:text-primary transition-colors duration-300" href="/login">Terms of Service</Link>
            <Link className="hover:text-primary transition-colors duration-300" href="/dashboard">Security Whitepaper</Link>
            <Link className="hover:text-primary transition-colors duration-300" href="/dashboard">API Docs</Link>
          </div>
          <div className="font-label-sm text-xs text-outline font-mono">© 2026 NEXA Intelligence Engine. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
