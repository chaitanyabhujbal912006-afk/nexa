import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  CreditCard,
  Bell,
  Command,
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  ArrowRight,
  Zap,
  Radio,
  ExternalLink,
  ChevronRight,
  Download,
  Layers,
  X,
  Sliders,
  CheckCircle2,
  CheckCheck,
  AlertTriangle,
  FileCode,
  FileText,
  User,
  Monitor,
  Laptop,
  Smartphone,
  Glasses,
  Play,
  RotateCw,
} from 'lucide-react';
import { playTactileClick, playResolvedChime, playAlertWarble } from '../utils/audio';
import { SystemNotificationItem } from '../types';

interface NexaBentoOverviewProps {
  onNavigateTab: (tab: any) => void;
  userCompany?: string;
  userName?: string;
}

const INITIAL_NOTIFICATIONS: SystemNotificationItem[] = [
  {
    id: 'notif-1',
    sender: 'Hela Spine',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    actionText: 'Prepared automated SOC2 vector audit report',
    timeAgo: '2m ago',
    unread: true,
    type: 'security',
  },
  {
    id: 'notif-2',
    sender: 'Eva Solan',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    actionText: 'Invited you to sign-off on Refund Policy v2.1',
    timeAgo: '5m ago',
    unread: true,
    type: 'conflict',
  },
  {
    id: 'notif-3',
    sender: 'Pierre Ford',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    actionText: 'Synchronized 1,420 Notion wiki vectors',
    timeAgo: '15m ago',
    unread: true,
    type: 'document',
  },
  {
    id: 'notif-4',
    sender: 'Steve Aster',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    actionText: 'Rotated KMS cryptographic sovereign key',
    timeAgo: '1d ago',
    unread: false,
    type: 'system',
  },
];

const CODE_SNIPPETS = {
  typescript: `// Initialize NEXA Sovereign Knowledge Client
import { NexaEnterpriseClient } from '@nexa/intelligence-sdk';

const nexa = new NexaEnterpriseClient({
  vpcEnclaveId: 'vpc_live_starlight_4892',
  kmsKeyRotation: 'continuous-auto',
  strictArbitration: true,
});

// Grounded Query with Contradiction Radar
const response = await nexa.grounding.query({
  prompt: 'What are enterprise SLA refund thresholds?',
  confidenceThreshold: 0.95,
  resolveContradictions: 'precedence-override',
});

console.log(\`Verified Verdict: \${response.verdict}\`);
console.log(\`Citations: \${response.citations.join(', ')}\`);`,

  graphql: `query EnforcePolicyArbitration {
  nexaVpcCluster(id: "vpc-starlight-99") {
    activeVectorsCount
    clusterStatus
    arbitrationQueue(filter: CONTRADICTION_FLAGGED) {
      conflictId
      outdatedClause {
        documentName
        timestamp
        claimText
      }
      governingClause {
        documentName
        timestamp
        claimText
        enforceabilityScore
      }
      legalSignOff
    }
  }
}`,

  sql: `-- Vector similarity query with pgvector & strict policy filters
SELECT 
  doc_id,
  title,
  department,
  1 - (embedding <=> '[0.024,-0.081,0.412,...]') AS cosine_similarity,
  precedence_timestamp,
  arbitration_status
FROM enterprise_vectors
WHERE cluster_id = 'vpc_starlight_4892'
  AND is_superseded = FALSE
ORDER BY embedding <=> '[0.024,-0.081,0.412,...]'
LIMIT 5;`,

  policy: `{
  "$schema": "https://nexa.intelligence/schemas/policy-v1.json",
  "organization": "Acme Global Systems",
  "governance": {
    "autoPrecedence": true,
    "confidenceFloor": 0.95,
    "immutableAuditLog": "SHA-256",
    "enforceSovereignIsolation": true
  },
  "rules": [
    {
      "scope": "refunds_and_sla",
      "governingDocument": "refund_policy_v2.pdf",
      "overrides": ["Legacy_Sales_2022.pdf", "Marketing_Draft_2021.eml"]
    }
  ]
}`,
};

