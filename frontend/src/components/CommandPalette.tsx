import React, { useState, useEffect } from 'react';
import { Search, Command, ArrowRight, FileText, AlertTriangle, ShieldCheck, Zap, X, Volume2, VolumeX, CornerDownLeft, User, SlidersHorizontal, Radio, Database } from 'lucide-react';
import { ScreenView, UserSession } from '../types';
import { playTactileClick, playResolvedChime, toggleMute, getMuteState } from '../utils/audio';
import { NexaLogo } from './NexaLogo';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: ScreenView) => void;
  onScrollTo: (sectionId: string) => void;
  onSelectQuery: (query: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onScrollTo,
  onSelectQuery,
}) => {
  const [search, setSearch] = useState('');
  const [isMuted, setIsMuted] = useState(getMuteState());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          playTactileClick();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickActions = [
    {
      id: 'act-sabbatical',
      title: 'Query: Sabbatical Leave Policy Conflict',
      category: 'Intelligence Query',
      icon: Zap,
      action: () => {
        onSelectQuery("How many days of paid sabbatical are employees entitled to?");
        onScrollTo('interactive-search');
        onClose();
      },
    },
    {
      id: 'act-refund',
      title: 'Query: Enterprise Refund & SLA Terms',
      category: 'Intelligence Query',
      icon: Zap,
      action: () => {
        onSelectQuery("What is our current refund policy?");
        onScrollTo('interactive-search');
        onClose();
      },
    },
    {
      id: 'act-workspace',
      title: 'Open Live Document Ingestion Vault',
      category: 'Workspace',
      icon: Database,
      action: () => {
        onNavigate('workspace');
        onClose();
      },
    },
    {
      id: 'act-conflict',
      title: 'Inspect Contradiction & Arbitration Radar',
      category: 'Workspace',
      icon: AlertTriangle,
      action: () => {
        onScrollTo('conflict-section');
        onClose();
      },
    },
    {
      id: 'act-evidence',
      title: 'Open Verified Evidence & Citation Hub',
      category: 'Workspace',
      icon: ShieldCheck,
      action: () => {
        onScrollTo('citations-section');
        onClose();
      },
    },
  ];

  const filteredActions = quickActions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl apple-glass-card rounded-[28px] border border-white/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-white/10">
          <Search className="w-5 h-5 text-[#bef264]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search commands, queries, policies, or navigation..."
            autoFocus
            className="w-full bg-transparent text-white font-sans text-sm sm:text-base placeholder:text-white/30 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full apple-glass-pill text-[#94a3b8] hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-1 custom-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#94a3b8]">
              No matching actions or queries found.
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    playTactileClick();
                    action.action();
                  }}
                  className="w-full p-3 rounded-2xl apple-glass-pill hover:border-[#bef264] flex items-center justify-between text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 text-[#bef264] group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-sans text-xs sm:text-sm font-semibold text-white group-hover:text-[#bef264] transition-colors block">
                        {action.title}
                      </span>
                      <span className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-wider">
                        {action.category}
                      </span>
                    </div>
                  </div>
                  <CornerDownLeft className="w-4 h-4 text-[#94a3b8] group-hover:text-[#bef264] transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#060914] border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-[#94a3b8]">
          <div className="flex items-center gap-2">
            <NexaLogo size="sm" showSubtitle={false} />
            <span>NEXA COMMAND v2.5</span>
          </div>
          <div className="flex items-center gap-3">
            <span>ESC TO CLOSE</span>
            <span>ENTER TO RUN</span>
          </div>
        </div>
      </div>
    </div>
  );
};
