/**
 * api/client.ts
 * Centralised typed fetch wrapper for all NEXA backend requests.
 *
 * Features:
 *  - Reads base URL from VITE_API_BASE_URL env var
 *  - Attaches Authorization: Bearer <jwt> header automatically
 *  - Parses RFC 7807 error envelopes from backend
 *  - Throws typed ApiError on non-2xx responses
 *  - Handles 401 → clears JWT, emits logout event so App.tsx can redirect
 */

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://nexa-api-6hh5.onrender.com';
const JWT_KEY = 'nexa_jwt';

/** Returns the stored JWT token or null */
export function getToken(): string | null {
  return localStorage.getItem(JWT_KEY);
}

/** Persists a JWT token to localStorage */
export function setToken(token: string): void {
  localStorage.setItem(JWT_KEY, token);
}

/** Clears the JWT token (logout) */
export function clearToken(): void {
  localStorage.removeItem(JWT_KEY);
}

/** Emits a custom DOM event so App.tsx can react to forced logout */
function emitLogout(): void {
  window.dispatchEvent(new CustomEvent('nexa:logout'));
}

function buildHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set('Content-Type', 'application/json');
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

function buildMultipartHeaders(): Headers {
  // Do NOT set Content-Type for multipart — browser sets boundary automatically
  const headers = new Headers();
  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (HTTP ${response.status})`;
  let code = 'UNKNOWN_ERROR';
  try {
    const body = await response.json();
    // RFC 7807 format: { type, title, status, detail }
    if (body?.detail) {
      message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    }
    if (body?.title) {
      code = String(body.title).toUpperCase().replace(/\s+/g, '_');
    }
  } catch {
    // response body was not JSON
  }

  // Map common HTTP status codes to user-friendly messages
  if (response.status === 401) {
    message = 'Your session has expired. Please sign in again.';
    code = 'UNAUTHORIZED';
  } else if (response.status === 429) {
    message = 'Rate limit reached. Please wait a moment and try again.';
    code = 'RATE_LIMITED';
  } else if (response.status === 500) {
    message = 'The server encountered an error. Please try again.';
    code = 'SERVER_ERROR';
  } else if (response.status === 0 || !response.status) {
    message = 'Cannot reach the backend server. Is it running?';
    code = 'NETWORK_ERROR';
  }

  return { status: response.status, code, message };
}

/** Generic JSON fetch. Throws ApiError on non-2xx. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: buildHeaders(init?.headers),
    });
  } catch {
    throw { status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the backend server. Is it running?' } as ApiError;
  }

  if (!response.ok) {
    const err = await parseError(response);
    if (response.status === 401) {
      clearToken();
      emitLogout();
    }
    throw err;
  }

  // 204 No Content
  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

/** Multipart upload fetch (no Content-Type header — browser sets boundary). */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: buildMultipartHeaders(),
      body: formData,
    });
  } catch {
    throw { status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the backend server. Is it running?' } as ApiError;
  }

  if (!response.ok) {
    const err = await parseError(response);
    if (response.status === 401) {
      clearToken();
      emitLogout();
    }
    throw err;
  }

  return response.json() as Promise<T>;
}

/** Download a binary response as a Blob (used for PDF report). */
export async function apiDownload(path: string, body: unknown): Promise<Blob> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
  } catch {
    throw { status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the backend server. Is it running?' } as ApiError;
  }

  if (!response.ok) {
    const err = await parseError(response);
    throw err;
  }

  return response.blob();
}
