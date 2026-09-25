import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE_NAME = 'moiz_admin_session';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Fallbacks are provided for local dev if environment variables are not yet populated
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'moizstudio2026';
const AUTH_SECRET = process.env.AUTH_SECRET || 'moiz-portfolio-secure-session-secret-2026-hyper-fluid';

// Rate Limiter: max 5 failed attempts per 15 minutes per IP
interface RateLimitEntry {
  attempts: number;
  blockedUntil: number;
}
const loginAttemptsMap = new Map<string, RateLimitEntry>();

export function isRateLimited(ip: string): boolean {
  const entry = loginAttemptsMap.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.blockedUntil) {
    loginAttemptsMap.delete(ip);
    return false;
  }
  return entry.attempts >= 5;
}

export function recordFailedAttempt(ip: string): { remainingAttempts: number; isBlocked: boolean } {
  const now = Date.now();
  const entry = loginAttemptsMap.get(ip) || { attempts: 0, blockedUntil: now + 15 * 60 * 1000 };
  entry.attempts += 1;
  entry.blockedUntil = now + 15 * 60 * 1000;
  loginAttemptsMap.set(ip, entry);

  return {
    remainingAttempts: Math.max(0, 5 - entry.attempts),
    isBlocked: entry.attempts >= 5,
  };
}

export function resetFailedAttempts(ip: string): void {
  loginAttemptsMap.delete(ip);
}

// Constant-time password verification to prevent timing attacks
export function verifyAdminPassword(inputPassword: string): boolean {
  if (!inputPassword || typeof inputPassword !== 'string') return false;

  const targetBuf = Buffer.from(ADMIN_PASSWORD, 'utf-8');
  const inputBuf = Buffer.from(inputPassword, 'utf-8');

  if (targetBuf.length !== inputBuf.length) {
    // Constant-time dummy comparison to prevent length timing leaks
    crypto.timingSafeEqual(targetBuf, targetBuf);
    return false;
  }

  return crypto.timingSafeEqual(targetBuf, inputBuf);
}

export interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

export function createSessionToken(): string {
  const payload: SessionPayload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Verify HMAC signature in constant time
  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSig);

  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as SessionPayload;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export function verifyAdminSession(request: Request | NextRequest): boolean {
  // 1. Check NextRequest cookies (Next.js official API)
  try {
    if ('cookies' in request && typeof (request as any).cookies?.get === 'function') {
      const nextCookie = (request as any).cookies.get(AUTH_COOKIE_NAME);
      if (nextCookie?.value && verifySessionToken(nextCookie.value)) return true;
    }
  } catch {}

  // 2. Check standard Cookie header
  const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie') || '';
  if (cookieHeader) {
    const pairs = cookieHeader.split(';');
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const key = pair.slice(0, idx).trim();
        const val = pair.slice(idx + 1).trim();
        if (key === AUTH_COOKIE_NAME && verifySessionToken(decodeURIComponent(val))) {
          return true;
        }
      }
    }
  }

  // 3. Fallback to Authorization Header (Bearer token)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authHeader.slice(7).trim();
    if (verifySessionToken(bearerToken)) return true;
  }

  return false;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
