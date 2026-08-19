import React, { useState } from 'react';
import {
  FileText,
  Table,
  Mail,
  RefreshCw,
  FileCode,
  Folder,
} from 'lucide-react';

interface KnowledgeChaosSectionProps {
  onSelectDoc?: (docName: string) => void;
}

export const KnowledgeChaosSection: React.FC<KnowledgeChaosSectionProps> = ({ onSelectDoc }) => {
  const [activeDoc, setActiveDoc] = useState<string | null>(null);

  const docs = [
    {
      id: 'q3',
      name: 'Q3_Report_vFinal.pdf',
      icon: FileText,
      position: 'top-[10%] left-[6%] sm:left-[12%]',
      rotation: '-rotate-6',
      delay: '0s',
      opacity: 'opacity-80',
    },
    {
      id: 'client-list',
      name: 'Client_List_2023.xlsx',
      icon: Table,
      position: 'top-[18%] right-[8%] sm:right-[14%]',
      rotation: 'rotate-6',
      delay: '1s',
      opacity: 'opacity-90',
    },
    {
      id: 'legal',
      name: 'Re: Legal Dispute',
      icon: Mail,
      position: 'bottom-[22%] left-[8%] sm:left-[18%]',
      rotation: 'rotate-4',
      delay: '2s',
      opacity: 'opacity-70',
    },
    {
      id: 'crm',
      name: 'CRM Sync Error Log',
      icon: RefreshCw,
      position: 'bottom-[14%] right-[6%] sm:right-[12%]',
      rotation: '-rotate-4',
      delay: '1.5s',
      opacity: 'opacity-85',
    },
    {
      id: 'notes',
      name: 'Notes.txt',
      icon: FileCode,
      position: 'top-[44%] left-[2%] sm:left-[5%]',
      rotation: '-rotate-12',
      delay: '0.5s',
      opacity: 'opacity-40',
    },
    {
      id: 'archive',
      name: 'Archive',
      icon: Folder,
      position: 'top-[48%] right-[2%] sm:right-[5%]',
      rotation: 'rotate-12',
      delay: '2.5s',
      opacity: 'opacity-35',
    },
  ];

  return (
    <section
      id="knowledge-everywhere"
      className="w-full flex flex-col items-center gap-12 pt-16 relative"
    >
      {/* Title & Subtitle in Editorial Serif */}
      <div className="text-center flex flex-col gap-4 max-w-3xl z-10 px-4">
        <span className="text-[#D4D4D4] text-[10px] uppercase tracking-[0.4em] font-medium font-sans">
          Fragmentation Analysis
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-[58px] leading-[1.05] font-serif text-white">
          Your knowledge is everywhere.
        </h2>
        <p className="text-lg sm:text-xl font-serif italic text-[#737373] font-light">
          Information exists. Context doesn&apos;t.
        </p>
      </div>

      {/* Chaotic Document Cloud + Central Processing Geometry */}
      <div className="relative w-full h-[460px] sm:h-[500px] flex items-center justify-center bg-[#0F0F0F] border border-[#262626] overflow-hidden architectural-grid-bg">
        {/* Floating Scattered Source Cards */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {docs.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDoc(item.name);
                  onSelectDoc?.(item.name);
                }}
                className={`absolute ${item.position} bg-[#0A0A0A] border border-[#262626] p-3 sm:p-4 ${item.rotation} ${item.opacity} pointer-events-auto cursor-pointer hover:opacity-100 hover:scale-105 hover:rotate-0 hover:border-white hover:z-30 transition-all duration-300 shadow-2xl animate-float-delay`}
                style={{ animationDelay: item.delay }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[#A3A3A3]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-sans text-[#E5E5E5] font-medium">
                      {item.name}
                    </span>
                    <span className="text-[9px] uppercase tracking-[0.25em] text-[#525252]">
                      Unstructured Fragment
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Central Geometric Compass & Axis Nexus */}
        <div className="w-64 sm:w-72 h-64 sm:h-72 border border-[#262626] bg-[#0A0A0A]/90 flex items-center justify-center z-10 relative shadow-2xl">
          {/* Compass grid lines */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full h-[1px] bg-[#262626]"></div>
            <div className="h-full w-[1px] bg-[#262626] absolute"></div>
          </div>

          <div className="w-48 sm:w-52 h-48 sm:h-52 border border-[#333333] flex items-center justify-center">
            <div className="w-32 sm:w-36 h-32 sm:h-36 border border-[#404040] bg-[#121212] flex flex-col items-center justify-center p-4 text-center">
              <span className="text-[9px] uppercase tracking-[0.3em] text-[#737373] font-mono mb-2">
                NEXA-CORE
              </span>
              <span className="text-xl font-serif italic text-white">
                Index 01
              </span>
              <span className="text-[8px] uppercase tracking-[0.25em] text-[#525252] mt-2 font-mono">
                Unified Topology
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
