import React from 'react';
import { X, FileText, Hash, ShieldCheck, Layers, Calendar, HardDrive, CheckCircle2, Copy } from 'lucide-react';
import { KnowledgeDocument } from '../types';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface DocumentModalProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({ document, onClose }) => {
  const [copiedHash, setCopiedHash] = React.useState(false);

  if (!document) return null;

  const handleCopyHash = () => {
    if (!document.hash) return;
    playTactileClick();
    navigator.clipboard.writeText(document.hash);
    setCopiedHash(true);
    playResolvedChime();
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const chunks = document.chunks || [
    {
      chunkIndex: 1,
      totalChunks: 1,
      text: `Primary content extract for ${document.title}. Full document contents are cryptographically hashed and indexed into 384-dimensional vector space with 20% sliding window overlap.`,
      matchScorePct: 98,
      sha256: document.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      section: 'Section 1.0 - Root Clause',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="apple-glass-card rounded-[28px] border border-white/20 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-white relative">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7c3aed]/20 border border-[#a855f7]/40 flex items-center justify-center text-[#c084fc]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg text-white">
                  {document.title}
                </h3>
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#c084fc] border border-[#a855f7]/30">
                  {document.type}
                </span>
              </div>
              <p className="font-mono text-xs text-[#94a3b8] mt-0.5">
                DEPARTMENT: <span className="text-[#38bdf8]">{document.department}</span> • STATUS: <span className="text-white capitalize">{document.status}</span>
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

        {/* Metadata Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white/5 border-b border-white/10 font-mono text-xs">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#38bdf8]" />
            <div>
              <span className="text-[#94a3b8] block text-[10px]">FILE SIZE</span>
              <strong className="text-white">{document.size}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c084fc]" />
            <div>
              <span className="text-[#94a3b8] block text-[10px]">VECTOR CHUNKS</span>
              <strong className="text-white">{document.vectorCount || chunks.length}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#38bdf8]" />
            <div>
              <span className="text-[#94a3b8] block text-[10px]">INDEXED DATE</span>
              <strong className="text-white">{document.date}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4ade80]" />
            <div>
              <span className="text-[#94a3b8] block text-[10px]">VERIFICATION</span>
              <strong className="text-[#4ade80]">{document.confidence}% Conf.</strong>
            </div>
          </div>
        </div>

        {/* SHA-256 Provenance Row */}
        {document.hash && (
          <div className="px-6 py-2.5 bg-[#090616] border-b border-white/10 flex items-center justify-between font-mono text-[11px]">
            <div className="flex items-center gap-2 truncate pr-2">
              <Hash className="w-3.5 h-3.5 text-[#c084fc] flex-shrink-0" />
              <span className="text-[#94a3b8]">SHA-256 PROVENANCE:</span>
              <span className="text-white/80 truncate">{document.hash}</span>
            </div>
            <button
              onClick={handleCopyHash}
              className="flex items-center gap-1 text-[10px] text-[#c084fc] hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex-shrink-0"
            >
              {copiedHash ? <CheckCircle2 className="w-3 h-3 text-[#4ade80]" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        )}

        {/* Chunks List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider">
              Ingested Vector Chunks ({chunks.length})
            </h4>
            <span className="font-mono text-[10px] text-[#94a3b8]">
              Model: all-MiniLM-L6-v2 (384-dim)
            </span>
          </div>

          <div className="space-y-3">
            {chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 hover:border-[#a855f7]/40 transition-all"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-[#7c3aed]/30 text-white font-bold">
                      Chunk #{chunk.chunkIndex} of {chunk.totalChunks}
                    </span>
                    <span className="text-[#38bdf8]">{chunk.section}</span>
                  </div>
                  <span className="text-[#4ade80] font-bold">
                    {chunk.matchScorePct}% Match
                  </span>
                </div>

                <p className="font-sans text-xs text-[#cbd5e1] leading-relaxed">
                  "{chunk.text}"
                </p>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-[#94a3b8]">
                  <span>Chunk Hash: <code className="text-white/70">{chunk.sha256.substring(0, 16)}...</code></span>
                  <span>Overlap: 20% Sliding Window</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[#94a3b8]">
            Storage: ChromaDB Collection // Cluster: Starlight VPC
          </span>
          <button
            onClick={() => {
              playTactileClick();
              onClose();
            }}
            className="btn-orbitsat-purple px-5 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
