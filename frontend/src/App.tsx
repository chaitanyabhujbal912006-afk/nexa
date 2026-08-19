import React, { useState, useEffect } from 'react';
import { ScreenView, UserSession } from './types';
import { HeaderNav } from './components/HeaderNav';
import { HeroSection } from './components/HeroSection';
import { NexaFeatureShowcase } from './components/NexaFeatureShowcase';
import { NexaCoreCapabilities } from './components/NexaCoreCapabilities';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { AuthSignIn } from './components/AuthSignIn';
import { AuthSignUp } from './components/AuthSignUp';
import { IntelligenceWorkspace } from './components/IntelligenceWorkspace';
import { CommandPalette } from './components/CommandPalette';
import { restoreSession, logout } from './api/auth';

const EMPTY_SESSION: UserSession = {
  fullName: '',
  email: '',
  role: '',
  company: '',
  isLoggedIn: false,
};

export default function App() {
  const [currentView, setCurrentView] = useState<ScreenView>('landing');
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [session, setSession] = useState<UserSession>(EMPTY_SESSION);

  // Track scroll position for interactive scrolling parallax & progress bar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, (currentScrollY / totalHeight) * 100));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore session from stored JWT on initial app load
  useEffect(() => {
    const stored = restoreSession();
    if (stored) {
      setSession({
        userId: stored.userId,
        email: stored.email,
        fullName: stored.fullName || stored.email.split('@')[0],
        role: stored.role || 'Member',
        company: stored.company || '',
        isLoggedIn: true,
      });
      setCurrentView('workspace');
    }
  }, []);

  // Listen for forced logout (emitted by client.ts on 401 responses)
  useEffect(() => {
    const handleForcedLogout = () => {
      setSession(EMPTY_SESSION);
      setCurrentView('landing');
    };
    window.addEventListener('nexa:logout', handleForcedLogout);
    return () => window.removeEventListener('nexa:logout', handleForcedLogout);
  }, []);

  const scrollToSection = (sectionId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
  };

  const handleSignInSuccess = (userSession: UserSession) => {
    setSession(userSession);
    setCurrentView('workspace');
  };

  const handleSignUpSuccess = (userSession: UserSession) => {
    setSession(userSession);
    setCurrentView('workspace');
  };

  const handleLogout = () => {
    logout(); // Clears JWT + local profile from localStorage
    setSession(EMPTY_SESSION);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-[#06040e] text-[#f8fafc] relative overflow-x-hidden font-sans selection:bg-[#8b5cf6]/40 selection:text-white">
      {/* Top Interactive Scroll Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-50 bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#38bdf8] transition-all duration-75 shadow-[0_0_12px_rgba(168,85,247,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Planetary Cosmic Horizon Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Upper Violet Horizon Atmosphere Glow */}
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[1400px] h-[550px] rounded-full bg-[#7c3aed]/20 blur-[140px] transition-transform duration-100 ease-out"
          style={{ transform: `translateX(-50%) translateY(${scrollY * 0.1}px)` }}
        />
        {/* Subtle Side Ambient Nebulae */}
        <div className="absolute top-[35%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#38bdf8]/10 blur-[130px]" />
        <div className="absolute top-[65%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#9333ea]/15 blur-[140px]" />
      </div>

      {/* Global Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(view) => setCurrentView(view)}
        onScrollTo={scrollToSection}
        onSelectQuery={() => scrollToSection('features-showcase')}
      />

      {/* Screen Views */}
      {currentView === 'login' ? (
        <AuthSignIn
          onSignInSuccess={handleSignInSuccess}
          onSwitchToSignUp={() => setCurrentView('signup')}
          onBackToLanding={() => setCurrentView('landing')}
        />
      ) : currentView === 'signup' ? (
        <AuthSignUp
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToSignIn={() => setCurrentView('login')}
          onBackToLanding={() => setCurrentView('landing')}
        />
      ) : currentView === 'workspace' ? (
        <>
          <HeaderNav
            currentView={currentView}
            onNavigate={setCurrentView}
            session={session}
            onLogout={handleLogout}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <IntelligenceWorkspace
            session={session}
            onBackToLanding={() => setCurrentView('landing')}
            onUpdateSession={setSession}
          />
          <Footer />
        </>
      ) : (
        /* Streamlined NEXA Intelligence Home Page */
        <div className="relative z-10 flex flex-col min-h-screen">
          <HeaderNav
            currentView={currentView}
            onNavigate={setCurrentView}
            session={session}
            onLogout={handleLogout}
            activeSection={activeSection}
            onSectionClick={scrollToSection}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />

          <main className="flex flex-col gap-12 lg:gap-16 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
            {/* 1. Luminous Planetary Horizon Hero Section */}
            <HeroSection
              scrollY={scrollY}
              onEnterNexa={() => {
                if (session.isLoggedIn) {
                  setCurrentView('workspace');
                } else {
                  setCurrentView('signup');
                }
              }}
              onSeeHowItWorks={() => scrollToSection('features-showcase')}
            />

            {/* 2. Interactive NEXA Feature Showcase */}
            <NexaFeatureShowcase />

            {/* 3. High-Precision Enterprise Architecture (3 Cards) */}
            <NexaCoreCapabilities />

            {/* 4. Streamlined Cosmic Call to Action */}
            <CtaSection
              onEnterNexa={() => {
                if (session.isLoggedIn) {
                  setCurrentView('workspace');
                } else {
                  setCurrentView('signup');
                }
              }}
            />
          </main>

          <Footer />
        </div>
      )}
    </div>
  );
}
