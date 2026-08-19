import React from 'react';
import { X, Network, Cpu, Database, Lock, Zap } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const stackLayers = [
    {
      layer: 'Ingress & Normalization Layer',
      icon: Network,
      items: ['Multi-protocol parsers (PDF, EML, XLSX, DOCX, DB)', 'Real-time OCR & Layout Reconstruction', 'Sub-second chunking with contextual embeddings'],
    },
    {
      layer: 'Temporal Conflict & Topology Engine',
      icon: Zap,
      items: ['Timeline extraction & supersession graph', 'Contradiction detection across cross-silo documents', 'Automated arbitration scoring & confidence indexing'],
    },
    {
      layer: 'Hybrid Graph-Vector Storage Layer',
      icon: Database,
      items: ['HNSW Vector Index with 1536-dim embeddings', 'Enterprise Knowledge Graph with entity relation mapping', 'Cryptographic provenance logging with SHA-256 tamper seals'],
    },
    {
      layer: 'Zero-Trust Security & Privacy Sandbox',
      icon: Lock,
      items: ['In-flight PII & secret token masking', 'Isolated VPC / Private Cloud tenant boundaries', 'RBAC & Document-level permission enforcement'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050505]/90 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-[#0A0A0A] border border-[#262626] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#262626] flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-[#333] flex items-center justify-center text-white bg-[#0A0A0A]">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif text-white">NEXA Architecture Specification</h3>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#737373]">Technical Topology & Provenance Blueprint</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#737373] hover:text-white p-2 border border-transparent hover:border-[#333] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {stackLayers.map((sl, idx) => {
              const Icon = sl.icon;
              return (
                <div
                  key={idx}
                  className="p-5 bg-[#0F0F0F] border border-[#262626] flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-[#A3A3A3]" />
                    <h4 className="text-xs font-sans font-medium text-white uppercase tracking-[0.1em]">
                      {sl.layer}
                    </h4>
                  </div>
                  <ul className="space-y-2 text-xs text-[#737373] font-light">
                    {sl.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#525252] mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Performance Benchmark Matrix */}
          <div className="p-5 bg-[#121212] border border-[#262626] text-xs">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.3em] text-[#737373] font-mono mb-4">
              <span>Benchmark Metrics</span>
              <span>Enterprise Scale</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-[#262626]">
              <div>
                <div className="text-xl font-serif italic text-white">&lt; 180ms</div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#525252] mt-1 font-mono">P95 Search</div>
              </div>
              <div>
                <div className="text-xl font-serif italic text-white">99.99%</div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#525252] mt-1 font-mono">SLA Uptime</div>
              </div>
              <div>
                <div className="text-xl font-serif italic text-white">100M+</div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#525252] mt-1 font-mono">Vector Docs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#262626] bg-[#121212] flex justify-end">
          <button
            onClick={onClose}
            className="border border-[#404040] bg-transparent text-[#D4D4D4] hover:bg-white hover:text-black hover:border-white px-6 py-2.5 text-[10px] uppercase tracking-[0.2em] transition-all cursor-pointer"
          >
            Close Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
