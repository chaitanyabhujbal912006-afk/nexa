import React, { useState } from 'react';
import { 
  User, Key, Sliders, CreditCard, Shield, Bell, Settings, CheckCircle2, AlertTriangle, 
  RefreshCw, Trash2, Globe, Clock, Lock, Server, Cpu, Database, Save, Eye, EyeOff, Plus, 
  ExternalLink, Zap, Laptop, Smartphone, AlertCircle
} from 'lucide-react';
import { SettingsSubTab, UserSession, RagEngineSettings, ApiKeyItem, SessionDevice } from '../types';
import { DEFAULT_RAG_SETTINGS } from '../data/mockKnowledge';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface SettingsCenterProps {
  userSession: UserSession;
  onUpdateSession: (updated: Partial<UserSession>) => void;
  defaultSubTab?: SettingsSubTab;
}

export const SettingsCenter: React.FC<SettingsCenterProps> = ({
  userSession,
  onUpdateSession,
  defaultSubTab = 'profile'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>(defaultSubTab);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Submodule 1: Profile State
  const [displayName, setDisplayName] = useState(userSession.fullName || 'Elena Rostova');
  const [companyName, setCompanyName] = useState(userSession.company || 'Starlight AI');
  const [role, setRole] = useState(userSession.role || 'Lead Knowledge Architect');
  const [timezone, setTimezone] = useState(userSession.timezone || 'UTC-08:00 (Pacific Time)');
  const [language, setLanguage] = useState(userSession.language || 'English (US)');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Submodule 2: API & Connection State
  const [backendUrl, setBackendUrl] = useState('https://api.nexa-neural.internal/v1');
  const [useLiveBackend, setUseLiveBackend] = useState(true);
  const [activeProvider, setActiveProvider] = useState<'groq'>('groq');
  const [geminiKeyMasked, setGeminiKeyMasked] = useState('AIzaSyD-••••••••••••••••••••••••');
  const [groqKeyMasked, setGroqKeyMasked] = useState('gsk_••••••••••••••••••••••••••••');
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showGroqKey, setShowGroqKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{ status: 'ok' | 'error'; latency: number } | null>(null);

  // Submodule 3: RAG Engine State
  const [ragSettings, setRagSettings] = useState<RagEngineSettings>(DEFAULT_RAG_SETTINGS);
  const [ragWeightError, setRagWeightError] = useState<string | null>(null);

  // Submodule 4: Membership State
  const [activePlan, setActivePlan] = useState<'Free' | 'Professional' | 'Enterprise'>(userSession.selectedPlan || 'Professional');

  // Submodule 5: Security State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: 'key-1', name: 'Starlight CLI Ingest', keyMasked: 'nexa_live_••••••••••••••••', keyPrefix: 'nexa_live_9a82', createdDate: '2026-07-15', lastUsed: '2 hours ago', permissions: 'admin', status: 'active' },
    { id: 'key-2', name: 'Slack Bot Webhook', keyMasked: 'nexa_live_••••••••••••••••', keyPrefix: 'nexa_live_4b71', createdDate: '2026-08-01', lastUsed: '10 mins ago', permissions: 'read-write', status: 'active' },
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SessionDevice[]>([
    { id: 'sess-1', device: 'MacBook Pro 16"', browser: 'Chrome 128.0', ipAddress: '192.168.1.42', location: 'San Francisco, US', lastActive: 'Active Now', isCurrent: true },
    { id: 'sess-2', device: 'iPhone 15 Pro', browser: 'Safari Mobile', ipAddress: '172.56.21.9', location: 'San Jose, US', lastActive: 'Yesterday at 21:14', isCurrent: false },
  ]);

  // Submodule 6: Notifications State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [conflictAlerts, setConflictAlerts] = useState(true);
  const [usageLimitWarnings, setUsageLimitWarnings] = useState(true);
  const [productUpdates, setProductUpdates] = useState(false);

  // Submodule 7: Preferences State
  const [motionReduced, setMotionReduced] = useState(false);
  const [streamingSpeed, setStreamingSpeed] = useState(15);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleSaveAll = () => {
    playTactileClick();

    // Validate RAG weights
    if (ragSettings.recency_weight + ragSettings.authority_weight > 1.0) {
      setRagWeightError('Sum of Recency Weight + Authority Weight must be <= 1.0');
      return;
    }
    setRagWeightError(null);

    onUpdateSession({
      fullName: displayName,
      company: companyName,
      role: role,
      timezone: timezone,
      language: language,
      selectedPlan: activePlan,
    });

    setSavedSuccess(true);
    playResolvedChime();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestConnection = () => {
    playTactileClick();
    setIsTestingConnection(true);
    setConnectionTestResult(null);

    setTimeout(() => {
      setIsTestingConnection(false);
      setConnectionTestResult({ status: 'ok', latency: Math.floor(Math.random() * 40) + 75 });
      playResolvedChime();
    }, 1200);
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    playTactileClick();
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      keyMasked: 'nexa_live_••••••••••••••••',
      keyPrefix: `nexa_live_${Math.random().toString(36).substring(2, 6)}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      permissions: 'read-write',
      status: 'active'
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowCreateKeyModal(false);
    playResolvedChime();
  };

  const handleRevokeKey = (id: string) => {
    playTactileClick();
    setApiKeys(apiKeys.map(k => k.id === id ? { ...k, status: 'revoked' } : k));
  };

  const handleRevokeSession = (id: string) => {
    playTactileClick();
    setActiveSessions(activeSessions.filter(s => s.id !== id));
  };

  const handleRevokeAllOtherSessions = () => {
    playTactileClick();
    setActiveSessions(activeSessions.filter(s => s.isCurrent));
    playResolvedChime();
  };

  const handleClearCache = () => {
    playTactileClick();
    localStorage.clear();
    setCacheCleared(true);
    playResolvedChime();
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const subTabs = [
    { id: 'profile' as SettingsSubTab, label: 'Profile & Team', icon: User },
    { id: 'api' as SettingsSubTab, label: 'API & Backends', icon: Key },
    { id: 'rag' as SettingsSubTab, label: 'RAG Engine Tuning', icon: Sliders },
    { id: 'membership' as SettingsSubTab, label: 'Plans & Entitlements', icon: CreditCard },
    { id: 'security' as SettingsSubTab, label: 'Security & Access', icon: Shield },
    { id: 'notifications' as SettingsSubTab, label: 'Alerts & Digest', icon: Bell },
    { id: 'preferences' as SettingsSubTab, label: 'System Preferences', icon: Settings },
  ];

  return (
    <div id="nexa-settings-center" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 apple-glass-card p-6 rounded-[28px] border border-white/15 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-4 h-4 text-[#c084fc]" />
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
              SETTINGS & GOVERNANCE CENTER
            </span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white">
            System & Workspace Configuration
          </h2>
          <p className="font-sans text-xs text-[#94a3b8] mt-1">
            Manage profile settings, RAG hyperparameters, API routing keys, enterprise membership, and active credentials.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="btn-orbitsat-purple px-6 py-2.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Workspace configuration successfully applied and synced across nodes!</span>
        </div>
      )}

      {/* Sub-tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-[#090616]/90 border border-white/10 backdrop-blur-md">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playTactileClick();
                setActiveSubTab(tab.id);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-sans font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#7c3aed] text-white shadow-lg font-bold'
                  : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Submodule View Containers */}
      <div className="apple-glass-card rounded-[28px] p-6 sm:p-8 border border-white/15 shadow-2xl text-white">
        {/* Submodule 1: Profile & Identity */}
        {activeSubTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">Organization & User Profile</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Update team account credentials and operational localization.</p>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Email Verified</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userSession.email || 'elena.rostova@starlight.vpc'}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[#94a3b8] font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">Company / Workspace</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">Enterprise Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#090616] border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="Lead Knowledge Architect">Lead Knowledge Architect</option>
                  <option value="Compliance Officer">Compliance Officer</option>
                  <option value="Legal Operations Director">Legal Operations Director</option>
                  <option value="Enterprise Administrator">Enterprise Administrator</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider block">System Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#090616] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                  <option value="UTC-05:00 (Eastern Time)">UTC-05:00 (Eastern Time)</option>
                  <option value="UTC+00:00 (London, GMT)">UTC+00:00 (London, GMT)</option>
                  <option value="UTC+01:00 (Central European)">UTC+01:00 (Central European)</option>
                  <option value="UTC+09:00 (Tokyo, JST)">UTC+09:00 (Tokyo, JST)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider block">Interface Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#090616] border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Deutsch">Deutsch</option>
                  <option value="Français">Français</option>
                  <option value="日本語">日本語</option>
                </select>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 border-t border-red-500/20 space-y-3">
              <span className="font-mono text-[10px] uppercase font-bold text-red-400 tracking-wider block">
                DANGER ZONE
              </span>
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-red-200">Delete Workspace & Purge Vector Index</h4>
                  <p className="font-sans text-xs text-red-300/80 mt-0.5">Permanently deletes all indexed embeddings, audit logs, and conflict matrices. Irreversible.</p>
                </div>
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="px-4 py-2 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap"
                >
                  Delete Account
                </button>
              </div>

              {showDeleteDialog && (
                <div className="p-4 rounded-2xl bg-[#090616] border border-red-500/40 space-y-3">
                  <p className="font-mono text-xs text-red-300">
                    To confirm destruction, please type <strong className="text-white">DELETE</strong> below:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-red-500/30 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={deleteConfirmText !== 'DELETE'}
                      onClick={() => alert('Account purge initiated in compliance with GDPR right-to-be-forgotten standard.')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer"
                    >
                      Confirm Permanent Deletion
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteDialog(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-[#94a3b8] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Submodule 2: API & Connection Backends */}
        {activeSubTab === 'api' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">API Routing & LLM Provider Backends</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Configure server endpoints, model providers, and live health test pings.</p>
              </div>
              <button
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="btn-orbitsat-purple px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTestingConnection ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Test Live Connection</span>
              </button>
            </div>

            {connectionTestResult && (
              <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center justify-between animate-in fade-in">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Backend cluster responded successfully (Status 200 OK)</span>
                </span>
                <strong className="text-white">{connectionTestResult.latency}ms roundtrip</strong>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">Backend Endpoint URL</label>
                  <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-[#38bdf8]">
                    <input
                      type="checkbox"
                      checked={useLiveBackend}
                      onChange={(e) => setUseLiveBackend(e.target.checked)}
                      className="rounded accent-[#a855f7]"
                    />
                    <span>Use Live Backend</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">Active LLM Provider Selection</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      playTactileClick();
                      setActiveProvider('gemini');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'gemini'
                        ? 'bg-[#7c3aed]/20 border-[#a855f7]/60 text-white'
                        : 'bg-white/5 border-white/10 text-[#94a3b8]'
                    }`}
                  >
                    <strong className="block text-white font-display text-sm">Google Gemini 2.5 Flash</strong>
                    <span className="font-mono text-[10px] text-[#38bdf8]">Server-Side Secured // Top Accuracy</span>
                  </button>

                  <button
                    onClick={() => {
                      playTactileClick();
                      setActiveProvider('groq');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeProvider === 'groq'
                        ? 'bg-[#7c3aed]/20 border-[#a855f7]/60 text-white'
                        : 'bg-white/5 border-white/10 text-[#94a3b8]'
                    }`}
                  >
                    <strong className="block text-white font-display text-sm">Groq LLaMA 3.3 (70B)</strong>
                    <span className="font-mono text-[10px] text-[#c084fc]">Ultra-Low Latency (~90ms)</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider block">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiKeyMasked}
                      onChange={(e) => setGeminiKeyMasked(e.target.value)}
                      className="w-full px-4 py-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-white cursor-pointer"
                    >
                      {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase font-bold text-[#cbd5e1] tracking-wider block">Groq API Key</label>
                  <div className="relative">
                    <input
                      type={showGroqKey ? 'text' : 'password'}
                      value={groqKeyMasked}
                      onChange={(e) => setGroqKeyMasked(e.target.value)}
                      className="w-full px-4 py-2 pr-10 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-[#a855f7]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGroqKey(!showGroqKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-white cursor-pointer"
                    >
                      {showGroqKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submodule 3: RAG Engine Tuning */}
        {activeSubTab === 'rag' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">Neural RAG Hyperparameters</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Tune vector top-k retrieval, context window sizing, and temporal arbitration weights.</p>
              </div>
              <button
                onClick={() => {
                  playTactileClick();
                  setRagSettings(DEFAULT_RAG_SETTINGS);
                  setRagWeightError(null);
                  playResolvedChime();
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#94a3b8] hover:text-white transition-all cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>

            {ragWeightError && (
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs flex items-center gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>{ragWeightError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#c084fc] font-bold">Top-K Chunks: {ragSettings.top_k}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={ragSettings.top_k}
                  onChange={(e) => setRagSettings({ ...ragSettings, top_k: parseInt(e.target.value) })}
                  className="w-full accent-[#a855f7] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Number of semantic chunks fetched per neural pass.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#38bdf8] font-bold">Min Similarity: {(ragSettings.min_similarity * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.01"
                  value={ragSettings.min_similarity}
                  onChange={(e) => setRagSettings({ ...ragSettings, min_similarity: parseFloat(e.target.value) })}
                  className="w-full accent-[#38bdf8] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Cosine distance cutoff to suppress hallucinated noisy chunks.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#4ade80] font-bold">Chunk Overlap: {ragSettings.chunk_overlap_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={ragSettings.chunk_overlap_pct}
                  onChange={(e) => setRagSettings({ ...ragSettings, chunk_overlap_pct: parseInt(e.target.value) })}
                  className="w-full accent-[#4ade80] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Sliding window overlap preventing boundary context cuts.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#c084fc] font-bold">Recency Weight: {ragSettings.recency_weight}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={ragSettings.recency_weight}
                  onChange={(e) => setRagSettings({ ...ragSettings, recency_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#a855f7] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Higher values favor newly dated contracts during arbitration.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#38bdf8] font-bold">Authority Weight: {ragSettings.authority_weight}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.05"
                  value={ragSettings.authority_weight}
                  onChange={(e) => setRagSettings({ ...ragSettings, authority_weight: parseFloat(e.target.value) })}
                  className="w-full accent-[#38bdf8] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Favors Master Service Agreements over generic employee handbooks.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#4ade80] font-bold">Auto-Resolve: {(ragSettings.auto_resolve_threshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="0.99"
                  step="0.01"
                  value={ragSettings.auto_resolve_threshold}
                  onChange={(e) => setRagSettings({ ...ragSettings, auto_resolve_threshold: parseFloat(e.target.value) })}
                  className="w-full accent-[#4ade80] cursor-pointer"
                />
                <span className="text-[10px] font-sans text-[#94a3b8] block">Threshold for automatic conflict resolution without manual signoff.</span>
              </div>
            </div>
          </div>
        )}

        {/* Submodule 4: Membership Plans & Entitlements */}
        {activeSubTab === 'membership' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">Enterprise Plans & Quota Entitlements</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Review resource utilization and upgrade plan capacities.</p>
              </div>
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#7c3aed]/30 text-[#c084fc] border border-[#a855f7]/40">
                Current Plan: {activePlan}
              </span>
            </div>

            {/* 3 Live Usage Trackers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#94a3b8]">DOCUMENTS INDEXED</span>
                  <strong className="text-white">8 / 250 Docs</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: '3.2%' }} />
                </div>
                <span className="text-[10px] font-mono text-[#38bdf8] block">242 slots available</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#94a3b8]">MONTHLY QUERY QUOTA</span>
                  <strong className="text-white">1,420 / 50,000</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#c084fc] rounded-full" style={{ width: '2.84%' }} />
                </div>
                <span className="text-[10px] font-mono text-[#c084fc] block">Resets in 12 days</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#94a3b8]">STORAGE CAPACITY</span>
                  <strong className="text-white">32.4 MB / 10 GB</strong>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#4ade80] rounded-full" style={{ width: '0.32%' }} />
                </div>
                <span className="text-[10px] font-mono text-[#4ade80] block">Encrypted cold storage</span>
              </div>
            </div>

            {/* Plans Tier Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { name: 'Personal Free', price: '$0', desc: 'For researchers and independent operators.', features: ['Up to 10 Documents', '1,000 Queries / month', 'Shared Community Index', 'Standard Support'] },
                { name: 'Professional', price: '$29/mo', desc: 'For growing teams requiring fast contradiction resolution.', features: ['Up to 250 Documents', '50,000 Queries / month', 'Single-Tenant ChromaDB', 'Temporal Conflict Matrix', 'Priority SLA'] },
                { name: 'Enterprise', price: 'Custom', desc: 'For regulated institutions with SOC 2 compliance mandates.', features: ['Unlimited Documents & Vector Nodes', 'Uncapped Query Engine', 'Dedicated Private KMS HSM', 'Sovereign VPC Deployments', '24/7 Dedicated Architect'] },
              ].map((tier, idx) => {
                const isSelected = activePlan === tier.name.split(' ')[0];
                return (
                  <div
                    key={idx}
                    className={`p-6 rounded-[24px] border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#7c3aed]/20 border-[#a855f7] shadow-xl'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-display font-bold text-base text-white">{tier.name}</h4>
                        {isSelected && (
                          <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="font-display text-2xl font-bold text-white">{tier.price}</div>
                      <p className="font-sans text-xs text-[#94a3b8]">{tier.desc}</p>
                      <ul className="space-y-1.5 font-sans text-xs text-[#cbd5e1] pt-2 border-t border-white/10">
                        {tier.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#4ade80] flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        playTactileClick();
                        setActivePlan(tier.name.split(' ')[0] as any);
                        playResolvedChime();
                      }}
                      className={`w-full mt-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 text-white cursor-default'
                          : 'btn-orbitsat-purple'
                      }`}
                    >
                      {isSelected ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submodule 5: Security & Access Credentials */}
        {activeSubTab === 'security' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">Security, API Keys & Active Sessions</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Manage developer access tokens and monitor active login sessions.</p>
              </div>
              <button
                onClick={() => setShowCreateKeyModal(true)}
                className="btn-orbitsat-purple px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Generate API Key</span>
              </button>
            </div>

            {/* Create Key Dialog */}
            {showCreateKeyModal && (
              <div className="p-4 rounded-2xl bg-[#090616] border border-[#a855f7]/40 space-y-3 animate-in fade-in">
                <h4 className="font-display text-sm font-bold text-white">Create New Access Key</h4>
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] uppercase text-[#94a3b8] block">Key Identifier Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Pipeline Ingest"
                    className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white font-sans text-xs focus:outline-none focus:border-[#a855f7]"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateApiKey}
                    className="btn-orbitsat-purple px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Generate Key
                  </button>
                  <button
                    onClick={() => setShowCreateKeyModal(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 text-[#94a3b8] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* API Access Tokens Table */}
            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
                ACTIVE DEVELOPER ACCESS TOKENS ({apiKeys.length})
              </span>
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
                  >
                    <div>
                      <strong className="text-white block font-sans">{key.name}</strong>
                      <span className="text-[#94a3b8] text-[10px]">
                        Prefix: <code className="text-[#38bdf8]">{key.keyPrefix}</code> • Created: {key.createdDate} • Last Used: {key.lastUsed}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        key.status === 'active' ? 'bg-[#22c55e]/20 text-[#4ade80]' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {key.status}
                      </span>
                      {key.status === 'active' && (
                        <button
                          onClick={() => handleRevokeKey(key.id)}
                          className="text-red-400 hover:text-red-300 text-[11px] font-bold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">
                  ACTIVE AUTHENTICATED SESSIONS ({activeSessions.length})
                </span>
                <button
                  onClick={handleRevokeAllOtherSessions}
                  className="text-[#c084fc] hover:text-white font-mono text-[10px] font-bold cursor-pointer"
                >
                  Revoke All Other Sessions
                </button>
              </div>

              <div className="space-y-2">
                {activeSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {sess.device.includes('MacBook') ? <Laptop className="w-4 h-4 text-[#c084fc]" /> : <Smartphone className="w-4 h-4 text-[#38bdf8]" />}
                      <div>
                        <strong className="text-white block font-sans">{sess.device} — {sess.browser}</strong>
                        <span className="text-[#94a3b8] text-[10px]">{sess.ipAddress} • {sess.location} • {sess.lastActive}</span>
                      </div>
                    </div>

                    {sess.isCurrent ? (
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-[#22c55e]/20 text-[#4ade80] font-bold">
                        Current Session
                      </span>
                    ) : (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-red-400 hover:text-red-300 text-[11px] font-bold cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submodule 6: Notifications & Alerts */}
        {activeSubTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">Notification & Intelligence Alerts</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Configure proactive alerts for temporal policy contradictions and quota boundaries.</p>
              </div>
            </div>

            <div className="space-y-3 font-sans text-xs">
              {[
                { title: 'Contradiction & Conflict Alerts', desc: 'Receive instant alerts when conflicting policies are uploaded to knowledge vaults.', state: conflictAlerts, setter: setConflictAlerts },
                { title: 'Weekly Intelligence Digest', desc: 'Weekly summary of top queried terms, high-confidence resolutions, and stale document deprecation candidates.', state: weeklyDigest, setter: setWeeklyDigest },
                { title: 'Usage Quota Warnings', desc: 'Alert admins when monthly query quotas reach 80% and 95% capacity.', state: usageLimitWarnings, setter: setUsageLimitWarnings },
                { title: 'Product & Engine Updates', desc: 'Announcements of newly supported embedding models and tokenizer optimizers.', state: productUpdates, setter: setProductUpdates },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4"
                >
                  <div>
                    <strong className="text-white block font-semibold">{item.title}</strong>
                    <p className="text-[#94a3b8] text-[11px] mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => {
                        playTactileClick();
                        item.setter(e.target.checked);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]" />
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submodule 7: System Preferences */}
        {activeSubTab === 'preferences' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="font-display text-lg font-bold">System Display & Performance Preferences</h3>
                <p className="font-sans text-xs text-[#94a3b8]">Customize typing streaming latency, reduced motion, and client-side cache persistence.</p>
              </div>
            </div>

            {cacheCleared && (
              <div className="p-3 rounded-2xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Client local storage and transient node caches cleared successfully.</span>
              </div>
            )}

            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-[#c084fc] font-bold">Typing Streaming Cadence: {streamingSpeed}ms / token</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={streamingSpeed}
                  onChange={(e) => setStreamingSpeed(parseInt(e.target.value))}
                  className="w-full accent-[#a855f7] cursor-pointer"
                />
                <span className="text-[10px] text-[#94a3b8] block">Control artificial neural token streaming cadence in Query Studio.</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <strong className="text-white block font-semibold">Reduced Motion Mode</strong>
                  <p className="text-[#94a3b8] text-[11px] mt-0.5">Disable cosmic backdrop starfield pulsing and particle physics.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={motionReduced}
                    onChange={(e) => {
                      playTactileClick();
                      setMotionReduced(e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]" />
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div>
                  <strong className="text-white block font-semibold">Auto-Save Query History</strong>
                  <p className="text-[#94a3b8] text-[11px] mt-0.5">Persist recent neural prompt interactions to browser session storage.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={autoSaveHistory}
                    onChange={(e) => {
                      playTactileClick();
                      setAutoSaveHistory(e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7c3aed]" />
                </label>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleClearCache}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-mono text-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                  <span>Clear Client Local Storage & Cache</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
