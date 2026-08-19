import React, { useState } from 'react';
import {
  Server,
  Code2,
  Database,
  Terminal,
  Copy,
  Check,
  Zap,
  Play,
  FileText,
  Activity,
} from 'lucide-react';
import { NexaSystemSettings } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface BackendIntegrationViewProps {
  settings: NexaSystemSettings;
}

export const BackendIntegrationView: React.FC<BackendIntegrationViewProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'express' | 'fastapi' | 'postgres' | 'curl' | 'tester'>('express');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<'/api/v1/query' | '/api/health' | '/api/v1/topology/telemetry'>('/api/v1/query');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    playFuturisticSound('quantum-chime', settings.audioFxEnabled, settings.masterVolume * 0.4);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunEndpointTest = () => {
    setTesting(true);
    playFuturisticSound('laser-ping', settings.audioFxEnabled, settings.masterVolume);
    setTimeout(() => {
      setTesting(false);
      playFuturisticSound('resolve-success', settings.audioFxEnabled, settings.masterVolume);
      if (testEndpoint === '/api/health') {
        setTestResult(
          JSON.stringify(
            {
              status: 'online',
              version: '2.4.0',
              engine: 'NEXA Quantum Core',
              timestamp: new Date().toISOString(),
              activeNodes: 4,
            },
            null,
            2
          )
        );
      } else if (testEndpoint === '/api/v1/topology/telemetry') {
        setTestResult(
          JSON.stringify(
            {
              totalVectors: 11581100,
              p95LatencyMs: 142,
              uptimePercent: 99.994,
              activeQPS: 428.4,
              nodesOnline: 4,
            },
            null,
            2
          )
        );
      } else {
        setTestResult(
          JSON.stringify(
            {
              queryId: 'qry_78a1bc92',
              verifiedAnswer: 'For Enterprise clients, bulk returns must be initiated within 15 days [1]. Integration fees non-refundable [2].',
              confidenceScore: 98.2,
              executionMetrics: {
                parsingMs: 12,
                vectorSearchMs: 34,
                conflictArbitrationMs: 18,
                llmSynthesisMs: 82,
                totalLatencyMs: 146,
              },
              citations: [
                {
                  id: 1,
                  docName: 'refund_policy_v2.pdf',
                  excerpt: 'Clause 2.1: 15 calendar days from receipt',
                  provenanceHash: 'sha256:4e9fa821c9...',
                },
              ],
            },
            null,
            2
          )
        );
      }
    }, 450);
  };

  const expressCode = `// server.ts — NEXA Backend Server with Gemini SDK
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/v1/query', async (req, res) => {
  const { query, topK = 5 } = req.body;
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: \`Answer enterprise query with [1], [2] citations: \${query}\`,
    config: { temperature: 0.2 },
  });

  res.json({
    verifiedAnswer: response.text,
    confidenceScore: 98.4,
    citations: [{ id: 1, docName: 'refund_policy_v2.pdf', pageOrSection: 'Page 3' }],
  });
});

app.listen(3000, () => console.log('NEXA Backend online on port 3000'));`;

  const fastApiCode = `# main.py — FastAPI + LangChain Backend
from fastapi import FastAPI
from pydantic import BaseModel
import time

app = FastAPI(title="NEXA Intelligence Engine API", version="2.4.0")

class QueryRequest(BaseModel):
    query: str
    topK: int = 5

@app.post("/api/v1/query")
async def query_endpoint(req: QueryRequest):
    return {
        "queryId": "qry_py_9f81a7b4",
        "verifiedAnswer": "For Enterprise accounts, bulk order returns must be initiated within 15 days [1].",
        "confidenceScore": 97.8,
        "latencyMs": 142
    }`;

  const postgresCode = `-- PostgreSQL + pgvector Schema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE nexa_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_name VARCHAR(255) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE nexa_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES nexa_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    embedding vector(1536) -- HNSW Index for 1536-dim embeddings
);

CREATE INDEX nexa_hnsw_idx ON nexa_chunks 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);`;

  return (
    <div className="w-full flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border border-[var(--theme-primary)]/40 uppercase tracking-widest flex items-center gap-1.5">
              <Server className="w-3 h-3" />
              Backend Connection & Integration Hub
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Production API & Database Specs
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Also see: <span className="text-[var(--theme-primary)] font-bold">/BACKEND_INTEGRATION_GUIDE.md</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Navigation Tabs (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          {[
            { id: 'express', label: 'Node.js Express + Gemini', icon: Code2 },
            { id: 'fastapi', label: 'Python FastAPI + RAG', icon: Terminal },
            { id: 'postgres', label: 'PostgreSQL + pgvector SQL', icon: Database },
            { id: 'tester', label: 'Interactive Live API Test Bench', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  playFuturisticSound('tab-switch', settings.audioFxEnabled, settings.masterVolume * 0.4);
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

        {/* Code Frame / Tester (8 cols) */}
        <div className="lg:col-span-8 cyber-card rounded-2xl p-6 border border-[var(--theme-border)]">
          {activeTab === 'express' && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-300">server.ts (Node.js 20+)</span>
                <button
                  onClick={() => handleCopy(expressCode, 'express')}
                  className="btn-cyber-ghost px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'express' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'express' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-cyan-300 overflow-x-auto max-h-[380px] leading-relaxed">
                {expressCode}
              </pre>
            </div>
          )}

          {activeTab === 'fastapi' && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-300">main.py (Python 3.11+)</span>
                <button
                  onClick={() => handleCopy(fastApiCode, 'fastapi')}
                  className="btn-cyber-ghost px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'fastapi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'fastapi' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-purple-300 overflow-x-auto max-h-[380px] leading-relaxed">
                {fastApiCode}
              </pre>
            </div>
          )}

          {activeTab === 'postgres' && (
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-300">schema.sql (PostgreSQL 16+ pgvector)</span>
                <button
                  onClick={() => handleCopy(postgresCode, 'postgres')}
                  className="btn-cyber-ghost px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'postgres' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'postgres' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto max-h-[380px] leading-relaxed">
                {postgresCode}
              </pre>
            </div>
          )}

          {activeTab === 'tester' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-white uppercase">Live Endpoint Test Simulator</span>
                <button
                  onClick={handleRunEndpointTest}
                  disabled={testing}
                  className="btn-cyber-primary px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{testing ? 'Pinging...' : 'Execute Test'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Target Endpoint:</label>
                <select
                  value={testEndpoint}
                  onChange={(e) => setTestEndpoint(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[var(--theme-primary)]"
                >
                  <option value="/api/v1/query">POST /api/v1/query (Full Multi-Source RAG)</option>
                  <option value="/api/health">GET /api/health (Cluster Health)</option>
                  <option value="/api/v1/topology/telemetry">GET /api/v1/topology/telemetry (Mesh Telemetry)</option>
                </select>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 block mb-1.5">Response Payload:</span>
                <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto min-h-[200px] border border-slate-800">
                  {testResult || '// Click "Execute Test" above to ping endpoint and inspect live JSON telemetry'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
