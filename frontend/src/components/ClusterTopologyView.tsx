import React, { useState, useEffect } from 'react';
import {
  Server,
  Activity,
  Globe,
  Cpu,
  Database,
  Shield,
  Zap,
  RefreshCw,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { NexaSystemSettings } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface ClusterTopologyViewProps {
  settings: NexaSystemSettings;
}

interface ClusterNode {
  id: string;
  name: string;
  region: string;
  status: 'optimal' | 'syncing' | 'stress-tested';
  latencyMs: number;
  vectors: number;
  loadPercent: number;
}

export const ClusterTopologyView: React.FC<ClusterTopologyViewProps> = ({ settings }) => {
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: 'node-1', name: 'US-EAST-ALPHA (VPC-01)', region: 'us-east-1 (N. Virginia)', status: 'optimal', latencyMs: 14, vectors: 4829100, loadPercent: 32 },
    { id: 'node-2', name: 'EU-CENTRAL-BETA (VPC-02)', region: 'eu-central-1 (Frankfurt)', status: 'optimal', latencyMs: 22, vectors: 3912000, loadPercent: 41 },
    { id: 'node-3', name: 'AP-EAST-GAMMA (VPC-03)', region: 'ap-east-1 (Tokyo)', status: 'optimal', latencyMs: 29, vectors: 2840000, loadPercent: 28 },
    { id: 'node-4', name: 'SA-EAST-DELTA (VPC-04)', region: 'sa-east-1 (São Paulo)', status: 'optimal', latencyMs: 38, vectors: 1890000, loadPercent: 19 },
  ]);

  const [isStressTesting, setIsStressTesting] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([
    '[07:46:12] HNSW index sync completed across 4 VPC regions',
    '[07:46:15] SHA-256 tamper seal verified for block #892104',
    '[07:46:18] PII sanitizer filtered 3 API tokens in streaming ingress',
    '[07:46:22] Cluster throughput stable at 432.8 queries/sec',
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          loadPercent: Math.min(95, Math.max(15, n.loadPercent + Math.floor(Math.random() * 5 - 2))),
          latencyMs: Math.max(10, n.latencyMs + Math.floor(Math.random() * 3 - 1)),
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerStressTest = () => {
    setIsStressTesting(true);
    playFuturisticSound('laser-ping', settings.audioFxEnabled, settings.masterVolume);
    setLiveLogs((prev) => [
      `[${new Date().toLocaleTimeString()}] STRESS TEST INITIATED: Simulating 10,000 concurrent vector queries...`,
      ...prev,
    ]);

    setTimeout(() => {
      setIsStressTesting(false);
      playFuturisticSound('resolve-success', settings.audioFxEnabled, settings.masterVolume);
      setLiveLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] STRESS TEST PASSED: Zero packet drop, failover rerouted in 8ms`,
        ...prev,
      ]);
    }, 1800);
  };

  const totalVectors = nodes.reduce((acc, curr) => acc + curr.vectors, 0);

  return (
    <div className="w-full flex flex-col gap-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/40 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Global Cluster Topology & Live Telemetry
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            VPC Node Telemetry & Mesh Status
          </h2>
        </div>

        <button
          onClick={handleTriggerStressTest}
          disabled={isStressTesting}
          className="btn-cyber-primary px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Flame className="w-4 h-4 text-amber-950 fill-current" />
          <span>{isStressTesting ? 'Executing Stress Load...' : 'Simulate 10k QPS Stress'}</span>
        </button>
      </div>

      {/* Global Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Vectors</span>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {(totalVectors / 1000000).toFixed(2)}M
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">1536-dim HNSW</span>
        </div>

        <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Latency</span>
          <div className="text-2xl font-mono font-bold text-[var(--theme-primary)] mt-1">
            {isStressTesting ? '38ms' : '18ms'}
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">P95 Sub-second SLA</span>
        </div>

        <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Mesh Health</span>
          <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
            99.994%
          </div>
          <span className="text-[10px] font-mono text-emerald-400 mt-1 block">4/4 Nodes Optimal</span>
        </div>

        <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Zero-Trust Redaction</span>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            100% Active
          </div>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block">In-flight PII Masking</span>
        </div>
      </div>

      {/* Cluster Nodes Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-[var(--theme-primary)]" />
                <span className="text-sm font-bold text-white font-mono">{node.name}</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                {node.status.toUpperCase()}
              </span>
            </div>

            <div className="text-xs font-mono text-slate-400">
              Region: <span className="text-slate-200">{node.region}</span>
            </div>

            {/* Load bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1 text-slate-400">
                <span>Cluster Load</span>
                <span className="text-white font-bold">{node.loadPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-secondary)] transition-all duration-500"
                  style={{ width: `${node.loadPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800 text-slate-400">
              <div>
                <span className="text-[9px] text-slate-500 block">VECTOR COUNT</span>
                <span className="text-white font-bold">{(node.vectors / 1000000).toFixed(2)}M docs</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block">INTERNAL LATENCY</span>
                <span className="text-[var(--theme-primary)] font-bold">{node.latencyMs}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Cluster Logs Console */}
      <div className="cyber-card rounded-2xl p-5 border border-[var(--theme-border)]">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--theme-primary)]" />
            Live Cluster Audit Stream
          </span>
          <span className="text-[10px] font-mono text-emerald-400">Streaming Active</span>
        </div>
        <div className="bg-slate-950/90 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-1.5 max-h-44 overflow-y-auto">
          {liveLogs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-slate-500 mr-2">&gt;</span>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
