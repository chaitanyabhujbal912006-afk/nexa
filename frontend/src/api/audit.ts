/**
 * api/audit.ts
 * Audit Ledger service — fetches real JSONL log entries from the backend.
 */

import { apiFetch } from './client';
import { AuditLedgerEntry } from '../types';

interface BackendAuditEntry {
  call_id: string;
  timestamp: string;
  query: string;
  answer: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  provider: 'gemini' | 'groq';
  latency_ms: number;
  hits?: number;
  conflicts_count?: number;
}

interface BackendAuditResponse {
  total_returned: number;
  entries: BackendAuditEntry[];
}

function mapAuditEntry(e: BackendAuditEntry): AuditLedgerEntry {
  return {
    call_id: e.call_id,
    timestamp: e.timestamp,
    query: e.query,
    answer: e.answer,
    confidence_level: e.confidence_level,
    provider: e.provider,
    latency_ms: e.latency_ms,
    chunks_retrieved_count: e.hits ?? 0,
    conflicts_detected_count: e.conflicts_count ?? 0,
  };
}

/**
 * GET /api/v1/audit?n={n}
 * Fetches the most recent `n` audit log entries.
 */
export async function fetchAuditLog(n: number = 100): Promise<AuditLedgerEntry[]> {
  const resp = await apiFetch<BackendAuditResponse>(`/api/v1/audit?n=${n}`);
  return resp.entries.map(mapAuditEntry);
}
