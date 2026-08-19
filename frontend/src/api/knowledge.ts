/**
 * api/knowledge.ts
 * Knowledge, Query, Documents, and Conflicts service layer.
 *
 * All calls require a valid JWT (attached automatically by client.ts).
 */

import { apiFetch, apiUpload, apiDownload } from './client';
import {
  KnowledgeDocument,
  QueryResult,
  CitationItem,
  ConflictRecord,
} from '../types';

// ── Backend Response Types ──────────────────────────────────────────────────

interface BackendCitation {
  source_name: string;
  source_type: string;
  doc_date: string;
  section: string;
  citation: string;
  match_score_pct: number;
}

interface BackendConflictOutdated {
  citation: string;
  date: string;
}

interface BackendConflict {
  topic: string;
  trusted_source: string;
  trusted_date: string;
  outdated_sources: BackendConflictOutdated[];
}

interface BackendQueryResponse {
  call_id: string;
  query: string;
  answer: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  conflicts_detected: BackendConflict[];
  citations: BackendCitation[];
  total_chunks_retrieved: number;
  provider: string;
  latency_ms: number;
}

interface BackendDocumentItem {
  name: string;
  type: string;
  size_bytes: number;
  chunks: number;
}

interface BackendDocumentsResponse {
  total_count: number;
  documents: BackendDocumentItem[];
}

interface BackendConflictsResponse {
  conflicts_count: number;
  conflicts: BackendConflict[];
}

interface BackendUploadResponse {
  status: string;
  file: string;
  bytes: number;
  ingestion_summary?: unknown;
  ingestion?: string;
}

interface BackendDeleteResponse {
  status: string;
  document: string;
  vector_chunks_removed: number;
}

// ── Mapping helpers ─────────────────────────────────────────────────────────

function mapCitations(raw: BackendCitation[]): CitationItem[] {
  return raw.map((c, idx) => ({
    id: idx + 1,
    label: String(idx + 1),
    sourceDoc: c.source_name,
    sourceType: c.source_type as CitationItem['sourceType'],
    docDate: c.doc_date,
    section: c.section,
    excerpt: c.citation,
    matchScorePct: c.match_score_pct,
    confidence: c.match_score_pct,
  }));
}

function mapConflicts(raw: BackendConflict[]): ConflictRecord[] {
  return raw.map((c, idx) => ({
    id: `conflict-${idx}-${c.topic}`,
    topic: c.topic,
    trustedSource: c.trusted_source,
    trustedDate: c.trusted_date,
    trustedClaim: c.trusted_source, // backend doesn't return a separate claim text
    outdatedSources: c.outdated_sources.map((o) => ({
      citation: o.citation,
      date: o.date,
      claim: o.citation,
    })),
    verdictSummary: `${c.trusted_source} (${c.trusted_date}) supersedes ${c.outdated_sources.length} outdated source(s).`,
    ruleApplied: 'Rule A (Temporal Supersession)' as const,
    resolved: false,
  }));
}

function confidenceToNumber(level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'): number {
  const map: Record<string, number> = { HIGH: 97, MEDIUM: 75, LOW: 50, NONE: 0 };
  return map[level] ?? 0;
}

function mapDocument(d: BackendDocumentItem): KnowledgeDocument {
  const sizeKb = d.size_bytes / 1024;
  const size = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb.toFixed(0)} KB`;
  return {
    id: d.name,
    title: d.name,
    type: d.type as KnowledgeDocument['type'],
    date: new Date().toISOString().split('T')[0],
    status: 'active',
    department: 'General',
    confidence: 98,
    conflictsCount: 0,
    size,
    size_bytes: d.size_bytes,
    vectorCount: d.chunks,
  };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/query
 * Execute a RAG query and return a typed QueryResult.
 */
export async function runQuery(
  query: string,
  topK: number = 5,
  history: Array<{ role: string; content: string }> = []
): Promise<QueryResult> {
  const raw = await apiFetch<BackendQueryResponse>('/api/v1/query', {
    method: 'POST',
    body: JSON.stringify({ query, top_k: topK, history }),
  });

  const citations = mapCitations(raw.citations);
  const conflicts = mapConflicts(raw.conflicts_detected);
  const conflictDetected = conflicts.length > 0;

  return {
    id: raw.call_id,
    call_id: raw.call_id,
    query: raw.query,
    answerText: raw.answer,
    confidence: confidenceToNumber(raw.confidence_level),
    confidence_level: raw.confidence_level,
    sourcesVerifiedCount: raw.total_chunks_retrieved,
    total_chunks_retrieved: raw.total_chunks_retrieved,
    provider: raw.provider as QueryResult['provider'],
    latencyMs: raw.latency_ms,
    conflictDetected,
    conflictDetails: conflictDetected && conflicts[0]
      ? {
          outdatedSource: conflicts[0].outdatedSources[0]?.citation ?? '',
          outdatedDate: conflicts[0].outdatedSources[0]?.date ?? '',
          outdatedClaim: conflicts[0].outdatedSources[0]?.claim ?? '',
          outdatedConfidence: 60,
          activeSource: conflicts[0].trustedSource,
          activeDate: conflicts[0].trustedDate,
          activeClaim: conflicts[0].trustedClaim,
          activeConfidence: 97,
          verdict: conflicts[0].verdictSummary,
        }
      : undefined,
    citations,
  };
}

/**
 * GET /api/v1/documents
 * List all indexed documents in the knowledge base.
 */
export async function listDocuments(): Promise<KnowledgeDocument[]> {
  const resp = await apiFetch<BackendDocumentsResponse>('/api/v1/documents');
  return resp.documents.map(mapDocument);
}

/**
 * POST /api/v1/upload (multipart/form-data)
 * Upload and ingest a new document.
 */
export async function uploadDocument(file: File): Promise<BackendUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiUpload<BackendUploadResponse>('/api/v1/upload', formData);
}

/**
 * DELETE /api/v1/documents/{name}
 * Delete a document and purge its vector chunks.
 */
export async function deleteDocument(docName: string): Promise<BackendDeleteResponse> {
  return apiFetch<BackendDeleteResponse>(
    `/api/v1/documents/${encodeURIComponent(docName)}`,
    { method: 'DELETE' }
  );
}

/**
 * GET /api/v1/conflicts
 * Run a full conflict scan across the knowledge base.
 */
export async function scanConflicts(): Promise<ConflictRecord[]> {
  const resp = await apiFetch<BackendConflictsResponse>('/api/v1/conflicts');
  return mapConflicts(resp.conflicts);
}

/**
 * GET /api/v1/health
 * System health check — used to verify backend connectivity.
 */
export async function checkHealth(): Promise<{ status: string; provider: string; version: string }> {
  return apiFetch('/api/v1/health');
}

/**
 * POST /api/v1/reports/pdf
 * Generate and download an executive PDF report.
 * Returns a Blob which the caller should trigger as a browser download.
 */
export async function generateReport(
  title: string,
  summaryText: string,
  citations: CitationItem[] = []
): Promise<Blob> {
  const backendCitations = citations.map((c) => ({
    source_name: c.sourceDoc,
    source_type: c.sourceType ?? 'pdf',
    doc_date: c.docDate ?? '',
    section: c.section ?? '',
    citation: c.excerpt,
    match_score_pct: c.matchScorePct ?? 0,
  }));
  return apiDownload('/api/v1/reports/pdf', {
    title,
    summary_text: summaryText,
    citations: backendCitations,
  });
}
