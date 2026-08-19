import React from 'react';
import {
  Sparkles,
  Zap,
  Scale,
  Globe,
  Sliders,
  Server,
  Volume2,
  VolumeX,
  Compass,
  Palette,
} from 'lucide-react';
import { AppView, ColorTheme } from '../types';
import { playFuturisticSound } from '../utils/audioFx';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  colorTheme: ColorTheme;
  onToggleTheme: () => void;
  audioFxEnabled: boolean;
  onToggleAudio: () => void;
  onOpenGetStarted: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  colorTheme,
  onToggleTheme,
  audioFxEnabled,
  onToggleAudio,
  onOpenGetStarted,
}) => {
  const navItems: { id: AppView; label: string; icon: React.ElementType }[] = [
    { id: 'landing', label: 'Explorer', icon: Compass },
    { id: 'neural-studio', label: 'Neural Studio', icon: Zap },
    { id: 'conflict-matrix', label: 'Conflict Matrix', icon: Scale },
    { id: 'cluster-topology', label: 'Topology & Mesh', icon: Globe },
    { id: 'backend-docs', label: 'Backend Hub', icon: Server },
    { id: 'settings-hub', label: 'Settings', icon: Sliders },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-3 bg-slate-950/80 backdrop-blur-xl border-b border-[var(--theme-border)]">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--theme-primary)] via-[var(--theme-secondary)] to-[var(--theme-accent)] p-[1px] shadow-[0_0_20px_var(--theme-glow)]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[var(--theme-primary)] group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold tracking-wider font-mono text-white flex items-center gap-1.5">
              NEXA<span className="text-[var(--theme-primary)]">.AI</span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase hidden sm:inline">
              QUANTUM INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Center: Futuristic Navigation Pills */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  playFuturisticSound('tab-switch', audioFxEnabled, 0.3);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--theme-primary)] text-slate-950 font-bold shadow-[0_0_15px_var(--theme-glow)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Controls & CTA */}
        <div className="flex items-center gap-2">
          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              onToggleAudio();
              playFuturisticSound('click', true, 0.3);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              audioFxEnabled
                ? 'bg-slate-900 border-slate-700 text-[var(--theme-primary)] shadow-[0_0_10px_var(--theme-glow)]'
                : 'bg-slate-950 border-slate-800 text-slate-500'
            }`}
            title={audioFxEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
          >
            {audioFxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Quick Theme Cycle Button */}
          <button
            onClick={() => {
              onToggleTheme();
              playFuturisticSound('quantum-chime', audioFxEnabled, 0.3);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-[var(--theme-primary)] transition-all cursor-pointer"
            title="Cycle Futuristic Color Themes"
          >
            <Palette className="w-4 h-4 text-[var(--theme-primary)]" />
          </button>

          {/* CTA Action */}
          <button
            onClick={onOpenGetStarted}
            className="btn-cyber-primary px-3.5 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Launch Sandbox</span>
            <span className="sm:hidden">Launch</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex items-center justify-between overflow-x-auto gap-1 pt-2 mt-2 border-t border-slate-800/80">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                playFuturisticSound('tab-switch', audioFxEnabled, 0.3);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 flex-shrink-0 ${
                isActive
                  ? 'bg-[var(--theme-primary)] text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
