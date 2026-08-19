import React from 'react';
import { X, ShieldCheck, Database, Lock, Cpu, CheckCircle2, Key, Radio, Layers, Server } from 'lucide-react';
import { playTactileClick } from '../utils/audio';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="apple-glass-card rounded-[28px] border border-white/20 shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden text-white relative">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                NEXA System Architecture & Compliance Inspector
              </h3>
              <p className="font-mono text-xs text-[#94a3b8]">
                ENTERPRISE TOPOLOGY // CRYPTOGRAPHIC ISOLATION MATRIX
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-white/10 text-[#94a3b8] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Compliance Badges */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase font-bold text-[#c084fc] tracking-wider block">
              CERTIFIED COMPLIANCE FRAMEWORKS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'SOC 2 Type II Certified', desc: 'Zero-knowledge vector partition, continuous automated audit ledger logging.', status: 'Active (2026 Audit)' },
                { title: 'GDPR / CCPA Compliant', desc: 'Automated PII scrubbing, right-to-be-forgotten vector purging API.', status: 'Enforced' },
                { title: 'ISO/IEC 27001 Certified', desc: 'Cryptographic HSM envelope encryption with automated KMS rotation.', status: 'Certified' },
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#4ade80] font-display text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{c.title}</span>
                  </div>
                  <p className="font-sans text-[11px] text-[#cbd5e1] leading-relaxed">
                    {c.desc}
                  </p>
                  <span className="font-mono text-[9px] text-[#38bdf8] block pt-1">
                    Status: {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Indexing & Vector DB Pipeline */}
          <div className="space-y-2">
            <span className="font-mono text-[10px] uppercase font-bold text-[#38bdf8] tracking-wider block">
              VECTOR DB & RAG RETRIEVAL PIPELINE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-display text-xs font-bold">
                  <Database className="w-4 h-4 text-[#c084fc]" />
                  <span>Embedding & Ingestion Specs</span>
                </div>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#cbd5e1]">
                  <li>• Embedding Model: <strong className="text-white">all-MiniLM-L6-v2 (384 dims)</strong></li>
                  <li>• Chunking Strategy: <strong className="text-white">512 tokens (20% overlap)</strong></li>
                  <li>• Vector Store: <strong className="text-white">ChromaDB / pgvector Single-Tenant</strong></li>
                  <li>• Hashing: <strong className="text-white">SHA-256 Provenance Ledger</strong></li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-white font-display text-xs font-bold">
                  <Lock className="w-4 h-4 text-[#38bdf8]" />
                  <span>PII Redaction & Security Enclave</span>
                </div>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#cbd5e1]">
                  <li>• PII Scrubbing: <strong className="text-white">Regex + NER Pre-Embedding Gate</strong></li>
                  <li>• Token Redaction: <strong className="text-white">SSN, Credit Cards, API Keys</strong></li>
                  <li>• Key Management: <strong className="text-white">Dedicated Sovereign KMS</strong></li>
                  <li>• Transport Security: <strong className="text-white">mTLS 1.3 / End-to-End Encrypted</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#94a3b8]">
            Audited by Coalfire Labs // ISO 27001 Registered
          </span>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="btn-orbitsat-purple px-5 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
