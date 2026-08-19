/**
 * api/auth.ts
 * Authentication service — Email OTP flow matching the backend.
 *
 * Flow:
 *  Step 1: sendOtp(email)    → POST /api/v1/auth/otp
 *  Step 2: verifyOtp(email, code) → POST /api/v1/auth/verify → returns JWT
 *
 * JWT is stored in localStorage via client.setToken().
 * Profile fields not returned by backend (fullName, role, company) are
 * stored in localStorage under 'nexa_profile' and merged into UserSession.
 */

import { apiFetch, setToken, clearToken, getToken } from './client';

// ── Backend Response Types ──────────────────────────────────────────────────

interface OtpSentResponse {
  status: string;
  email: string;
  message: string;
}

interface VerifyResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  email: string;
}

// ── Profile (stored locally — backend has no profile endpoint yet) ──────────

export interface LocalProfile {
  fullName: string;
  role: string;
  company: string;
}

const PROFILE_KEY = 'nexa_profile';

export function saveLocalProfile(profile: LocalProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadLocalProfile(): LocalProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as LocalProfile;
  } catch {
    // ignore
  }
  return { fullName: '', role: '', company: '' };
}

export function clearLocalProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}

// ── Auth API calls ──────────────────────────────────────────────────────────

/**
 * Step 1 — Request an OTP for the given email.
 * Backend always returns { status: "otp_sent", email, message }.
 * In demo mode, the code is always "123456".
 */
export async function sendOtp(email: string): Promise<OtpSentResponse> {
  return apiFetch<OtpSentResponse>('/api/v1/auth/otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Step 2 — Verify OTP code and receive JWT token.
 * Automatically stores the token in localStorage.
 * Returns the raw backend response (access_token, user_id, email).
 */
export async function verifyOtp(email: string, code: string): Promise<VerifyResponse> {
  const resp = await apiFetch<VerifyResponse>('/api/v1/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
  setToken(resp.access_token);
  return resp;
}

/**
 * Restore session from localStorage JWT.
 * Returns the stored user_id + email + local profile if token exists.
 * Returns null if no token is stored.
 */
export function restoreSession(): { userId: string; email: string } & LocalProfile | null {
  const token = getToken();
  if (!token) return null;

  try {
    // Decode the JWT payload (base64url) without verifying signature (client-side only)
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return null;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    // Check expiry
    const exp: number = payload.exp ?? 0;
    if (exp && Date.now() / 1000 > exp) {
      clearToken();
      return null;
    }

    const profile = loadLocalProfile();
    return {
      userId: payload.sub ?? '',
      email: payload.email ?? '',
      ...profile,
    };
  } catch {
    clearToken();
    return null;
  }
}

/**
 * Logout — clears JWT and local profile from storage.
 */
export function logout(): void {
  clearToken();
  clearLocalProfile();
}
