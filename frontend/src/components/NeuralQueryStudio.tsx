import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  Play,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Terminal,
  Activity,
} from 'lucide-react';
import { SCENARIOS } from '../data/mockKnowledge';
import { CitationItem, ExecutionStepTrace, NexaSystemSettings } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface NeuralQueryStudioProps {
  settings: NexaSystemSettings;
  onOpenCitationModal: (citation: CitationItem) => void;
}

export const NeuralQueryStudio: React.FC<NeuralQueryStudioProps> = ({
  settings,
  onOpenCitationModal,
}) => {
  const [inputPrompt, setInputPrompt] = useState('What is our current enterprise refund policy?');
  const [isProcessing, setIsProcessing] = useState(false);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [copied, setCopied] = useState(false);
  const [activeScenarioKey, setActiveScenarioKey] = useState<'refund' | 'warranty' | 'sabbatical'>('refund');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    'refund_policy_v2.pdf (Active)',
    'HR_Handbook_2021.pdf (Legacy)',
    'enterprise_terms.pdf (Legal)',
  ]);
  const [isDragging, setIsDragging] = useState(false);

  const scenario = SCENARIOS[activeScenarioKey];

  const executionTraces: ExecutionStepTrace[] = [
    { id: '1', label: '1. Ingress & OCR Layout Extraction', stage: 'parsing', durationMs: 14, status: 'completed', details: 'Extracted 14,280 tokens across 3 structured PDFs & 1 EML' },
    { id: '2', label: '2. HNSW Vector Embedding & Top-K Retrieval', stage: 'vector_search', durationMs: 38, status: 'completed', details: `Retrieved top ${settings.topK} vector candidates (Cosine similarity > ${settings.minSimilarity})` },
    { id: '3', label: '3. Temporal Graph & Conflict Arbitration', stage: 'conflict_audit', durationMs: 22, status: 'flagged', details: 'Detected 1 active policy supersession conflict (2024 MSA > 2021 Handbook)' },
    { id: '4', label: '4. Zero-Trust PII & Secret Redaction', stage: 'embedding', durationMs: 9, status: 'completed', details: 'Sanitized 2 credit card numbers & 1 internal AWS session token' },
    { id: '5', label: '5. LLM Synthesis Core Execution', stage: 'llm_synthesis', durationMs: 86, status: 'completed', details: `Synthesized via ${settings.activeModel} with factual bracket grounding` },
    { id: '6', label: '6. Cryptographic Provenance Hash Seal', stage: 'provenance_seal', durationMs: 4, status: 'completed', details: `Generated ${settings.hashAlgorithm} deterministic audit ledger proof` },
  ];

  const handleExecuteQuery = () => {
    setIsProcessing(true);
    setStreamingOutput('');
    setActiveStepIndex(0);

    playFuturisticSound('laser-ping', settings.audioFxEnabled, settings.masterVolume);

    const fullAnswer = scenario.verifiedAnswer;

    // Simulate trace execution pipeline
    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < executionTraces.length) {
        setActiveStepIndex(step);
        playFuturisticSound('click', settings.audioFxEnabled, settings.masterVolume * 0.5);
      } else {
        clearInterval(stepInterval);
        // Start streaming text
        let charIdx = 0;
        const textInterval = setInterval(() => {
          if (charIdx < fullAnswer.length) {
            setStreamingOutput(fullAnswer.slice(0, charIdx + 4));
            charIdx += 4;
          } else {
            clearInterval(textInterval);
            setStreamingOutput(fullAnswer);
            setIsProcessing(false);
            playFuturisticSound('resolve-success', settings.audioFxEnabled, settings.masterVolume);
          }
        }, settings.streamingSpeedMs || 15);
      }
    }, 180);
  };

  useEffect(() => {
    // Initial run
    handleExecuteQuery();
  }, [activeScenarioKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(streamingOutput || scenario.verifiedAnswer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (fileName: string) => {
    setUploadedFiles((prev) => [fileName, ...prev]);
    playFuturisticSound('quantum-chime', settings.audioFxEnabled, settings.masterVolume);
  };

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/40 uppercase tracking-widest">
              Live Neural Query Studio
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Real-time Execution
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Cognitive Sandbox
          </h2>
        </div>

        {/* Query Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 uppercase">Scenario:</span>
          {(['refund', 'warranty', 'sabbatical'] as const).map((key) => (
            <button
              key={key}
              onClick={() => {
                setActiveScenarioKey(key);
                if (key === 'refund') setInputPrompt('What is our current enterprise refund policy?');
                if (key === 'warranty') setInputPrompt('Which warranty terms apply to Enterprise hardware?');
                if (key === 'sabbatical') setInputPrompt('What is our sabbatical leave policy for senior staff?');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeScenarioKey === key
                  ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-[0_0_15px_var(--theme-glow)]'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Input + Execution Trace (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Query Terminal Box */}
          <div className="cyber-card rounded-2xl p-4 sm:p-6 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--theme-primary)]" />
                Prompt Dispatch Matrix
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Model: {settings.activeModel}
              </span>
            </div>

            <div className="relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                rows={3}
                placeholder="Enter enterprise query..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-[var(--theme-primary)] font-mono resize-none shadow-inner"
              />
              <button
                onClick={handleExecuteQuery}
                disabled={isProcessing}
                className="absolute bottom-3 right-3 btn-cyber-primary px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isProcessing ? 'Processing...' : 'Run Query'}</span>
              </button>
            </div>
          </div>

          {/* Cognitive Execution Trace Stepper */}
          <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono font-bold text-[var(--theme-primary)] uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Cognitive Execution Pipeline ({executionTraces.length} Stages)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Total Latency: ~173ms
              </span>
            </div>

            <div className="space-y-3">
              {executionTraces.map((trace, idx) => {
                const isActive = activeStepIndex === idx;
                const isPast = activeStepIndex > idx || (!isProcessing && activeStepIndex >= 0);

                return (
                  <div
                    key={trace.id}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      isActive
                        ? 'bg-[var(--theme-primary)]/10 border-[var(--theme-primary)] shadow-[0_0_15px_var(--theme-glow)]'
                        : isPast
                        ? 'bg-slate-950/60 border-slate-800/80'
                        : 'bg-slate-950/20 border-slate-900 opacity-40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {isPast ? (
                          trace.status === 'flagged' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[var(--theme-primary)] border-t-transparent animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex-shrink-0" />
                        )}
                        <span className={`text-xs font-mono font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {trace.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {trace.durationMs}ms
                      </span>
                    </div>
                    {(isActive || isPast) && (
                      <p className="text-[11px] text-slate-400 font-sans mt-1.5 pl-6 font-light">
                        {trace.details}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Output & Citation Provenance (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Synthesized Verified Response Card */}
          <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)] flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Verified Provenance Answer
              </span>
              <button
                onClick={handleCopy}
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Answer body with interactive citations */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex-1 min-h-[160px] text-sm leading-relaxed text-slate-200">
              {streamingOutput || scenario.verifiedAnswer}
              {isProcessing && <span className="inline-block w-2 h-4 bg-[var(--theme-primary)] ml-1 animate-pulse" />}
            </div>

            {/* Citations Attached */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2">
                Grounding Citations ({scenario.citations.length} Verified Sources)
              </span>
              <div className="space-y-2">
                {scenario.citations.map((cite) => (
                  <div
                    key={cite.id}
                    onClick={() => onOpenCitationModal(cite)}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-[var(--theme-primary)] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 font-bold flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--theme-primary)] group-hover:text-slate-950 transition-colors">
                        0{cite.id}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-[var(--theme-primary)] transition-colors">
                          {cite.docName}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">
                          {cite.pageOrSection} • {cite.relevanceScore}% match
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-white px-2 py-0.5 rounded bg-slate-800/80">
                      Inspect
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Document Ingestion Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0].name);
              }
            }}
            className={`cyber-card-subtle rounded-2xl p-4 border border-dashed transition-all text-center cursor-pointer ${
              isDragging ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' : 'border-slate-800 hover:border-slate-600'
            }`}
            onClick={() => handleFileUpload(`Custom_Enterprise_Doc_${Date.now().toString().slice(-4)}.pdf`)}
          >
            <UploadCloud className="w-6 h-6 text-[var(--theme-primary)] mx-auto mb-1.5" />
            <p className="text-xs font-bold text-white">Drop Enterprise Files to Ingest</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Supports PDF, XLSX, DOCX, EML (Instant OCR)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
