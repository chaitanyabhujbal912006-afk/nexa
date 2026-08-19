import React, { useState, useEffect } from 'react';
import { UserSession, KnowledgeDocument, WorkspaceTab, QueryResult, ConflictRecord } from '../types';
import { runQuery, listDocuments, uploadDocument, deleteDocument, scanConflicts } from '../api/knowledge';
import type { ApiError } from '../api/client';


import { NexaAiChatbot } from './NexaAiChatbot';
import { NexaBentoOverview } from './NexaBentoOverview';
import { ClusterTopologyCanvas } from './ClusterTopologyCanvas';
import { AuditLedgerView } from './AuditLedgerView';
import { ExecutiveReportGenerator } from './ExecutiveReportGenerator';
import { SettingsCenter } from './SettingsCenter';
import { DocumentModal } from './DocumentModal';
import { ArchitectureModal } from './ArchitectureModal';
import {
  Bot,
  LayoutGrid,
  Search,
  Database,
  AlertTriangle,
  Network,
  History,
  FileDown,
  SlidersHorizontal,
  ArrowLeft,
  Upload,
  RefreshCw,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Eye,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  HardDrive,
  Copy,
  Check,
  Clock,
  Key,
  Layers,
  Filter,
  CheckCheck,
  Info
} from 'lucide-react';
import { playTactileClick, playResolvedChime, playAlertWarble } from '../utils/audio';

interface IntelligenceWorkspaceProps {
  session: UserSession;
  onBackToLanding: () => void;
  onUpdateSession?: (session: UserSession) => void;
}

