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

function getBaseUrl(): string {
  const envUrl = (import.meta.env.VITE_API_BASE_URL as string) || '';
  let target = envUrl;
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      target = 'https://nexa-api-6hh5.onrender.com';
    }
  }
  if (!target) {
    target = 'https://nexa-api-6hh5.onrender.com';
  }
  return target.replace(/\/+$/, ''); // Strip trailing slash to avoid double-slash URL errors
}

const BASE_URL = getBaseUrl();
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

/**
 * Fetch wrapper with 60s timeout and exponential backoff retry for Render cold-starts.
 * Retries on network errors and 502/503/504 gateway responses while backend warms up.
 */
async function fetchWithRetry(url: string, init?: RequestInit, maxRetries = 3): Promise<Response> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s cold-start timeout

      const response = await fetch(url, {
        ...init,
        signal: init?.signal ?? controller.signal,
      });

      clearTimeout(timeoutId);

      // Retry on 502/503/504 while Render cold-starts
      if ((response.status === 502 || response.status === 503 || response.status === 504) && attempt < maxRetries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        continue;
      }

      return response;
    } catch (err) {
      if (attempt < maxRetries) {
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, attempt * 3000));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries exceeded');
}

async function parseError(response: Response): Promise<ApiError> {
  let message = `Request failed (HTTP ${response.status})`;
  let code = 'UNKNOWN_ERROR';
  try {
    const body = await response.json();
    if (body?.detail) {
      message = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail);
    }
    if (body?.title) {
      code = String(body.title).toUpperCase().replace(/\s+/g, '_');
    }
  } catch {
    // response body was not JSON
  }

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
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  try {
    response = await fetchWithRetry(fullUrl, {
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

  if (response.status === 204) return undefined as unknown as T;

  return response.json() as Promise<T>;
}

/** Multipart upload fetch (no Content-Type header — browser sets boundary). */
export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  let response: Response;
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  try {
    response = await fetchWithRetry(fullUrl, {
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
  const fullUrl = `${BASE_URL}${path.startsWith('/') ? path : '/' + path}`;
  try {
    response = await fetchWithRetry(fullUrl, {
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
