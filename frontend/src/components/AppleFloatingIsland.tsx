import React, { useState } from 'react';
import { Heart, Send, Bookmark, Sparkles, Check, Share2, Layers, Palette, Eye } from 'lucide-react';
import { playTactileClick, playResolvedChime } from '../utils/audio';

export type ColorTheme = 'acid-lime' | 'cyber-lavender' | 'electric-cyan' | 'neon-sunset';

interface AppleFloatingIslandProps {
  currentTheme: ColorTheme;
  onThemeChange: (theme: ColorTheme) => void;
  onBookmarkAll: () => void;
}

export const AppleFloatingIsland: React.FC<AppleFloatingIslandProps> = ({
  currentTheme,
  onThemeChange,
  onBookmarkAll,
}) => {
  const [likes, setLikes] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const handleLike = () => {
    playTactileClick();
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      playResolvedChime();
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleBookmark = () => {
    playTactileClick();
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      playResolvedChime();
      onBookmarkAll();
    }
  };

  const handleShare = () => {
    playTactileClick();
    setIsShared(true);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setTimeout(() => setIsShared(false), 2200);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 relative z-30 mb-2">
      {/* Top Apple-Style Dynamic Glass Header Pill (inspired by @Explore_Ui_Ux pill) */}
      <div className="w-full max-w-xl mx-auto apple-glass-pill rounded-full px-4 sm:px-6 py-2 flex items-center justify-between shadow-2xl transition-all duration-300 hover:border-white/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#bef264] via-[#38bdf8] to-[#c084fc] p-[2px] shadow-[0_0_12px_rgba(192,132,252,0.6)]">
              <div className="w-full h-full rounded-full bg-[#090d1a] flex items-center justify-center font-bold text-xs text-[#bef264]">
                ✨
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4ade80] border-2 border-[#090d1a]" />
          </div>

          <div className="flex flex-col">
            <span className="font-sans text-xs sm:text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
              @nexa_intelligence
              <span className="font-cursive text-base text-[#c084fc] font-bold">verified</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              playTactileClick();
              setShowThemePicker(!showThemePicker);
            }}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
            title="Switch Aesthetic Palette"
          >
            <Palette className="w-3 h-3 text-[#bef264]" />
            <span className="hidden sm:inline">Aesthetic</span>
          </button>

          {/* Save / Bookmark Pill Button */}
          <button
            onClick={handleBookmark}
            className={`px-3 py-1 rounded-full font-sans text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-[#c084fc] text-[#090d1a] shadow-[0_0_15px_rgba(192,132,252,0.8)]'
                : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/10'
            }`}
          >
            <span className="text-[10px] sm:text-xs">SAVE CLUSTER</span>
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aesthetic Preset Popover */}
      {showThemePicker && (
        <div className="apple-glass-card rounded-2xl p-3 border border-white/20 shadow-2xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
          <span className="font-cursive text-base text-[#bef264] px-2">Palette:</span>
          
          <button
            onClick={() => {
              playTactileClick();
              onThemeChange('acid-lime');
            }}
            className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTheme === 'acid-lime'
                ? 'bg-[#bef264] text-[#090d1a] shadow-[0_0_12px_rgba(190,242,100,0.8)]'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#bef264]" />
            <span>Acid Lime & Teal</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              onThemeChange('cyber-lavender');
            }}
            className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentTheme === 'cyber-lavender'
                ? 'bg-[#c084fc] text-[#090d1a] shadow-[0_0_12px_rgba(192,132,252,0.8)]'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]" />
            <span>Cyber Lavender</span>
          </button>

          <button
            onClick={() => {
              playTactileClick();
              onThemeChange('electric-cyan');
            }}
            className={`px-3 py-1.5 rounded-xl font-sans text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer hidden sm:flex ${
              currentTheme === 'electric-cyan'
                ? 'bg-[#38bdf8] text-[#090d1a] shadow-[0_0_12px_rgba(56,189,248,0.8)]'
                : 'bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
            <span>Electric Cyan</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const GenZReactionPill: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative flex items-center justify-center my-6">
      {/* Concentric Halo around Reaction Dock */}
      <div className="relative p-1.5 rounded-full apple-glass-card border border-white/20 shadow-[0_0_35px_rgba(192,132,252,0.3)] flex items-center gap-3">
        {/* Glow rings decoration */}
        <div className="absolute -inset-1 rounded-full border border-[#38bdf8]/40 pointer-events-none pulse-halo"></div>
        <div className="absolute -inset-2.5 rounded-full border border-[#c084fc]/20 pointer-events-none"></div>

        {/* Heart Reaction */}
        <button
          onClick={() => {
            playTactileClick();
            setLiked(!liked);
            if (!liked) playResolvedChime();
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            liked
              ? 'bg-[#ef4444] text-white shadow-[0_0_18px_rgba(239,68,68,0.8)] scale-110'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
          }`}
          title="Love this insight"
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        </button>

        {/* Share Reaction */}
        <button
          onClick={() => {
            playTactileClick();
            setShared(true);
            playResolvedChime();
            setTimeout(() => setShared(false), 2000);
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            shared
              ? 'bg-[#38bdf8] text-[#090d1a] shadow-[0_0_18px_rgba(56,189,248,0.8)] scale-110'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
          }`}
          title="Share to Workspace / Telegram"
        >
          {shared ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>

        {/* Save Reaction */}
        <button
          onClick={() => {
            playTactileClick();
            setSaved(!saved);
            if (!saved) playResolvedChime();
          }}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            saved
              ? 'bg-[#c084fc] text-[#090d1a] shadow-[0_0_18px_rgba(192,132,252,0.8)] scale-110'
              : 'bg-white/10 text-white/80 hover:bg-white/20 hover:scale-105'
          }`}
          title="Save to personal knowledge vault"
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Dotted pointer curved arrow (matching the reference image) */}
      <div className="absolute -top-10 -right-24 hidden md:flex items-center gap-2 pointer-events-none">
        <svg width="70" height="40" viewBox="0 0 70 40" fill="none" className="text-[#bef264]">
          <path
            d="M60 5 C 40 5, 20 20, 10 35"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            fill="none"
          />
          <polygon points="5,35 15,35 10,25" fill="currentColor" />
        </svg>
        <span className="font-cursive text-2xl text-[#bef264] font-bold rotate-6 whitespace-nowrap overflow-visible">
          tap to save insight
        </span>
      </div>
    </div>
  );
};
