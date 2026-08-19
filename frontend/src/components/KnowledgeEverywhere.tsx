import React, { useState } from 'react';
import { FileText, Table2, Mail, RefreshCw, FileCode, Folder, Database, Radio, Shield, Network } from 'lucide-react';
import { playTactileClick } from '../utils/audio';

export const KnowledgeEverywhere: React.FC = () => {
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  const sources = [
    {
      id: 'src-1',
      title: 'Q3_Report_vFinal.pdf',
      type: 'pdf',
      icon: FileText,
      color: 'text-[#bef264]',
      bgColor: 'bg-[#bef264]/15',
      posClass: 'top-[10%] left-[6%] sm:left-[12%]',
      rotation: '-rotate-3',
      delay: '0s',
      dept: 'Finance / Audit',
      size: '2.4 MB',
    },
    {
      id: 'src-2',
      title: 'Client_List_2024.xlsx',
      type: 'xlsx',
      icon: Table2,
      color: 'text-[#38bdf8]',
      bgColor: 'bg-[#38bdf8]/15',
      posClass: 'top-[16%] right-[6%] sm:right-[14%]',
      rotation: 'rotate-3',
      delay: '1s',
      dept: 'Sales Pipeline',
      size: '5.1 MB',
    },
    {
      id: 'src-3',
      title: 'Re: Legal Dispute.eml',
      type: 'eml',
      icon: Mail,
      color: 'text-[#c084fc]',
      bgColor: 'bg-[#c084fc]/15',
      posClass: 'bottom-[14%] left-[8%] sm:left-[16%]',
      rotation: 'rotate-4',
      delay: '2s',
      dept: 'Legal Counsel',
      size: '180 KB',
    },
    {
      id: 'src-4',
      title: 'CRM Sync Error Log',
      type: 'log',
      icon: RefreshCw,
      color: 'text-[#f87171]',
      bgColor: 'bg-[#ef4444]/15',
      posClass: 'bottom-[12%] right-[8%] sm:right-[14%]',
      rotation: '-rotate-3',
      delay: '1.5s',
      dept: 'Infrastructure',
      size: '14.2 MB',
    },
    {
      id: 'src-5',
      title: 'Notes_Internal.txt',
      type: 'txt',
      icon: FileCode,
      color: 'text-[#94a3b8]',
      bgColor: 'bg-white/10',
      posClass: 'top-[44%] left-[2%] sm:left-[4%]',
      rotation: '-rotate-6 hidden md:flex',
      delay: '0.5s',
      dept: 'Engineering Scratchpad',
      size: '34 KB',
    },
    {
      id: 'src-6',
      title: 'Legacy Archive',
      type: 'folder',
      icon: Folder,
      color: 'text-[#94a3b8]',
      bgColor: 'bg-white/10',
      posClass: 'top-[46%] right-[2%] sm:right-[4%]',
      rotation: 'rotate-6 hidden md:flex',
      delay: '2.5s',
      dept: 'Cold Storage Vault',
      size: '128 GB',
    },
  ];

  return (
    <section id="knowledge-everywhere" className="w-full flex flex-col items-center gap-8 pt-12">
      {/* Title with Cursive Accent (Zero Font Clipping) */}
      <div className="text-center flex flex-col gap-2 max-w-3xl z-10 px-4 overflow-visible">
        <span className="font-cursive text-3xl sm:text-4xl text-[#c084fc] font-bold mb-0.5 drop-shadow-[0_0_12px_rgba(192,132,252,0.5)] overflow-visible">
          The Enterprise Context Problem
        </span>
        <h2 className="font-syne text-3xl sm:text-5xl lg:text-[60px] lg:leading-[68px] font-extrabold text-[#f8fafc] tracking-[-0.035em] overflow-visible pb-1">
          Your knowledge is everywhere.
        </h2>
        <p className="font-sans text-base sm:text-lg text-[#94a3b8] font-medium">
          Information exists across silos. Unified verifiable context doesn't.
        </p>
      </div>

      {/* Floating Canvas Area with Apple Glass */}
      <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center overflow-hidden rounded-[32px] border border-white/15 apple-glass-card shadow-2xl">
        {/* Floating source nodes */}
        {sources.map((src) => {
          const IconComp = src.icon;
          const isHovered = hoveredSource === src.id;

          return (
            <div
              key={src.id}
              id={`chaos-${src.id}`}
              onMouseEnter={() => {
                playTactileClick();
                setHoveredSource(src.id);
              }}
              onMouseLeave={() => setHoveredSource(null)}
              style={{ animationDelay: src.delay }}
              className={`absolute ${src.posClass} ${src.rotation} float-gentle apple-glass-pill p-3.5 sm:p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-300 z-10 cursor-pointer ${
                isHovered
                  ? 'scale-110 border-[#bef264] shadow-[0_0_30px_rgba(190,242,100,0.4)] z-30 opacity-100 bg-white/20'
                  : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${src.bgColor} ${src.color}`}>
                <IconComp className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold text-[#f1f5f9]">
                  {src.title}
                </span>
                <span className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  {src.dept} • {src.size}
                </span>
              </div>
            </div>
          );
        })}

        {/* Connecting Synapse Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#bef264]/20" strokeWidth="1.5" strokeDasharray="6,6">
          <line x1="20%" y1="18%" x2="50%" y2="50%" />
          <line x1="80%" y1="24%" x2="50%" y2="50%" />
          <line x1="24%" y1="78%" x2="50%" y2="50%" />
          <line x1="76%" y1="82%" x2="50%" y2="50%" />
        </svg>

        {/* Central Vortex Core */}
        <div className="w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-[#bef264]/30 bg-white/5 shadow-[0_0_80px_rgba(190,242,100,0.15)] flex items-center justify-center z-20 relative">
          <div className="w-40 sm:w-48 h-40 sm:h-48 rounded-full border border-[#c084fc]/30 bg-white/5 flex items-center justify-center pulse-halo">
            <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full border border-[#bef264] bg-[#bef264]/10 flex flex-col items-center justify-center shadow-[0_0_35px_rgba(190,242,100,0.3)] text-center p-2">
              <Network className="w-7 h-7 text-[#bef264] animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-white uppercase tracking-widest mt-1.5">
                NEXA VORTEX
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
