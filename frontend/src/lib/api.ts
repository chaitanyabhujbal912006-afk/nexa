/**
 * Nexa Intelligence Engine API Client v3.0
 * Connects Next.js Frontend to FastAPI Backend (Render / Local)
 * Supports JWT Authentication, OTP Verification, and PDF Exports
 */

export interface Citation {
  source_name: string;
  source_type: string;
  doc_date: string;
  section: string;
  citation: string;
  match_score_pct: number;
}

export interface Conflict {
  topic: string;
  trusted_source: string;
  trusted_date: string;
  outdated_sources: { citation: string; date: string }[];
}

export interface QueryRequest {
  query: string;
  top_k?: number;
  history?: { role: string; content: string }[];
}

export interface QueryResponse {
  call_id: string;
  query: string;
  answer: string;
  confidence_level: "HIGH" | "MEDIUM" | "LOW" | "NONE";
  conflicts_detected: Conflict[];
  citations: Citation[];
  total_chunks_retrieved: number;
  provider: string;
  latency_ms: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  provider: string;
  embedding_model: string;
  kb_stats: {
    pdfs: number;
    excel: number;
    csv: number;
    emails: number;
  };
}

export interface DocumentItem {
  name: string;
  type: string;
  size_bytes: number;
  chunks: number;
  date?: string;
}

export interface AuditEntry {
  call_id: string;
  timestamp: string;
  query: string;
  answer_preview: string;
  confidence_level: string;
  latency_ms: number;
  total_chunks_retrieved: number;
  citations: Citation[];
  conflicts_detected: Conflict[];
  flagged?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('nexa_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexa_token', token);
  }
}

export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nexa_token');
    localStorage.removeItem('nexa_user_email');
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (API_KEY) {
    headers['X-API-Key'] = API_KEY;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
    throw new Error(errorData.detail?.detail || errorData.detail || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth Endpoints
  sendOtp: (email: string) =>
    fetchApi<{ status: string; email: string; message: string }>('/api/v1/auth/otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (email: string, code: string) =>
    fetchApi<AuthResponse>('/api/v1/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    }),

  // System & Knowledge Endpoints
  getHealth: () => fetchApi<HealthResponse>('/api/v1/health'),
  
  query: (req: QueryRequest) =>
    fetchApi<QueryResponse>('/api/v1/query', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  listDocuments: () => fetchApi<{ total_count: number; documents: DocumentItem[] }>('/api/v1/documents'),

  deleteDocument: (docName: string) =>
    fetchApi<{ status: string; document: string; vector_chunks_removed: number }>(
      `/api/v1/documents/${encodeURIComponent(docName)}`,
      { method: 'DELETE' }
    ),

  getConflicts: () => fetchApi<{ conflicts_count: number; conflicts: Conflict[] }>('/api/v1/conflicts'),

  getAuditLog: (n = 50) =>
    fetchApi<{ total_returned: number; entries: AuditEntry[] }>(`/api/v1/audit?n=${n}`),

  triggerIngest: () =>
    fetchApi<{ status: string; total_chunks: number; latency_ms: number }>('/api/v1/ingest', {
      method: 'POST',
    }),

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail?.detail || err.detail || 'Upload failed');
    }

    return res.json();
  },

  downloadPdfReport: async (title: string, summaryText: string, citations: Citation[] = []) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/reports/pdf`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        title,
        summary_text: summaryText,
        citations,
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to generate PDF report.');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexa_executive_report_${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};
