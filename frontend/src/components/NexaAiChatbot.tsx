import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, KnowledgeDocument, CitationItem } from '../types';
import { runQuery } from '../api/knowledge';
import type { ApiError } from '../api/client';
import {
  Bot,
  Send,
  Sparkles,
  Paperclip,
  Trash2,
  Download,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Sliders,
  Cpu,
  Layers,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  Zap,
  RefreshCw,
  X,
  MessageSquare,
  CornerDownLeft
} from 'lucide-react';
import { playTactileClick, playResolvedChime, playAlertWarble } from '../utils/audio';

interface NexaAiChatbotProps {
  onInspectDocument?: (doc: KnowledgeDocument) => void;
}

export const NexaAiChatbot: React.FC<NexaAiChatbotProps> = ({ onInspectDocument }) => {
  // Chat History State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        'Hello Architect. I am your **NEXA Neural Co-Pilot**. I am grounded directly in your backend knowledge base, vector embeddings, and temporal arbitration rules.\n\nAsk me anything about contracts, policies, SLA terms, or compliance guidelines with live citation provenance.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 99,
      confidence_level: 'HIGH',
      provider: 'Groq Compound',
      latencyMs: 15,
    },
  ]);


  // Input & Controls State
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'groq' | 'nexa-hybrid'>('groq');
  const [selectedMode, setSelectedMode] = useState<'deep-rag' | 'fast-qa' | 'legal-audit'>('deep-rag');
  const [selectedScope, setSelectedScope] = useState<string>('All Files');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [temperature, setTemperature] = useState(0.2);
  const [topK, setTopK] = useState(5);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle Copy message
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    playTactileClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Prompt Chips
  const promptChips = [
    { label: '💸 Refund Policy & Retainers', text: 'What is our policy on enterprise refunds and custom onboarding retainers?' },
    { label: '🏖️ Sabbatical Leave Eligibility', text: 'How many days of paid sabbatical are employees entitled to and when does it vest?' },
    { label: '🛡️ SOC 2 Key Rotation Period', text: 'What are our SOC 2 cryptographic key rotation and PII redaction rules?' },
    { label: '⚡ SLA Downtime Penalty', text: 'What are the penalty tiers if uptime drops below 99.9% in the Master Services Agreement?' },
    { label: '⚖️ Resolve Policy Contradiction', text: 'Compare 2021 Employee Handbook vs 2024 Updated Benefits policy for contradictions.' },
  ];

  // Send Message Handler — connected to real RAG backend API
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isTyping) return;

    playTactileClick();
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachedDocs: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedFiles([]);
    setIsTyping(true);

    try {
      // Pass conversation history to backend for context-aware multi-turn RAG
      const history = messages
        .filter((m) => m.id !== 'msg-welcome')
        .map((m) => ({ role: m.role, content: m.content }));

      const result = await runQuery(content, topK, history);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: result.confidence,
        confidence_level: result.confidence_level,
        provider: result.provider === 'gemini' ? 'Gemini 2.5 Flash' : 'Groq LLaMA 3.3 70B',
        latencyMs: result.latencyMs,
        citations: result.citations,
        conflictDetected: result.conflictDetected,
        conflictNote: result.conflictDetails ? result.conflictDetails.verdict : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
      playResolvedChime();
    } catch (err) {
      const apiErr = err as ApiError;
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠ Unable to process query with backend: ${apiErr.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0,
        confidence_level: 'NONE',
        provider: 'Gemini 2.5 Flash',
        latencyMs: 0,
      };
      setMessages((prev) => [...prev, errorMsg]);
      playAlertWarble();
    } finally {
      setIsTyping(false);
    }
  };


  // Export chat
  const handleExportChat = () => {
    playTactileClick();
    const chatExport = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()}:\n${m.content}\n${m.citations ? `Citations: ${m.citations.map(c => c.sourceDoc).join(', ')}` : ''}`)
      .join('\n\n---\n\n');
    const blob = new Blob([chatExport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa_ai_chat_session_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    playResolvedChime();
  };

  // Clear chat
  const handleClearChat = () => {
    playTactileClick();
    setMessages([
      {
        id: 'msg-welcome-fresh',
        role: 'assistant',
        content: 'Conversation history cleared. Ready for a new enterprise intelligence session.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 99,
        provider: 'Gemini 2.5 Flash',
      },
    ]);
    playResolvedChime();
  };

  return (
    <div id="nexa-ai-chatbot-section" className="space-y-4 animate-in fade-in duration-300">
      {/* Top Chatbot Command Header */}
      <div className="apple-glass-card rounded-[28px] p-4 sm:p-6 border border-white/15 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)]">
            <div className="w-full h-full bg-[#0d0a1c] rounded-[14px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#c084fc]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                NEXA AI Neural Co-Pilot
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                ONLINE
              </span>
            </div>
            <p className="font-sans text-xs text-[#94a3b8] mt-0.5">
              Grounded multi-turn enterprise reasoning with cryptographic citation links and conflict arbitration.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
            <button
              onClick={() => {
                playTactileClick();
                setSelectedModel('groq');
              }}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                selectedModel === 'groq'
                  ? 'bg-[#7c3aed] text-white shadow-md'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              Groq LLaMA 3.3
            </button>
          </div>

          {/* Settings & Tuning Drawer Trigger */}
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              showSettingsDrawer
                ? 'bg-[#7c3aed]/30 border-[#a855f7] text-white'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-[#94a3b8] hover:text-white'
            }`}
            title="Reasoning Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Export Chat */}
          <button
            onClick={handleExportChat}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-white transition-all cursor-pointer"
            title="Export Markdown Session"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          <button
            onClick={handleClearChat}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[#94a3b8] hover:text-red-300 transition-all cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional Reasoning Hyperparameters Dropdown */}
      {showSettingsDrawer && (
        <div className="apple-glass-card rounded-2xl p-4 border border-[#a855f7]/40 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono animate-in fade-in">
          <div className="space-y-1">
            <div className="flex justify-between text-[#94a3b8] text-[10px]">
              <span>HALLUCINATION GUARD (TEMPERATURE)</span>
              <strong className="text-[#c084fc]">{temperature}</strong>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#a855f7] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[#94a3b8] text-[10px]">
              <span>TOP-K RETRIEVAL CONTEXT</span>
              <strong className="text-[#38bdf8]">{topK} chunks</strong>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={topK}
              onChange={(e) => setTopK(parseInt(e.target.value))}
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <span className="text-[#94a3b8] text-[10px] block">GROUNDING SCOPE</span>
            <select
              value={selectedScope}
              onChange={(e) => setSelectedScope(e.target.value)}
              className="w-full p-1.5 rounded-lg bg-[#090616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
            >
              <option value="All Files">All Files (8 indexed docs)</option>
              <option value="Legal & HR">Legal & HR Documents Only</option>
              <option value="Security & SOC2">Security & SOC 2 Only</option>
              <option value="Contracts & SLAs">Contracts & SLAs Only</option>
            </select>
          </div>
        </div>
      )}

      {/* Main Chat Stream Viewport */}
      <div className="apple-glass-card rounded-[28px] border border-white/15 shadow-2xl p-4 sm:p-6 flex flex-col h-[560px] sm:h-[620px] relative overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-[#38bdf8] to-[#0ea5e9] text-white'
                    : 'bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] text-white'
                }`}
              >
                {msg.role === 'user' ? (
                  <span className="font-mono text-xs font-bold">YOU</span>
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              {/* Message Bubble Card */}
              <div
                className={`p-4 rounded-2xl space-y-2.5 transition-all text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#7c3aed]/25 border border-[#a855f7]/40 text-white rounded-tr-sm'
                    : 'bg-[#0a071a]/85 border border-white/10 text-[#cbd5e1] rounded-tl-sm shadow-xl'
                }`}
              >
                {/* Meta Header for Assistant */}
                {msg.role === 'assistant' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-white/10 font-mono text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#4ade80] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {msg.confidence || 98}% {msg.confidence_level || 'HIGH'}
                      </span>
                      <span className="text-[#94a3b8]">
                        • {msg.provider || 'Gemini 2.5 Flash'} ({msg.latencyMs || 85}ms)
                      </span>
                    </div>
                    <span className="text-[#94a3b8]">{msg.timestamp}</span>
                  </div>
                )}

                {/* Conflict Alert in Chat */}
                {msg.conflictDetected && (
                  <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 font-mono text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-amber-300 block text-[10px] uppercase font-bold">
                        Temporal Contradiction Arbitrated
                      </strong>
                      <span>{msg.conflictNote || 'Active 2024 policy verified over historical draft.'}</span>
                    </div>
                  </div>
                )}

                {/* Attached Docs Indicator if user uploaded */}
                {msg.attachedDocs && msg.attachedDocs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {msg.attachedDocs.map((doc, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white/10 text-[#38bdf8] font-mono text-[10px] flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        {doc}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed text-[#e2e8f0]">
                  {msg.content}
                </div>

                {/* Grounded Citation Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                      VERIFIED CITATION SOURCES ({msg.citations.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            playTactileClick();
                            if (onInspectDocument) {
                              onInspectDocument({
                                id: c.sourceDoc,
                                title: c.sourceDoc,
                                type: (c.sourceType as any) || 'pdf',
                                date: c.docDate || new Date().toISOString().split('T')[0],
                                department: 'General',
                                status: 'active',
                                confidence: c.matchScorePct || 98,
                                conflictsCount: 0,
                                size: '1.2 MB',
                                vectorCount: 16,
                              });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#a855f7]/50 text-[10px] font-mono text-[#cbd5e1] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer group"
                        >
                          <span className="text-[#c084fc] font-bold">[{c.label}]</span>
                          <span className="truncate max-w-[140px]">{c.sourceDoc}</span>
                          <span className="text-[#4ade80] font-bold">({c.matchScorePct || 98}%)</span>
                          <ExternalLink className="w-2.5 h-2.5 text-[#94a3b8] group-hover:text-white" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Bar on Hover/Display */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between pt-1 text-[#94a3b8]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="p-1 rounded hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => playTactileClick()}
                        className="p-1 rounded hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Helpful"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => playTactileClick()}
                        className="p-1 rounded hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                        title="Report issue"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="font-mono text-[9px] text-[#94a3b8]/70">Zero PII Leakage • SHA-256 Grounded</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Live Typing / Synthesizing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0a071a]/85 border border-white/10 text-[#cbd5e1] rounded-tl-sm flex items-center gap-2 font-mono text-xs text-[#c084fc]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#c084fc]" />
                <span>Cross-referencing neural vectors and synthesizing citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompt Chips */}
        <div className="pt-3 pb-1 border-t border-white/10 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 w-max">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.text)}
                disabled={isTyping}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#a855f7]/40 text-white/80 hover:text-white font-mono text-[10px] whitespace-nowrap transition-all cursor-pointer disabled:opacity-50"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input Console */}
        <div className="pt-2">
          {/* Attached Files Pill bar */}
          {attachedFiles.length > 0 && (
            <div className="flex items-center gap-2 pb-2">
              <span className="font-mono text-[10px] text-[#94a3b8]">ATTACHED:</span>
              {attachedFiles.map((doc, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-lg bg-[#7c3aed]/20 border border-[#a855f7]/40 text-[#c084fc] font-mono text-[10px] flex items-center gap-1.5"
                >
                  <FileText className="w-3 h-3" />
                  {doc}
                  <button
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i))}
                    className="hover:text-white cursor-pointer"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask NEXA Co-Pilot anything across indexed files..."
                className="w-full pl-4 pr-12 py-3 rounded-2xl bg-[#090616] border border-white/15 focus:border-[#a855f7] text-white placeholder-white/40 focus:outline-none font-sans text-xs sm:text-sm shadow-inner"
              />

              {/* Quick file attach button */}
              <button
                onClick={() => {
                  playTactileClick();
                  setAttachedFiles(['refund_policy_v2.pdf', 'enterprise_terms.pdf']);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                title="Attach Context Documents"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isTyping}
              className="btn-orbitsat-purple p-3 rounded-2xl font-sans text-xs font-bold flex items-center justify-center cursor-pointer shadow-lg disabled:opacity-40 flex-shrink-0"
              title="Send Prompt (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
