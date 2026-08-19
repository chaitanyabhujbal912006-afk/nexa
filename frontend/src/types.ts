export type AppView =
  | 'landing'
  | 'neural-studio'
  | 'conflict-matrix'
  | 'cluster-topology'
  | 'settings-hub'
  | 'backend-docs';

export type ColorTheme = 'cyber-neon' | 'quantum-violet' | 'solar-plasma' | 'matrix-emerald';

export interface CitationItem {
  id: number;
  docName: string;
  docType: 'pdf' | 'docx' | 'xlsx' | 'eml' | 'cloud';
  pageOrSection: string;
  excerpt: string;
  relevanceScore: number;
  highlightText: string;
  provenanceHash?: string;
}

export interface ConflictRecord {
  id: string;
  topic: string;
  outdatedSource: {
    docName: string;
    snippet: string;
    date: string;
    confidence: number;
  };
  activeSource: {
    docName: string;
    snippet: string;
    date: string;
    confidence: number;
  };
  conflictDescription: string;
  verdict: string;
  verdictReason: string;
}

export interface QueryScenario {
  id: string;
  question: string;
  shortQuery: string;
  confidence: number;
  verifiedAnswer: string;
  highlightWords: { text: string; citationId: number }[];
  sourcesVerifiedCount: number;
  conflictDetected: boolean;
  conflictDetails?: {
    summary: string;
    resolution: string;
  };
  citations: CitationItem[];
}

export interface ExecutionStepTrace {
  id: string;
  label: string;
  stage: 'parsing' | 'embedding' | 'vector_search' | 'conflict_audit' | 'llm_synthesis' | 'provenance_seal';
  durationMs: number;
  status: 'pending' | 'running' | 'completed' | 'flagged';
  details: string;
}

export interface NexaSystemSettings {
  // 1. Neural & RAG Engine
  topK: number;
  minSimilarity: number;
  chunkOverlapPercent: number;
  rerankModel: 'nexa-cross-encoder-v2' | 'bge-reranker-large' | 'cohere-rerank-3';
  contextWindowTokens: number;

  // 2. Temporal Conflict Arbitration
  recencyWeight: number; // 0.0 to 1.0
  authorityWeight: number; // 0.0 to 1.0
  legalStatusBonus: number; // 0.0 to 1.0
  autoResolveThreshold: number; // 0.50 to 0.99
  strictnessMode: 'conservative' | 'balanced' | 'aggressive';

  // 3. Security & Cryptographic Provenance
  hashAlgorithm: 'SHA-256' | 'BLAKE3' | 'SHA-512';
  enablePiiRedaction: boolean;
  redactCreditCards: boolean;
  redactSsn: boolean;
  redactApiKeys: boolean;
  tamperProofAuditLog: boolean;

  // 4. Visual & Futuristic UI Engine
  colorTheme: ColorTheme;
  scanlinesIntensity: number; // 0 to 100
  holographicGlow: number; // 0 to 100
  particlePhysicsCount: number; // 20 to 150
  cyberGridEnabled: boolean;
  motionReduced: boolean;

  // 5. Audio Synthesizer Engine
  audioFxEnabled: boolean;
  masterVolume: number; // 0.0 to 1.0
  soundOnQuery: boolean;
  soundOnConflict: boolean;

  // 6. Backend & API Route
  backendUrl: string;
  useLiveBackend: boolean;
  activeModel: 'gemini-2.0-flash' | 'gemini-2.0-pro' | 'nexa-local-quantum-14b';
  apiKey: string;
  streamingSpeedMs: number;
}
