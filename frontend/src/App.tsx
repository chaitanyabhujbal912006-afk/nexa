import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SearchQuerySection } from './components/SearchQuerySection';
import { FeaturesGrid } from './components/FeaturesGrid';
import { KnowledgeChaosSection } from './components/KnowledgeChaosSection';
import { ConflictDetectionSection } from './components/ConflictDetectionSection';
import { CitationEvidenceSection } from './components/CitationEvidenceSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { DocumentModal } from './components/DocumentModal';
import { GetStartedModal } from './components/GetStartedModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { NeuralQueryStudio } from './components/NeuralQueryStudio';
import { ConflictMatrixView } from './components/ConflictMatrixView';
import { ClusterTopologyView } from './components/ClusterTopologyView';
import { SettingsCenter } from './components/SettingsCenter';
import { BackendIntegrationView } from './components/BackendIntegrationView';
import { SCENARIOS } from './data/mockKnowledge';
import { AppView, CitationItem, ColorTheme, NexaSystemSettings, QueryScenario } from './types';
import { playFuturisticSound } from './utils/audioFx';

export default function App() {
  // App Navigation View
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Master System Settings
  const [systemSettings, setSystemSettings] = useState<NexaSystemSettings>({
    topK: 5,
    minSimilarity: 0.75,
    chunkOverlapPercent: 20,
    rerankModel: 'nexa-cross-encoder-v2',
    contextWindowTokens: 32000,
    recencyWeight: 0.65,
    authorityWeight: 0.35,
    legalStatusBonus: 0.15,
    autoResolveThreshold: 0.85,
    strictnessMode: 'balanced',
    hashAlgorithm: 'SHA-256',
    enablePiiRedaction: true,
    redactCreditCards: true,
    redactSsn: true,
    redactApiKeys: true,
    tamperProofAuditLog: true,
    colorTheme: 'cyber-neon',
    scanlinesIntensity: 50,
    holographicGlow: 70,
    particlePhysicsCount: 60,
    cyberGridEnabled: true,
    motionReduced: false,
    audioFxEnabled: true,
    masterVolume: 0.4,
    soundOnQuery: true,
    soundOnConflict: true,
    backendUrl: '',
    useLiveBackend: false,
    activeModel: 'gemini-2.0-flash',
    apiKey: '',
    streamingSpeedMs: 15,
  });

  // Query & Scenario state
  const [activeQueryKey, setActiveQueryKey] = useState<string>('refund');
  const [activeScenario, setActiveScenario] = useState<QueryScenario>(SCENARIOS.refund);
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<CitationItem | null>(null);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [getStartedMode, setGetStartedMode] = useState<'signup' | 'login' | 'demo'>('signup');
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);

  // Sync data-theme attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', systemSettings.colorTheme);
  }, [systemSettings.colorTheme]);

  // Cycle color themes
  const handleToggleTheme = () => {
    const themeCycle: ColorTheme[] = ['cyber-neon', 'quantum-violet', 'solar-plasma', 'matrix-emerald'];
    const currentIndex = themeCycle.indexOf(systemSettings.colorTheme);
    const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length];
    setSystemSettings((prev) => ({ ...prev, colorTheme: nextTheme }));
  };

  // Toggle audio sound effects
  const handleToggleAudio = () => {
    setSystemSettings((prev) => ({ ...prev, audioFxEnabled: !prev.audioFxEnabled }));
  };

  // Handle queries in landing search bar
  const handleRunQuery = (query: string) => {
    const lower = query.toLowerCase();
    playFuturisticSound('laser-ping', systemSettings.audioFxEnabled, systemSettings.masterVolume);

    if (lower.includes('warranty') || lower.includes('sla') || lower.includes('hardware')) {
      setActiveQueryKey('warranty');
      setActiveScenario(SCENARIOS.warranty);
    } else if (lower.includes('sabbatical') || lower.includes('leave') || lower.includes('tenure')) {
      setActiveQueryKey('sabbatical');
      setActiveScenario(SCENARIOS.sabbatical);
    } else {
      setActiveQueryKey('refund');
      setActiveScenario(SCENARIOS.refund);
    }

    const el = document.querySelector('#citation-evidence-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenDocModal = (docName: string) => {
    setSelectedDocName(docName);
    setSelectedCitation(null);
    playFuturisticSound('click', systemSettings.audioFxEnabled, systemSettings.masterVolume * 0.4);
  };

  const handleOpenCitationModal = (citation: CitationItem) => {
    setSelectedCitation(citation);
    setSelectedDocName(citation.docName);
    playFuturisticSound('quantum-chime', systemSettings.audioFxEnabled, systemSettings.masterVolume * 0.4);
  };

  const handleCloseDocModal = () => {
    setSelectedDocName(null);
    setSelectedCitation(null);
  };

  const handleOpenGetStarted = (mode: 'signup' | 'login' | 'demo' = 'signup') => {
    setGetStartedMode(mode);
    setIsGetStartedOpen(true);
    playFuturisticSound('quantum-chime', systemSettings.audioFxEnabled, systemSettings.masterVolume);
  };

  return (
    <div className={`min-h-screen bg-[var(--theme-bg)] text-slate-100 flex flex-col relative selection:bg-[var(--theme-primary)] selection:text-slate-950 ${systemSettings.cyberGridEnabled ? 'cyber-grid-bg' : ''}`}>
      {/* Background Animated Neon Glow Beams */}
      <div className="fixed top-0 left-1/4 w-[650px] h-[650px] bg-[var(--theme-primary)]/10 rounded-full blur-[160px] pointer-events-none -z-10 animate-float-slow" />
      <div className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] bg-[var(--theme-secondary)]/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-float-delay" />

      {/* Cyber Scanline Overlay */}
      {systemSettings.scanlinesIntensity > 0 && (
        <div
          className="fixed inset-0 cyber-scanlines pointer-events-none z-40"
          style={{ opacity: systemSettings.scanlinesIntensity / 100 }}
        />
      )}

      {/* Futuristic Floating Header */}
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        colorTheme={systemSettings.colorTheme}
        onToggleTheme={handleToggleTheme}
        audioFxEnabled={systemSettings.audioFxEnabled}
        onToggleAudio={handleToggleAudio}
        onOpenGetStarted={() => handleOpenGetStarted('signup')}
      />

      {/* Dynamic Main View Switcher */}
      <main className="flex-grow pt-24 sm:pt-28 pb-20 px-4 sm:px-6 md:px-10 max-w-[1440px] mx-auto w-full flex flex-col gap-16 sm:gap-24 relative z-10">
        {/* VIEW 1: Landing Experience */}
        {currentView === 'landing' && (
          <>
            <HeroSection
              colorTheme={systemSettings.colorTheme}
              onEnterNeuralStudio={() => {
                setCurrentView('neural-studio');
                playFuturisticSound('quantum-chime', systemSettings.audioFxEnabled, systemSettings.masterVolume);
              }}
              onExploreGraph={() => {
                const el = document.querySelector('#quantum-graph-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectDocument={handleOpenDocModal}
            />

            <SearchQuerySection
              onRunQuery={handleRunQuery}
              activeQuery={activeScenario.shortQuery}
            />

            <FeaturesGrid />

            <KnowledgeChaosSection onSelectDoc={handleOpenDocModal} />

            <ConflictDetectionSection onInspectDoc={handleOpenDocModal} />

            <CitationEvidenceSection
              scenario={activeScenario}
              onOpenCitationModal={handleOpenCitationModal}
            />

            <ArchitectureSection
              onOpenArchitectureDetails={() => setIsArchitectureModalOpen(true)}
            />

            <CtaSection
              onGetStarted={() => handleOpenGetStarted('signup')}
              onExplore={() => {
                setCurrentView('neural-studio');
                playFuturisticSound('quantum-chime', systemSettings.audioFxEnabled, systemSettings.masterVolume);
              }}
            />
          </>
        )}

        {/* VIEW 2: Live Neural Studio */}
        {currentView === 'neural-studio' && (
          <NeuralQueryStudio
            settings={systemSettings}
            onOpenCitationModal={handleOpenCitationModal}
          />
        )}

        {/* VIEW 3: Conflict Matrix Studio */}
        {currentView === 'conflict-matrix' && (
          <ConflictMatrixView
            settings={systemSettings}
            onInspectDoc={handleOpenDocModal}
          />
        )}

        {/* VIEW 4: Cluster Topology & Telemetry */}
        {currentView === 'cluster-topology' && (
          <ClusterTopologyView settings={systemSettings} />
        )}

        {/* VIEW 5: In-App Backend Hub */}
        {currentView === 'backend-docs' && (
          <BackendIntegrationView settings={systemSettings} />
        )}

        {/* VIEW 6: Hyper-Granular Settings Hub */}
        {currentView === 'settings-hub' && (
          <SettingsCenter
            settings={systemSettings}
            onUpdateSettings={setSystemSettings}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacy={() => handleOpenGetStarted('demo')}
        onOpenTerms={() => handleOpenGetStarted('demo')}
        onOpenSecurity={() => setIsArchitectureModalOpen(true)}
        onOpenApi={() => setCurrentView('backend-docs')}
      />

      {/* Interactive Modals */}
      <DocumentModal
        documentName={selectedDocName}
        citationItem={selectedCitation}
        onClose={handleCloseDocModal}
      />

      <GetStartedModal
        isOpen={isGetStartedOpen}
        initialMode={getStartedMode}
        onClose={() => setIsGetStartedOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
    </div>
  );
}