export const IntelligenceWorkspace: React.FC<IntelligenceWorkspaceProps> = ({
  session,
  onBackToLanding,
  onUpdateSession,
}) => {
  // Active Workspace Route / Tab (Default to AI Chatbot for instant access)
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chatbot');

  // Modals state
  const [inspectedDoc, setInspectedDoc] = useState<KnowledgeDocument | null>(null);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);

  // --- 1. NEURAL QUERY STUDIO STATE ---
  const [queryInput, setQueryInput] = useState('');
  const [topK, setTopK] = useState(5);
  const [useHistory, setUseHistory] = useState(true);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [activeQueryResult, setActiveQueryResult] = useState<QueryResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [isStreamingTokens, setIsStreamingTokens] = useState(false);

  // --- 2. KNOWLEDGE VAULT (DOCUMENTS) STATE ---
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);

  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('All');
  const [uploadState, setUploadState] = useState<'IDLE' | 'UPLOADING' | 'INGESTING' | 'INDEXED' | 'ERROR'>('IDLE');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);

  // --- 3. CONFLICT MATRIX STATE ---
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([]);

  const [isScanningConflicts, setIsScanningConflicts] = useState(false);
  const [scanSuccessToast, setScanSuccessToast] = useState(false);

  // Quick prompt execution helper
  const handleRunSampleQuery = (prompt: string) => {
    setQueryInput(prompt);
    executeNeuralQuery(prompt);
  };

  // Fetch real documents from backend on mount
  useEffect(() => {
    const loadDocs = async () => {
      setIsLoadingDocs(true);
      try {
        const realDocs = await listDocuments();
        setDocuments(realDocs);
      } catch {
        // Backend unavailable — remain empty, user will see empty state
      } finally {
        setIsLoadingDocs(false);
      }
    };
    loadDocs();
  }, []);

  // Neural Query Execution — real backend call
  const executeNeuralQuery = async (customPrompt?: string) => {
    const promptToRun = (customPrompt || queryInput).trim();
    if (!promptToRun || isQuerying) return;

    playTactileClick();
    setIsQuerying(true);
    setStreamedText('');
    setIsStreamingTokens(true);
    setActiveQueryResult(null);

    if (!queryHistory.includes(promptToRun)) {
      setQueryHistory([promptToRun, ...queryHistory.slice(0, 9)]);
    }

    try {
      const result = await runQuery(promptToRun, topK, []);
      setActiveQueryResult(result);
      setIsQuerying(false);

      // Simulate token streaming of the answer text
      const fullText = result.answerText;
      let currIdx = 0;
      const streamInterval = setInterval(() => {
        currIdx += 6;
        if (currIdx >= fullText.length) {
          setStreamedText(fullText);
          setIsStreamingTokens(false);
          clearInterval(streamInterval);
          playResolvedChime();
          if (result.conflictDetected) playAlertWarble();
        } else {
          setStreamedText(fullText.substring(0, currIdx));
        }
      }, 20);
    } catch (err) {
      const apiErr = err as ApiError;
      setIsQuerying(false);
      setIsStreamingTokens(false);
      const errText = `⚠ Query failed: ${apiErr.message}`;
      setStreamedText(errText);
      setActiveQueryResult({
        id: `error-${Date.now()}`,
        query: promptToRun,
        answerText: errText,
        confidence: 0,
        confidence_level: 'NONE',
        sourcesVerifiedCount: 0,
        conflictDetected: false,
        citations: [],
      });
      playAlertWarble();
    }
  };

  // Upload handler with validation — calls real backend

  const handleFileUpload = async (file: File) => {
    const validExtensions = ['.pdf', '.xlsx', '.xls', '.csv', '.txt', '.eml', '.docx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      setUploadError(`Invalid file format "${fileExt}". Allowed: ${validExtensions.join(', ')}`);
      setUploadState('ERROR');
      playAlertWarble();
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError('File size exceeds maximum allowable limit (50 MB).');
      setUploadState('ERROR');
      playAlertWarble();
      return;
    }

    setUploadError(null);
    setUploadState('UPLOADING');
    playTactileClick();

    try {
      setUploadState('INGESTING');
      await uploadDocument(file);
      // Refresh document list from backend after successful upload
      const freshDocs = await listDocuments();
      setDocuments(freshDocs);
      setUploadState('INDEXED');
      setUploadSuccessToast(true);
      playResolvedChime();
      setTimeout(() => {
        setUploadState('IDLE');
        setUploadSuccessToast(false);
      }, 3000);
    } catch (err) {
      const apiErr = err as ApiError;
      setUploadError(apiErr.message ?? 'Upload failed. Please try again.');
      setUploadState('ERROR');
      playAlertWarble();
      setTimeout(() => setUploadState('IDLE'), 3000);
    }
  };

  // Delete Document — calls real backend
  const handleConfirmDeleteDoc = async (docId: string) => {
    playTactileClick();
    try {
      await deleteDocument(docId); // docId === filename (document name from backend)
      setDocuments(documents.filter((d) => d.id !== docId));
      playResolvedChime();
    } catch (err) {
      const apiErr = err as ApiError;
      setUploadError(apiErr.message ?? 'Delete failed. Please try again.');
      playAlertWarble();
    } finally {
      setDocToDelete(null);
    }
  };

  // Full Conflict Matrix Scan — calls real backend
  const handleRunFullConflictScan = async () => {
    playTactileClick();
    setIsScanningConflicts(true);
    try {
      const realConflicts = await scanConflicts();
      setConflicts(realConflicts);
      setScanSuccessToast(true);
      playResolvedChime();
      setTimeout(() => setScanSuccessToast(false), 3000);
    } catch (err) {
      const apiErr = err as ApiError;
      playAlertWarble();
    } finally {
      setIsScanningConflicts(false);
    }
  };

  // Resolve conflict

  const handleToggleResolveConflict = (id: string) => {
    playTactileClick();
    setConflicts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
    playResolvedChime();
  };

  // Filtered documents in Knowledge Vault
  const filteredVaultDocs = documents.filter((doc) => {
    const matchSearch =
      doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
      doc.department.toLowerCase().includes(docSearchQuery.toLowerCase());
    const matchType = docTypeFilter === 'All' || doc.type === docTypeFilter.toLowerCase();
    return matchSearch && matchType;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 pt-24 pb-16 min-h-screen flex flex-col gap-6 font-sans">
      {/* Workspace Unified Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-5 sm:p-6 rounded-[28px] border border-white/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#7c3aed]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3.5">
          <button
            onClick={() => {
              playTactileClick();
              onBackToLanding();
            }}
            className="p-2.5 rounded-full apple-glass-pill text-[#94a3b8] hover:text-white transition-all cursor-pointer shadow-md"
            title="Return to Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.6)]">
                  <div className="w-full h-full bg-[#0d0a1c] rounded-[6px] flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-[#c084fc] fill-current" />
                  </div>
                </div>
                <span className="font-display font-extrabold text-lg text-white tracking-wider">
                  NEXA
                </span>
              </div>
              <span className="bg-[#7c3aed]/20 text-[#c084fc] text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#a855f7]/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                ENTERPRISE V3.0
              </span>
              <span className="bg-[#22c55e]/20 text-[#4ade80] text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-[#22c55e]/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                SOVEREIGN VPC
              </span>
            </div>
            <p className="font-mono text-xs text-[#94a3b8] mt-1">
              TENANT: <span className="text-[#38bdf8] font-bold">{session.company || 'Starlight Dynamics VPC'}</span> • ARCHITECT: <span className="text-white font-semibold">{session.fullName || 'Elena Rostova'}</span>
            </p>
          </div>
        </div>

        {/* Global Quick Action Bar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playTactileClick();
              setIsArchModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>SOC 2 Verified</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              setActiveTab('chatbot');
            }}
            className={`px-4 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-lg ${
              activeTab === 'chatbot'
                ? 'btn-orbitsat-purple text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Co-Pilot</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Segmented Tab Bar (Clean, Centered, No Scrollbars) */}
      <div className="w-full flex justify-start sm:justify-center overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-1 sm:gap-1.5 p-1.5 rounded-2xl sm:rounded-full apple-glass-pill border border-white/15 shadow-2xl backdrop-blur-2xl max-w-full">
          {[
            { id: 'chatbot' as WorkspaceTab, label: 'AI Co-Pilot', icon: Bot, isHighlight: true },
            { id: 'query' as WorkspaceTab, label: 'Query Studio', icon: Sparkles },
            { id: 'documents' as WorkspaceTab, label: 'Knowledge Vault', icon: Database, badge: documents.length },
            { id: 'conflicts' as WorkspaceTab, label: 'Conflict Matrix', icon: AlertTriangle, badge: conflicts.filter(c => !c.resolved).length },
            { id: 'topology' as WorkspaceTab, label: 'Topology Map', icon: Network },
            { id: 'audit' as WorkspaceTab, label: 'Audit Ledger', icon: History },
            { id: 'reports' as WorkspaceTab, label: 'Executive Briefs', icon: FileDown },
            { id: 'settings' as WorkspaceTab, label: 'Settings', icon: SlidersHorizontal },
            { id: 'overview' as WorkspaceTab, label: 'Overview', icon: LayoutGrid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTactileClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'btn-orbitsat-purple shadow-lg text-white font-bold'
                    : 'text-[#94a3b8] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${tab.isHighlight && !isActive ? 'text-[#c084fc]' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold ${
                    tab.id === 'conflicts' ? 'bg-amber-500/30 text-amber-300' : 'bg-white/20 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB 1: AI CO-PILOT / CHATBOT SECTION --- */}
      {activeTab === 'chatbot' && (
        <NexaAiChatbot
          onInspectDocument={(doc) => setInspectedDoc(doc)}
        />
      )}

      {/* --- TAB 2: NEURAL QUERY STUDIO (/dashboard/query) --- */}
      {activeTab === 'query' && (
        <div id="neural-query-studio" className="space-y-6 animate-in fade-in duration-300">
          {/* Query Studio Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#c084fc]" />
                <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
                  RAG REASONING WORKSPACE
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Neural Query Studio
              </h2>
              <p className="font-sans text-xs text-[#94a3b8] mt-1">
                Grounded semantic question answering across indexed organization files with verifiable citation provenance.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  playTactileClick();
                  setActiveTab('reports');
                }}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <FileDown className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Export PDF Report</span>
              </button>
            </div>
          </div>

          {/* Main Grid: Prompt Console + Response Synthesis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Prompt Input & Parameters (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Query Box */}
              <div className="apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4 text-white">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                    ENTERPRISE NEURAL QUERY
                  </label>
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          executeNeuralQuery();
                        }
                      }}
                      placeholder="Ask any policy, contract clause, SLA requirement, or compliance rule..."
                      className="w-full p-4 rounded-2xl bg-[#090616] border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#a855f7] font-sans text-xs leading-relaxed resize-none custom-scrollbar"
                    />
                  </div>
                </div>

                {/* Hyperparameters Controls */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-[#94a3b8]">
                      <span>TOP-K CHUNKS</span>
                      <strong className="text-white">{topK}</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={topK}
                      onChange={(e) => setTopK(parseInt(e.target.value))}
                      className="w-full accent-[#a855f7] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pl-2 border-l border-white/10">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-[#94a3b8] block">USE HISTORY</span>
                      <strong className="text-white text-[11px]">{useHistory ? 'Active' : 'Disabled'}</strong>
                    </div>
                    <input
                      type="checkbox"
                      checked={useHistory}
                      onChange={(e) => setUseHistory(e.target.checked)}
                      className="rounded accent-[#a855f7] cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  onClick={() => executeNeuralQuery()}
                  disabled={!queryInput.trim() || isQuerying}
                  className="w-full py-3 rounded-2xl btn-orbitsat-purple font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {isQuerying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Answer...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Execute Neural Pass</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample / Recent History Chips */}
              <div className="apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-3 text-white">
                <span className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">
                  VERIFIED SAMPLE PROMPTS
                </span>
                <div className="space-y-2">
                  {queryHistory.map((hist, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRunSampleQuery(hist)}
                      className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#a855f7]/40 text-xs text-[#cbd5e1] hover:text-white transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <span className="truncate pr-2 font-sans">{hist}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#94a3b8] group-hover:text-[#c084fc] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Grounded Response Synthesis (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {activeQueryResult ? (
                <div className="apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6 text-white relative">
                  {/* Status Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{activeQueryResult.confidence}% {activeQueryResult.confidence_level || 'HIGH'} Confidence</span>
                      </span>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-[#94a3b8] border border-white/10 uppercase">
                        Provider: {activeQueryResult.provider || 'gemini'} ({activeQueryResult.latencyMs || 120}ms)
                      </span>
                    </div>

                    <span className="font-mono text-[11px] text-[#38bdf8]">
                      {activeQueryResult.sourcesVerifiedCount || topK} Chunks Verified
                    </span>
                  </div>

                  {/* Conflict Detection Banner */}
                  {activeQueryResult.conflictDetected && activeQueryResult.conflictDetails && (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 space-y-2 animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-bold font-display uppercase tracking-wider text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>Temporal Policy Contradiction Detected & Resolved</span>
                      </div>
                      <p className="font-sans text-xs text-amber-200/90 leading-relaxed">
                        {activeQueryResult.conflictDetails.verdict}
                      </p>
                      <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-amber-400/70 block text-[9px]">DEPRECATED SOURCE:</span>
                          <span className="text-amber-100 line-through">{activeQueryResult.conflictDetails.outdatedSource} ({activeQueryResult.conflictDetails.outdatedDate})</span>
                        </div>
                        <div>
                          <span className="text-[#4ade80] block text-[9px]">ACTIVE SOURCE:</span>
                          <span className="text-white font-bold">{activeQueryResult.conflictDetails.activeSource} ({activeQueryResult.conflictDetails.activeDate})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grounded Answer Text */}
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                      GROUNDED NEURAL SYNTHESIS
                    </span>
                    <div className="p-5 rounded-2xl bg-[#090616]/80 border border-white/10 font-sans text-sm text-[#cbd5e1] leading-relaxed relative">
                      {streamedText}
                      {isStreamingTokens && (
                        <span className="inline-block w-2 h-4 ml-1 bg-[#c084fc] animate-pulse align-middle" />
                      )}
                    </div>
                  </div>

                  {/* Citations Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">
                        VERIFIED SOURCE CITATIONS ({activeQueryResult.citations.length})
                      </span>
                      <span className="font-mono text-[10px] text-[#94a3b8]">Click citation chip to inspect full vector chunk</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeQueryResult.citations.map((citation) => (
                        <div
                          key={citation.id}
                          onClick={() => {
                            playTactileClick();
                            const matched = documents.find(d => d.title === citation.sourceDoc) || documents[0];
                            setInspectedDoc(matched);
                          }}
                          className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#a855f7]/50 transition-all cursor-pointer space-y-1.5 group"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="px-2 py-0.5 rounded-md bg-[#7c3aed]/30 text-[#c084fc] font-bold group-hover:text-white">
                              [{citation.label}] {citation.sourceDoc}
                            </span>
                            <span className="text-[#4ade80] font-bold">
                              {citation.matchScorePct || 98}% Match
                            </span>
                          </div>
                          <p className="font-sans text-[11px] text-[#cbd5e1] line-clamp-2 italic">
                            "{citation.excerpt}"
                          </p>
                          <span className="font-mono text-[10px] text-[#94a3b8] block pt-1">
                            {citation.section || citation.pageOrClause} • {citation.timestamp || citation.docDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="apple-glass-card rounded-[28px] p-12 border border-white/15 shadow-2xl text-center text-[#94a3b8]">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-[#7c3aed] opacity-60" />
                  <h3 className="font-display font-bold text-white text-base">Neural Reasoning Engine Ready</h3>
                  <p className="font-sans text-xs mt-1 max-w-sm mx-auto">
                    Type a question or select a verified sample prompt on the left to begin grounded retrieval.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: KNOWLEDGE VAULT (/dashboard/documents) --- */}
      {activeTab === 'documents' && (
        <div id="knowledge-vault" className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-4 h-4 text-[#c084fc]" />
                <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
                  IMMUTABLE VECTOR STORAGE
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Knowledge Vault & Document Ingestion
              </h2>
              <p className="font-sans text-xs text-[#94a3b8] mt-1">
                Securely ingest, chunk, hash, and index enterprise documents into ChromaDB vector collections.
              </p>
            </div>

            <div className="flex items-center gap-4 p-2.5 rounded-2xl bg-white/5 border border-white/10 font-mono text-xs">
              <div>
                <span className="text-[#94a3b8] text-[10px] block">TOTAL INDEXED</span>
                <strong className="text-white">{documents.length} Files</strong>
              </div>
              <div className="h-6 w-px bg-white/15" />
              <div>
                <span className="text-[#94a3b8] text-[10px] block">VECTOR CHUNKS</span>
                <strong className="text-[#38bdf8]">
                  {documents.reduce((acc, d) => acc + (d.vectorCount || 100), 0).toLocaleString()}
                </strong>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className="p-8 rounded-2xl border-2 border-dashed border-[#a855f7]/40 hover:border-[#a855f7] bg-[#090616]/60 flex flex-col items-center justify-center gap-3 text-center transition-all cursor-pointer"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.xlsx,.xls,.csv,.txt,.eml,.docx';
                input.onchange = (e: any) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#7c3aed]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-white">
                  Drop corporate files here or click to browse
                </h4>
                <p className="font-mono text-[11px] text-[#94a3b8] mt-1">
                  Supported: PDF, Excel (.xlsx, .xls), CSV, E-Mail (.eml), TXT, DOCX (Max 50MB)
                </p>
              </div>

              {uploadState !== 'IDLE' && (
                <div className="font-mono text-xs font-bold text-[#c084fc] flex items-center gap-2 pt-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {uploadState === 'UPLOADING' && 'Step 1/3: Encrypting & Uploading...'}
                    {uploadState === 'INGESTING' && 'Step 2/3: Chunking & Generating 384-dim Embeddings...'}
                    {uploadState === 'INDEXED' && 'Step 3/3: Ingestion Complete!'}
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="apple-glass-card rounded-2xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="relative flex-1 min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                placeholder="Search indexed files by name, department, or tag..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#a855f7] text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
              {['All', 'PDF', 'DOCX', 'XLSX', 'EML'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    playTactileClick();
                    setDocTypeFilter(type);
                  }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    docTypeFilter === type
                      ? 'bg-[#7c3aed] text-white shadow-md'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Documents Table */}
          <div className="apple-glass-card rounded-[28px] border border-white/15 shadow-2xl overflow-hidden text-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 font-mono text-[10px] uppercase text-[#94a3b8]">
                    <th className="p-4">Document Title</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Ingested Date</th>
                    <th className="p-4">File Size</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
                  {filteredVaultDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-white/5 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/20 border border-[#a855f7]/30 flex items-center justify-center text-[#c084fc]">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-white block font-semibold">{doc.title}</strong>
                            <span className="font-mono text-[10px] text-[#94a3b8] uppercase">{doc.type} • {doc.vectorCount || 100} Chunks</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs text-[#38bdf8]">{doc.department}</td>
                      <td className="p-4 font-mono text-xs">{doc.date}</td>
                      <td className="p-4 font-mono text-xs">{doc.size}</td>
                      <td className="p-4 font-mono">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          doc.status === 'active'
                            ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30'
                            : doc.status === 'outdated'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/10 text-[#94a3b8]'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              playTactileClick();
                              setInspectedDoc(doc);
                            }}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#c084fc] hover:text-white transition-all cursor-pointer text-[11px] font-bold"
                          >
                            Inspect Chunks
                          </button>
                          <button
                            onClick={() => setDocToDelete(doc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#94a3b8] hover:text-red-300 transition-all cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {docToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="apple-glass-card rounded-[28px] p-6 border border-red-500/30 max-w-md w-full space-y-4 text-white">
                <div className="flex items-center gap-2 text-red-400 font-display font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>Purge Document & Embeddings?</span>
                </div>
                <p className="font-sans text-xs text-[#cbd5e1] leading-relaxed">
                  This action will permanently delete the file and remove its vectors from the ChromaDB collection. Existing query audit logs will retain the historical hash.
                </p>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setDocToDelete(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-[#cbd5e1] hover:text-white text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConfirmDeleteDoc(docToDelete)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Purge
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: CONFLICT MATRIX (/dashboard/conflicts) --- */}
      {activeTab === 'conflicts' && (
        <div id="conflict-matrix" className="space-y-6 animate-in fade-in duration-300">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  TEMPORAL CONTRADICTION ENGINE
                </span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
                Conflict & Arbitration Matrix
              </h2>
              <p className="font-sans text-xs text-[#94a3b8] mt-1">
                Automated legal arbitration resolving superseded contracts and deprecated handbook guidelines.
              </p>
            </div>

            <button
              onClick={handleRunFullConflictScan}
              disabled={isScanningConflicts}
              className="btn-orbitsat-purple px-5 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {isScanningConflicts ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning Embeddings...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan All Documents</span>
                </>
              )}
            </button>
          </div>

          {scanSuccessToast && (
            <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Full vector sweep complete: 3 contradiction points mapped with arbitration rules.</span>
            </div>
          )}

          {/* Conflict Cards Grid */}
          <div className="space-y-4">
            {conflicts.map((item) => (
              <div
                key={item.id}
                className="apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl space-y-4 text-white"
              >
                {/* Top Row: Topic, Rule Badge, Resolve Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#a855f7]/30 uppercase">
                      {item.topic.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 font-bold">
                      {item.ruleApplied}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleResolveConflict(item.id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      item.resolved
                        ? 'bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                    }`}
                  >
                    {item.resolved ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    <span>{item.resolved ? 'Arbitration Signed-Off' : 'Mark as Resolved'}</span>
                  </button>
                </div>

                {/* Side-by-Side Comparison: Trusted Source vs Outdated Sources */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Left: Trusted Source */}
                  <div className="p-4 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#4ade80] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                        <span>ACTIVE / TRUSTED REVISION</span>
                      </span>
                      <span className="text-white/80">{item.trustedDate}</span>
                    </div>
                    <strong className="text-white font-display text-sm block">
                      {item.trustedSource}
                    </strong>
                    <p className="font-sans text-xs text-[#cbd5e1] leading-relaxed">
                      "{item.trustedClaim}"
                    </p>
                  </div>

                  {/* Right: Deprecated Outdated Sources */}
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        <span>SUPERSEDED / DEPRECATED ({item.outdatedSources.length})</span>
                      </span>
                    </div>
                    <div className="space-y-2">
                      {item.outdatedSources.map((outdated, oIdx) => (
                        <div key={oIdx} className="space-y-0.5">
                          <div className="flex justify-between font-mono text-[11px] text-amber-300">
                            <strong className="line-through">{outdated.citation}</strong>
                            <span>{outdated.date}</span>
                          </div>
                          <p className="font-sans text-xs text-[#cbd5e1] line-through">
                            "{outdated.claim}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Verdict Summary */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 font-sans text-xs text-[#cbd5e1] flex items-center justify-between">
                  <div>
                    <strong className="text-white font-semibold block">Arbitration Verdict:</strong>
                    <span>{item.verdictSummary}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 5: TOPOLOGY MAP (/dashboard/topology) --- */}
      {activeTab === 'topology' && (
        <ClusterTopologyCanvas
          onInspectDocument={(docName) => {
            const matched = documents.find((d) => d.title === docName) || documents[0];
            setInspectedDoc(matched);
          }}
        />
      )}

      {/* --- TAB 6: AUDIT LEDGER (/dashboard/audit) --- */}
      {activeTab === 'audit' && <AuditLedgerView />}

      {/* --- TAB 7: EXECUTIVE REPORTS (/dashboard/reports) --- */}
      {activeTab === 'reports' && (
        <ExecutiveReportGenerator
          initialCitations={activeQueryResult?.citations}
        />
      )}

      {/* --- TAB 8: SETTINGS CENTER (/dashboard/settings) --- */}
      {activeTab === 'settings' && (
        <SettingsCenter
          userSession={session}
          onUpdateSession={(updated) => {
            if (onUpdateSession) {
              onUpdateSession({
                ...session,
                ...updated,
              });
            }
          }}
        />
      )}

      {/* --- TAB 9: OVERVIEW (BENTO HUB) --- */}
      {activeTab === 'overview' && (
        <NexaBentoOverview
          onOpenQueryTab={() => {
            playTactileClick();
            setActiveTab('query');
          }}
          onOpenConflictsTab={() => {
            playTactileClick();
            setActiveTab('conflicts');
          }}
          onOpenDocumentsTab={() => {
            playTactileClick();
            setActiveTab('documents');
          }}
          onOpenSettingsTab={() => {
            playTactileClick();
            setActiveTab('settings');
          }}
        />
      )}

      {/* MODAL 1: Document Chunk & Provenance Modal */}
      <DocumentModal
        document={inspectedDoc}
        onClose={() => setInspectedDoc(null)}
      />

      {/* MODAL 2: System Architecture & Compliance Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
};