export const NexaBentoOverview: React.FC<NexaBentoOverviewProps> = ({
  onNavigateTab,
  userCompany = 'Acme Global Systems',
  userName = 'Elena Rostova',
}) => {
  // Code editor tab
  const [activeCodeTab, setActiveCodeTab] = useState<'typescript' | 'graphql' | 'sql' | 'policy'>('typescript');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isExecutingCode, setIsExecutingCode] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Confirmation Modal
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Device Matrix
  const [selectedDevice, setSelectedDevice] = useState('Vision Pro');

  // Export Toolbar
  const [pixelDensity, setPixelDensity] = useState('2x');
  const [exportFormat, setExportFormat] = useState('JSON');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Pricing Plan
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('annually');

  // Dismissed Testimonials
  const [dismissedTestimonials, setDismissedTestimonials] = useState<Record<string, boolean>>({});

  const handleCopyCode = () => {
    playTactileClick();
    navigator.clipboard.writeText(CODE_SNIPPETS[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunCode = () => {
    playTactileClick();
    setIsExecutingCode(true);
    setExecutionOutput(null);

    setTimeout(() => {
      setIsExecutingCode(false);
      playResolvedChime();
      setExecutionOutput(`✓ Verified: 42,800 vectors cross-referenced. Precedence override active. Latency: 140ms.`);
    }, 700);
  };

  const handleMarkAllRead = () => {
    playTactileClick();
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
    playResolvedChime();
  };

  const handleDismissNotification = (id: string) => {
    playTactileClick();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleExportDownload = () => {
    playTactileClick();
    setDownloadSuccess(true);
    playResolvedChime();
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div id="nexa-bento-overview" className="w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Ecosystem Headline inspired by reference */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full apple-glass-pill border border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            NEXA INTELLIGENCE ECOSYSTEM // VPC DASHBOARD
          </span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Enterprise Knowledge Engine.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e9d5ff] to-[#c084fc]">
            Real-time, Holographic, Sovereign.
          </span>
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#94a3b8] max-w-xl mx-auto leading-relaxed">
          Control single-tenant neural memory clusters, arbitrate conflicting policies with cryptographic precision, and stream grounded citations into any workspace.
        </p>
      </div>

      {/* ================= PRIMARY BENTO ROW 1: CODE EDITOR & SUPER WIDGETS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (7 cols): Interactive Code & Syntax Engine */}
        <div className="lg:col-span-7 apple-glass-card rounded-[28px] p-5 sm:p-7 border border-white/15 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          {/* Subtle backglow */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#7c3aed]/20 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#7c3aed]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc]">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">
                    Customize Everything
                  </h3>
                  <span className="font-mono text-[10px] text-[#94a3b8]">
                    SDK, Schemas, GraphQL & pgvector
                  </span>
                </div>
              </div>

              {/* Language Switcher Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                {[
                  { id: 'typescript', label: 'TypeScript' },
                  { id: 'graphql', label: 'GraphQL' },
                  { id: 'sql', label: 'pgvector SQL' },
                  { id: 'policy', label: 'Policy JSON' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playTactileClick();
                      setActiveCodeTab(tab.id as any);
                      setExecutionOutput(null);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      activeCodeTab === tab.id
                        ? 'bg-[#7c3aed] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block with line numbers */}
            <div className="relative mt-4 rounded-2xl bg-[#090616] border border-white/10 p-4 font-mono text-xs overflow-x-auto">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/10 text-[10px] text-[#94a3b8]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/60" />
                  <span className="ml-2 font-mono text-[10px] text-white/50">
                    nexa-grounding.{activeCodeTab === 'typescript' ? 'ts' : activeCodeTab === 'graphql' ? 'gql' : activeCodeTab === 'sql' ? 'sql' : 'json'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[10px] text-[#c084fc] hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <pre className="text-[#e2e8f0] leading-relaxed overflow-x-auto whitespace-pre font-mono text-[11px] select-text">
                {CODE_SNIPPETS[activeCodeTab]}
              </pre>
            </div>

            {/* Execution Output (if executed) */}
            {executionOutput && (
              <div className="mt-3 p-3 rounded-xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#4ade80] font-mono text-[11px] flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{executionOutput}</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="font-mono text-[10px] text-[#94a3b8]">
              LATENCY: <strong className="text-[#38bdf8]">140ms (P99)</strong> • ENCRYPTION: <strong className="text-white">AES-256 KMS</strong>
            </span>
            <button
              onClick={handleRunCode}
              disabled={isExecutingCode}
              className="btn-orbitsat-purple px-4 py-1.5 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExecutingCode ? (
                <>
                  <RotateCw className="w-3 h-3 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Run Grounding</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right (5 cols): Super Widgets & Holographic Smart Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-5">
          {/* Holographic Smart Card */}
          <div className="holographic-smart-card rounded-[28px] p-6 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[220px]">
            {/* Holographic sheen layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#e9d5ff] block">
                  NEXA SOVEREIGN PASS
                </span>
                <span className="font-display font-extrabold text-lg text-white">
                  {userCompany}
                </span>
              </div>
              <div className="w-10 h-7 rounded-md bg-gradient-to-r from-[#ffd700] to-[#ffae19] opacity-90 p-1 flex items-center justify-center shadow-md">
                <div className="w-full h-full border border-black/30 rounded-sm grid grid-cols-2 gap-0.5" />
              </div>
            </div>

            <div className="z-10 py-2">
              <span className="font-mono text-sm tracking-[0.2em] text-white/90 font-bold block">
                NX89 •••• •••• 4892
              </span>
              <div className="flex items-center gap-4 mt-2">
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#cbd5e1] block">
                    ACTIVE VECTORS
                  </span>
                  <span className="font-display text-lg font-extrabold text-white">
                    42,800
                  </span>
                </div>
                <div className="h-6 w-px bg-white/20" />
                <div>
                  <span className="font-mono text-[9px] uppercase text-[#cbd5e1] block">
                    CONFIDENCE FLOOR
                  </span>
                  <span className="font-display text-lg font-extrabold text-[#38bdf8]">
                    99.98%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end z-10 pt-2 border-t border-white/15">
              <div>
                <span className="font-mono text-[9px] text-white/70 block uppercase">
                  TENANT ARCHITECT
                </span>
                <span className="font-sans text-xs font-bold text-white">
                  {userName}
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#c084fc] bg-[#0d0a1c]/60 px-2.5 py-0.5 rounded-full border border-white/20">
                ACTIVE CLUSTER
              </span>
            </div>
          </div>

          {/* Super Widget: Vector Throughput & Metrics */}
          <div className="apple-glass-card rounded-[28px] p-5 border border-white/15 shadow-2xl flex flex-col justify-between gap-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#38bdf8]" />
                <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
                  Real-time Vector Throughput
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#4ade80] flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
                STREAMING
              </span>
            </div>

            {/* Visual multi-tone glowing bars */}
            <div className="grid grid-cols-6 gap-2 items-end h-16 pt-2">
              {[
                { height: '40%', color: 'from-[#7c3aed] to-[#c084fc]', val: '1.2k' },
                { height: '70%', color: 'from-[#38bdf8] to-[#60a5fa]', val: '2.8k' },
                { height: '55%', color: 'from-[#7c3aed] to-[#a855f7]', val: '1.9k' },
                { height: '95%', color: 'from-[#c084fc] to-[#f472b6]', val: '4.1k' },
                { height: '80%', color: 'from-[#38bdf8] to-[#34d399]', val: '3.4k' },
                { height: '65%', color: 'from-[#a855f7] to-[#818cf8]', val: '2.5k' },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    className={`w-full rounded-t-lg bg-gradient-to-t ${bar.color} opacity-90 transition-all duration-500 hover:opacity-100 shadow-[0_0_10px_rgba(168,85,247,0.3)]`}
                    style={{ height: bar.height }}
                  />
                  <span className="font-mono text-[8px] text-[#94a3b8]">{bar.val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[10px] text-[#94a3b8]">
              <span>Ingested Today: <strong className="text-white">15.9K Docs</strong></span>
              <button
                onClick={() => {
                  playTactileClick();
                  onNavigateTab('documents');
                }}
                className="text-[#c084fc] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Vault</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= BENTO ROW 2: KEYBOARD SHORTCUTS & NOTIFICATIONS & CONFIRMATION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Keyboard Shortcuts Widget (4 cols) */}
        <div className="md:col-span-4 apple-glass-card rounded-[28px] p-5 sm:p-6 border border-white/15 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Command className="w-4 h-4 text-[#c084fc]" />
              <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
                BOOST ARCHITECT SPEED
              </span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mb-3">
              Keyboard Shortcuts
            </h3>
            <p className="font-sans text-xs text-[#94a3b8] mb-4">
              Control neural vectors and dispute arbitration instantly with fast command keys.
            </p>

            <div className="space-y-2.5">
              {[
                { label: 'Neural Search Grounding', keys: ['⌘', 'K'], action: () => onNavigateTab('query-terminal') },
                { label: 'Ingest New Document', keys: ['⌘', 'I'], action: () => onNavigateTab('documents') },
                { label: 'Arbitrate Contradictions', keys: ['⌘', '⇧', 'A'], action: () => onNavigateTab('conflicts') },
                { label: 'Neural Graph Inspector', keys: ['⌘', 'G'], action: () => onNavigateTab('neural-graph') },
              ].map((sc, i) => (
                <div
                  key={i}
                  onClick={() => {
                    playTactileClick();
                    sc.action();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer group"
                >
                  <span className="font-sans text-xs text-[#e2e8f0] group-hover:text-white">
                    {sc.label}
                  </span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map((k) => (
                      <kbd
                        key={k}
                        className="keyboard-keycap px-2 py-0.5 rounded font-mono text-[10px] font-bold text-white"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <span className="font-mono text-[10px] text-[#94a3b8]">
              Press <kbd className="keyboard-keycap px-1.5 py-0.5 rounded text-white font-mono text-[9px]">?</kbd> for full shortcut map
            </span>
          </div>
        </div>

        {/* Live Notification Stream Widget (4 cols) */}
        <div className="md:col-span-4 apple-glass-card rounded-[28px] p-5 sm:p-6 border border-white/15 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#38bdf8]" />
                <h3 className="font-display text-base font-bold text-white">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="bg-[#7c3aed] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <button
                onClick={handleMarkAllRead}
                className="font-mono text-[10px] text-[#c084fc] hover:text-white cursor-pointer"
              >
                Mark all read
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2.5 ${
                    n.unread
                      ? 'bg-white/10 border-[#a855f7]/40 shadow-sm'
                      : 'bg-white/5 border-white/10 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={n.avatar}
                      alt={n.sender}
                      className="w-7 h-7 rounded-full object-cover border border-white/20 flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <strong className="font-sans text-xs text-white">
                          {n.sender}
                        </strong>
                        <span className="font-mono text-[9px] text-[#94a3b8]">
                          {n.timeAgo}
                        </span>
                      </div>
                      <p className="font-sans text-[11px] text-[#cbd5e1] leading-snug mt-0.5">
                        {n.actionText}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDismissNotification(n.id)}
                    className="text-[#94a3b8] hover:text-white p-1 rounded-md hover:bg-white/10 cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-[#94a3b8]">
            <span>Audit stream: <strong className="text-[#38bdf8]">Active</strong></span>
            <span className="text-[#4ade80]">Real-time Sync</span>
          </div>
        </div>

        {/* Interactive Confirmation & Device Enclave Widget (4 cols) */}
        <div className="md:col-span-4 flex flex-col justify-between gap-5">
          {/* Security Precedence Confirmation Modal Card */}
          <div className="apple-glass-card rounded-[28px] p-5 border border-white/15 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#c084fc]" />
                  <span className="font-display text-sm font-bold text-white">
                    Arbitration Sign-Off
                  </span>
                </div>
                <span className="font-mono text-[9px] bg-[#7c3aed]/20 text-[#c084fc] px-2 py-0.5 rounded-full border border-[#a855f7]/30">
                  LEGAL OVERRIDE
                </span>
              </div>

              <p className="font-sans text-xs text-[#cbd5e1] leading-relaxed mb-4">
                Are you sure you want to enforce <strong>Refund Policy v2.1</strong> over the conflicting 2022 terms? This action creates an immutable SHA-256 ledger record.
              </p>

              {isConfirmed ? (
                <div className="p-3 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2">
                  <CheckCheck className="w-4 h-4" />
                  <span>Precedence Override Cryptographically Sealed!</span>
                </div>
              ) : (
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      playTactileClick();
                      playAlertWarble();
                    }}
                    className="px-3.5 py-1.5 rounded-xl font-sans text-xs text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      playTactileClick();
                      setIsConfirmed(true);
                      playResolvedChime();
                    }}
                    className="btn-orbitsat-purple px-4 py-1.5 rounded-xl font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Authorize Override
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-[#94a3b8]">
              <span>KMS Signature: <strong>#e8a9...7f1</strong></span>
              <span className="text-[#38bdf8]">SOC2 Type II</span>
            </div>
          </div>

          {/* Device & Platform Ecosystem Selector */}
          <div className="apple-glass-card rounded-[28px] p-5 border border-white/15 shadow-2xl flex flex-col justify-between gap-3">
            <div className="flex justify-between items-center">
              <span className="font-display text-xs font-bold uppercase text-white tracking-wider">
                Platform Targets
              </span>
              <span className="font-mono text-[10px] text-[#38bdf8]">6 Connected</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Web Enclave', icon: Monitor },
                { name: 'Mac Client', icon: Laptop },
                { name: 'Vision Pro', icon: Glasses },
                { name: 'Slack Bot', icon: Radio },
                { name: 'Mobile App', icon: Smartphone },
                { name: 'GitHub Action', icon: Code2 },
              ].map((dev) => {
                const Icon = dev.icon;
                const isSel = selectedDevice === dev.name;
                return (
                  <button
                    key={dev.name}
                    onClick={() => {
                      playTactileClick();
                      setSelectedDevice(dev.name);
                    }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#7c3aed]/30 border-[#a855f7] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'bg-white/5 border-white/10 text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="font-mono text-[9px] truncate">{dev.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ================= BENTO ROW 3: EXPORT CONTROLS & TESTIMONIALS & PRICING ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Export & Pixel Density Toolbar (4 cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-4 h-4 text-[#c084fc]" />
              <h3 className="font-display text-base font-bold text-white">
                Export & Vector Density
              </h3>
            </div>
            <p className="font-sans text-xs text-[#94a3b8] mb-4">
              Download cryptographic embeddings, full discrepancy reports, and audit logs.
            </p>

            {/* Density Selector (1x, 2x, 3x, 4x) */}
            <div className="mb-4">
              <label className="font-mono text-[10px] uppercase text-[#cbd5e1] font-bold block mb-1.5">
                Vector Precision Density
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                {['1x (Standard)', '2x (Dense)', '3x (Hybrid)', '4x (Cross)'].map((density) => {
                  const dShort = density.split(' ')[0];
                  return (
                    <button
                      key={density}
                      onClick={() => {
                        playTactileClick();
                        setPixelDensity(dShort);
                      }}
                      className={`py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                        pixelDensity === dShort
                          ? 'bg-[#7c3aed] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                          : 'text-[#94a3b8] hover:text-white'
                      }`}
                    >
                      {dShort}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Format Selector */}
            <div className="mb-4">
              <label className="font-mono text-[10px] uppercase text-[#cbd5e1] font-bold block mb-1.5">
                Target Export Format
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
                {['JSON', 'CSV', 'PDF', 'Vector'].map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => {
                      playTactileClick();
                      setExportFormat(fmt);
                    }}
                    className={`py-1.5 rounded-lg font-mono text-[10px] font-bold transition-all cursor-pointer ${
                      exportFormat === fmt
                        ? 'bg-[#38bdf8] text-[#090616] font-bold shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {downloadSuccess && (
              <div className="mb-3 p-2.5 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 text-[#4ade80] font-mono text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payload Generated & Exported ({pixelDensity} {exportFormat})</span>
              </div>
            )}
          </div>

          <button
            onClick={handleExportDownload}
            className="w-full py-3 rounded-full btn-orbitsat-purple font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {exportFormat} Bundle ({pixelDensity})</span>
          </button>
        </div>

        {/* Enterprise Testimonials / Verified Reviews (4 cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-[28px] p-6 border border-white/15 shadow-2xl flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
                PEER ARCHITECT REVIEWS
              </span>
              <span className="text-[#38bdf8] font-mono text-[10px] font-bold">5.0 ★★★★★</span>
            </div>
            <h3 className="font-display text-base font-bold text-white mb-3">
              Trusted by Leading AI Teams
            </h3>

            <div className="space-y-3">
              {[
                {
                  id: 'rev-1',
                  author: 'Brendan Ciccone',
                  role: 'VP Security @ Square',
                  quote: 'NEXA resolved 18 conflicting SLA amendments within 15 minutes of VPC clustering. Absolute game-changer.',
                },
                {
                  id: 'rev-2',
                  author: 'Elena Rostova',
                  role: 'Chief Architect @ Acme',
                  quote: 'The automated arbitration engine is the cleanest implementation of cryptographic grounding I have deployed.',
                },
              ].map((rev) => {
                if (dismissedTestimonials[rev.id]) return null;
                return (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 relative text-xs leading-relaxed"
                  >
                    <button
                      onClick={() => {
                        playTactileClick();
                        setDismissedTestimonials({ ...dismissedTestimonials, [rev.id]: true });
                      }}
                      className="absolute top-2.5 right-2.5 text-[#94a3b8] hover:text-white p-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <p className="font-sans text-[#cbd5e1] italic mb-2 pr-4">
                      "{rev.quote}"
                    </p>
                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <strong className="text-white">{rev.author}</strong>
                      <span className="text-[#94a3b8]">• {rev.role}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center font-mono text-[10px] text-[#94a3b8]">
            <span>Audited & Certified</span>
            <span className="text-[#c084fc]">Zero-Knowledge Index</span>
          </div>
        </div>

        {/* Dedicated Plan & Capacity Tiers (4 cols) */}
        <div className="lg:col-span-4 apple-glass-card rounded-[28px] p-6 border border-[#a855f7]/50 shadow-2xl flex flex-col justify-between gap-4 relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/20 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider">
                CURRENT VPC TIER
              </span>
              <span className="bg-[#7c3aed] text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                POPULAR
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-display text-4xl font-extrabold text-white">
                $120
              </span>
              <span className="font-mono text-xs text-[#94a3b8]">
                / per year, billed yearly
              </span>
            </div>

            <div className="space-y-2 mb-4 text-xs font-sans">
              {[
                'Single-tenant dedicated VPC Enclave',
                'Unlimited neural vector embeddings',
                'Continuous automated KMS key rotation',
                'Real-time SLA conflict discrepancy radar',
                '24/7 Priority Architecture Support',
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-[#cbd5e1]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#c084fc] flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onNavigateTab('settings');
            }}
            className="w-full py-3 rounded-full btn-orbitsat-purple font-sans text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Manage Cluster Tier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
