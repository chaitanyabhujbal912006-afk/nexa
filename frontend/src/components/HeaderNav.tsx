import React, { useState } from 'react';
import { ScreenView, UserSession } from '../types';
import { Globe, ChevronDown, Sparkles, User, LogOut, ArrowRight, Command, ShieldCheck, Zap } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

interface HeaderNavProps {
  currentView: ScreenView;
  onNavigate: (view: ScreenView) => void;
  session: UserSession;
  onLogout: () => void;
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  onOpenCommandPalette?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onNavigate,
  session,
  onLogout,
  activeSection = 'hero',
  onSectionClick,
  onOpenCommandPalette,
}) => {
  const [langDropdown, setLangDropdown] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  const handleNavClick = (sectionId: string) => {
    playTactileClick();
    if (onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-10 py-5 max-w-[1440px] mx-auto w-full">
      {/* Brand / Logo (NEXA Stylized in Cosmic Glass) */}
      <button
        onClick={() => {
          playTactileClick();
          if (currentView !== 'landing') {
            onNavigate('landing');
          } else {
            handleNavClick('hero');
          }
        }}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#38bdf8] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-[#0d0a1c] rounded-[10px] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#c084fc] fill-current" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-extrabold text-lg sm:text-xl text-white tracking-wider">
            NEXA
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#a855f7] font-bold">
            INTELLIGENCE
          </span>
        </div>
      </button>

      {/* Center Segmented Pill Navigation Bar */}
      <nav className="hidden md:flex items-center p-1 rounded-full apple-glass-pill shadow-xl border border-white/10">
        <button
          onClick={() => handleNavClick('hero')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 cursor-pointer ${
            activeSection === 'hero' && currentView === 'landing'
              ? 'bg-[#8b5cf6]/40 text-white border border-[#c084fc]/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Home
        </button>

        <button
          onClick={() => handleNavClick('features-showcase')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 cursor-pointer ${
            activeSection === 'features-showcase' && currentView === 'landing'
              ? 'bg-[#8b5cf6]/40 text-white border border-[#c084fc]/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Arbitration
        </button>

        <button
          onClick={() => handleNavClick('telemetry-story')}
          className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 cursor-pointer ${
            activeSection === 'telemetry-story' && currentView === 'landing'
              ? 'bg-[#8b5cf6]/40 text-white border border-[#c084fc]/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
              : 'text-white/70 hover:text-white hover:bg-white/5'
          }`}
        >
          Architecture
        </button>

        {session.isLoggedIn && (
          <button
            onClick={() => {
              playTactileClick();
              onNavigate('workspace');
            }}
            className={`px-5 py-2 rounded-full font-sans text-xs font-semibold transition-all duration-300 cursor-pointer ${
              currentView === 'workspace'
                ? 'bg-[#8b5cf6]/40 text-white border border-[#c084fc]/50 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            Workspace
          </button>
        )}
      </nav>

      {/* Right Controls & Language Selector Pill */}
      <div className="flex items-center gap-3">
        {/* Command Palette trigger */}
        {onOpenCommandPalette && (
          <button
            onClick={() => {
              playTactileClick();
              onOpenCommandPalette();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full apple-glass-pill text-white/80 hover:text-white font-mono text-xs cursor-pointer"
            title="Open Command Palette (⌘K)"
          >
            <Command className="w-3.5 h-3.5 text-[#c084fc]" />
            <span>K</span>
          </button>
        )}

        {/* Language Selector Pill */}
        <div className="relative">
          <button
            onClick={() => {
              playTactileClick();
              setLangDropdown(!langDropdown);
            }}
            className="px-3.5 py-1.5 rounded-full apple-glass-pill text-xs font-sans font-semibold text-white/90 hover:text-white flex items-center gap-1.5 cursor-pointer transition-all border border-white/10"
          >
            <Globe className="w-3.5 h-3.5 text-[#c084fc]" />
            <span>{selectedLang}</span>
            <ChevronDown className="w-3 h-3 text-white/60" />
          </button>

          {langDropdown && (
            <div className="absolute right-0 top-full mt-2 w-28 apple-glass-card rounded-2xl p-1.5 border border-white/15 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              {['EN', 'DE', 'FR', 'JA', 'ES'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    playTactileClick();
                    setSelectedLang(lang);
                    setLangDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedLang === lang ? 'bg-[#7c3aed]/40 text-white font-bold' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth / Workspace Entry */}
        {session.isLoggedIn ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick();
                onNavigate('workspace');
              }}
              className="btn-orbitsat-purple px-4 py-1.5 rounded-full text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <User className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </button>
            <button
              onClick={() => {
                playTactileClick();
                onLogout();
              }}
              className="p-2 rounded-full apple-glass-pill text-white/70 hover:text-white"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              playResolvedChime();
              onNavigate('login');
            }}
            className="btn-orbitsat-purple px-4 sm:px-5 py-2 rounded-full font-sans text-xs font-bold tracking-wide flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
