import React, { useState } from 'react';
import {
  Sliders,
  Cpu,
  Scale,
  Shield,
  Palette,
  Volume2,
  Server,
  Save,
  RotateCcw,
  Check,
  Zap,
} from 'lucide-react';
import { ColorTheme, NexaSystemSettings } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface SettingsCenterProps {
  settings: NexaSystemSettings;
  onUpdateSettings: (newSettings: NexaSystemSettings) => void;
}

export const SettingsCenter: React.FC<SettingsCenterProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<NexaSystemSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'rag' | 'conflict' | 'security' | 'visuals' | 'audio' | 'backend'>('rag');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    playFuturisticSound('resolve-success', localSettings.audioFxEnabled, localSettings.masterVolume);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    const defaultSettings: NexaSystemSettings = {
      topK: 5,
      minSimilarity: 0.75,
      chunkOverlapPercent: 20,
      rerankModel: 'nexa-cross-encoder-v2',
      contextWindowTokens: 32000,
      recencyWeight: 0.65,
      authorityWeight: 0.35,
      legalStatusBonus: 0.15,
      autoResolveThreshold: 0.85,
      strictnessMode: 'balanced',
      hashAlgorithm: 'SHA-256',
      enablePiiRedaction: true,
      redactCreditCards: true,
      redactSsn: true,
      redactApiKeys: true,
      tamperProofAuditLog: true,
      colorTheme: 'cyber-neon',
      scanlinesIntensity: 50,
      holographicGlow: 70,
      particlePhysicsCount: 60,
      cyberGridEnabled: true,
      motionReduced: false,
      audioFxEnabled: true,
      masterVolume: 0.4,
      soundOnQuery: true,
      soundOnConflict: true,
      backendUrl: '',
      useLiveBackend: false,
      activeModel: 'gemini-2.0-flash',
      apiKey: '',
      streamingSpeedMs: 15,
    };
    setLocalSettings(defaultSettings);
    onUpdateSettings(defaultSettings);
    playFuturisticSound('quantum-chime', true, 0.4);
  };

  const tabs = [
    { id: 'rag', label: 'Neural & RAG Engine', icon: Cpu },
    { id: 'conflict', label: 'Temporal Conflict Arbiter', icon: Scale },
    { id: 'security', label: 'Security & Provenance', icon: Shield },
    { id: 'visuals', label: 'Futuristic Visuals & Themes', icon: Palette },
    { id: 'audio', label: 'Audio FX Synthesizer', icon: Volume2 },
    { id: 'backend', label: 'Backend & Model Proxy', icon: Server },
  ] as const;

  return (
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/40 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-3 h-3" />
              Hyper-Granular Configuration Center
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Control & Minute Parameters
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="btn-cyber-primary px-5 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-4 h-4 text-emerald-950" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Tabs Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  playFuturisticSound('tab-switch', localSettings.audioFxEnabled, localSettings.masterVolume * 0.4);
                }}
                className={`p-4 rounded-xl text-left font-mono text-xs flex items-center gap-3 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-[0_0_20px_var(--theme-glow)]'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-600'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Body (8 cols) */}
        <div className="lg:col-span-8 cyber-card rounded-2xl p-6 sm:p-8 border border-[var(--theme-border)]">
          {/* TAB 1: Neural & RAG */}
          {activeTab === 'rag' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Vector Retrieval & Ingestion Hyper-Parameters
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Top-K Vector Candidates:</span>
                    <span className="text-[var(--theme-primary)] font-bold">{localSettings.topK} docs</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={localSettings.topK}
                    onChange={(e) => setLocalSettings({ ...localSettings, topK: parseInt(e.target.value) })}
                    className="w-full accent-[var(--theme-primary)]"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Number of chunk embeddings passed to reranker</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Minimum Cosine Similarity Threshold:</span>
                    <span className="text-[var(--theme-primary)] font-bold">{localSettings.minSimilarity}</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="0.95"
                    step="0.05"
                    value={localSettings.minSimilarity}
                    onChange={(e) => setLocalSettings({ ...localSettings, minSimilarity: parseFloat(e.target.value) })}
                    className="w-full accent-[var(--theme-primary)]"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Chunks below threshold are discarded before LLM synthesis</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Cross-Encoder Reranker Model</label>
                  <select
                    value={localSettings.rerankModel}
                    onChange={(e) => setLocalSettings({ ...localSettings, rerankModel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[var(--theme-primary)]"
                  >
                    <option value="nexa-cross-encoder-v2">NEXA Cross-Encoder v2 (Sub-10ms)</option>
                    <option value="bge-reranker-large">BGE Reranker Large (High Precision)</option>
                    <option value="cohere-rerank-3">Cohere Rerank 3 Multi-lingual</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Temporal Conflict Arbiter */}
          {activeTab === 'conflict' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Temporal Conflict Arbitration Rules
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Auto-Resolution Confidence Threshold:</span>
                    <span className="text-emerald-400 font-bold">{Math.round(localSettings.autoResolveThreshold * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="0.99"
                    step="0.01"
                    value={localSettings.autoResolveThreshold}
                    onChange={(e) => setLocalSettings({ ...localSettings, autoResolveThreshold: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-400"
                  />
                  <span className="text-[10px] text-slate-500 font-mono">Discrepancies exceeding this score are automatically superseded</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Arbitration Strictness Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['conservative', 'balanced', 'aggressive'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, strictnessMode: mode })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono uppercase transition-all cursor-pointer ${
                          localSettings.strictnessMode === mode
                            ? 'bg-white text-slate-950 font-bold'
                            : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Provenance */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Zero-Trust Redaction & Cryptographic Hash
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">Automatic PII Sanitization</span>
                    <span className="text-[10px] text-slate-500 font-mono">Redact sensitive tokens before passing to LLM context</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.enablePiiRedaction}
                    onChange={(e) => setLocalSettings({ ...localSettings, enablePiiRedaction: e.target.checked })}
                    className="w-4 h-4 accent-[var(--theme-primary)]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">Tamper-Proof Audit Provenance Ledger</span>
                    <span className="text-[10px] text-slate-500 font-mono">Record SHA-256 merkle root seals on every query response</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.tamperProofAuditLog}
                    onChange={(e) => setLocalSettings({ ...localSettings, tamperProofAuditLog: e.target.checked })}
                    className="w-4 h-4 accent-[var(--theme-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Provenance Hash Algorithm</label>
                  <select
                    value={localSettings.hashAlgorithm}
                    onChange={(e) => setLocalSettings({ ...localSettings, hashAlgorithm: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200"
                  >
                    <option value="SHA-256">SHA-256 (NIST Standard)</option>
                    <option value="BLAKE3">BLAKE3 (Ultra High Throughput)</option>
                    <option value="SHA-512">SHA-512 (High Entropy)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Visuals & Themes */}
          {activeTab === 'visuals' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Futuristic Visuals & Color Themes
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Color Theme Preset</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'cyber-neon', name: 'Cyber Neon', bg: 'bg-cyan-500' },
                      { id: 'quantum-violet', name: 'Quantum Violet', bg: 'bg-purple-500' },
                      { id: 'solar-plasma', name: 'Solar Plasma', bg: 'bg-amber-500' },
                      { id: 'matrix-emerald', name: 'Matrix Emerald', bg: 'bg-emerald-500' },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setLocalSettings({ ...localSettings, colorTheme: theme.id as ColorTheme });
                          document.documentElement.setAttribute('data-theme', theme.id);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          localSettings.colorTheme === theme.id
                            ? 'border-white bg-slate-800 shadow-[0_0_15px_var(--theme-glow)]'
                            : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full ${theme.bg} mx-auto mb-1.5 shadow-sm`} />
                        <span className="text-[11px] font-mono text-white block truncate">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Holographic Glow Intensity:</span>
                    <span className="text-[var(--theme-primary)] font-bold">{localSettings.holographicGlow}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={localSettings.holographicGlow}
                    onChange={(e) => setLocalSettings({ ...localSettings, holographicGlow: parseInt(e.target.value) })}
                    className="w-full accent-[var(--theme-primary)]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">Cyberpunk Coordinate Grid</span>
                    <span className="text-[10px] text-slate-500 font-mono">Render glowing matrix background lines</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.cyberGridEnabled}
                    onChange={(e) => setLocalSettings({ ...localSettings, cyberGridEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[var(--theme-primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Audio FX */}
          {activeTab === 'audio' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Futuristic Web Audio Synthesizer
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-white block">Sci-Fi UI Audio FX</span>
                    <span className="text-[10px] text-slate-500 font-mono">Synthesize harmonic chimes and pulse ticks</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.audioFxEnabled}
                    onChange={(e) => setLocalSettings({ ...localSettings, audioFxEnabled: e.target.checked })}
                    className="w-4 h-4 accent-[var(--theme-primary)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1.5">
                    <span className="text-slate-300">Master Volume:</span>
                    <span className="text-white font-bold">{Math.round(localSettings.masterVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={localSettings.masterVolume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setLocalSettings({ ...localSettings, masterVolume: v });
                      playFuturisticSound('click', true, v);
                    }}
                    className="w-full accent-[var(--theme-primary)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Backend Connection */}
          {activeTab === 'backend' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
                Backend Routing & API Proxy
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Custom Backend Proxy Endpoint URL</label>
                  <input
                    type="text"
                    placeholder="https://api.yourcompany.com or http://localhost:3000"
                    value={localSettings.backendUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, backendUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-[var(--theme-primary)]"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-1 block">Leave empty to use built-in ultra-fast simulated neural engine</span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-2">Active LLM Synthesis Engine</label>
                  <select
                    value={localSettings.activeModel}
                    onChange={(e) => setLocalSettings({ ...localSettings, activeModel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200"
                  >
                    <option value="gemini-2.0-flash">Google Gemini 2.0 Flash (Recommended / Sub-100ms)</option>
                    <option value="gemini-2.0-pro">Google Gemini 2.0 Pro (Deep Analytical Reasoning)</option>
                    <option value="nexa-local-quantum-14b">NEXA Quantum 14B (Isolated VPC Air-Gap)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
