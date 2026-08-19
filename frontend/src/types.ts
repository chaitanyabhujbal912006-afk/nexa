export type ScreenView = 'landing' | 'login' | 'signup' | 'workspace' | 'settings' | 'profile';

export type WorkspaceTab = 
  | 'overview'
  | 'chatbot'
  | 'query'
  | 'documents'
  | 'conflicts'
  | 'topology'
  | 'audit'
  | 'reports'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  confidence?: number;
  confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW';
  provider?: string;
  latencyMs?: number;
  citations?: CitationItem[];
  conflictDetected?: boolean;
  conflictNote?: string;
  attachedDocs?: string[];
}

export type SettingsSubTab =
  | 'profile'
  | 'api'
  | 'rag'
  | 'membership'
  | 'security'
  | 'notifications'
  | 'preferences';

export interface SystemNotificationItem {
  id: string;
  sender: string;
  avatar: string;
  actionText: string;
  timeAgo: string;
  unread: boolean;
  type: 'security' | 'document' | 'conflict' | 'system';
}

export interface DocumentChunk {
  chunkIndex: number;
  totalChunks: number;
  text: string;
  matchScorePct: number;
  sha256: string;
  section: string;
}

export interface CitationItem {
  id: number;
  label: string;
  sourceDoc: string;
  sourceType?: 'pdf' | 'excel' | 'csv' | 'email' | 'txt' | 'docx' | 'eml' | 'xlsx';
  docDate?: string;
  section?: string;
  excerpt: string;
  matchScorePct?: number;
  timestamp?: string;
  confidence?: number;
}

export interface ConflictRecord {
  id: string;
  topic: string;
  trustedSource: string;
  trustedDate: string;
  trustedClaim: string;
  outdatedSources: Array<{
    citation: string;
    date: string;
    claim: string;
  }>;
  verdictSummary: string;
  ruleApplied: 'Rule A (Temporal Supersession)' | 'Rule B (MSA Over Handbook)';
  resolved: boolean;
}

export interface QueryResult {
  id: string;
  call_id?: string;
  query: string;
  answerText: string;
  confidence: number;
  confidence_level?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  sourcesVerifiedCount: number;
  total_chunks_retrieved?: number;
  provider?: 'gemini' | 'groq';
  latencyMs?: number;
  conflictDetected: boolean;
  conflictDetails?: {
    outdatedSource: string;
    outdatedDate: string;
    outdatedClaim: string;
    outdatedConfidence: number;
    activeSource: string;
    activeDate: string;
    activeClaim: string;
    activeConfidence: number;
    verdict: string;
  };
  citations: CitationItem[];
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'xlsx' | 'eml' | 'txt' | 'csv' | 'folder';
  date: string;
  status: 'active' | 'outdated' | 'superseded' | 'syncing';
  department: string;
  confidence: number;
  conflictsCount: number;
  size: string;
  size_bytes?: number;
  vectorCount?: number;
  tags?: string[];
  lastUpdated?: string;
  author?: string;
  hash?: string;
  chunks?: DocumentChunk[];
}

export interface TopologyNode {
  id: string;
  label: string;
  type: 'pdf' | 'xlsx' | 'eml' | 'csv' | 'txt';
  chunk_count: number;
  size: string;
  department: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface TopologyEdge {
  source: string;
  target: string;
  similarity_score: number;
}

export interface AuditLedgerEntry {
  call_id: string;
  timestamp: string;
  query: string;
  answer: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  provider: 'gemini' | 'groq';
  latency_ms: number;
  chunks_retrieved_count: number;
  conflicts_detected_count: number;
  ipAddress?: string;
  actor?: string;
}

export interface ExecutiveReport {
  id: string;
  title: string;
  summaryText: string;
  generatedDate: string;
  author: string;
  citations: CitationItem[];
  downloadUrl?: string;
}

export interface RagEngineSettings {
  top_k: number;
  min_similarity: number;
  chunk_overlap_pct: number;
  context_window_tokens: number;
  recency_weight: number;
  authority_weight: number;
  legal_status_bonus: number;
  auto_resolve_threshold: number;
  strictness_mode: 'lenient' | 'balanced' | 'strict';
  hash_algorithm: 'SHA-256' | 'SHA-512' | 'MD5';
  audit_ledger_enabled: boolean;
}

export interface UserSession {
  userId?: string;           // Backend-assigned user ID (usr_...)
  fullName: string;
  email: string;
  role: string;
  company: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  selectedPlan?: 'Free' | 'Professional' | 'Enterprise';
  notificationsEnabled?: boolean;
  twoFactorEnabled?: boolean;
  apiKey?: string;
  themePreference?: 'acid-lime' | 'cyber-lavender' | 'electric-cyan';
  embeddingModel?: string;
  autoResolveConfidenceThreshold?: number;
  connectedIntegrations?: {
    googleDrive: boolean;
    slack: boolean;
    notion: boolean;
    salesforce: boolean;
    confluence: boolean;
    github: boolean;
  };
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  keyPrefix?: string;
  createdDate: string;
  lastUsed: string;
  expiryDays?: number | string;
  permissions: 'read-only' | 'read-write' | 'admin';
  status: 'active' | 'revoked';
}

export interface SessionDevice {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: 'success' | 'flagged' | 'blocked';
  ipAddress: string;
}

