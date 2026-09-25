import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  createSessionToken,
  setSessionCookie,
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  resetFailedAttempts,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limiter Check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed login attempts. Please wait 15 minutes before trying again.',
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Password is required.' },
        { status: 400 }
      );
    }

    // 2. Validate Password with constant-time equality
    const isValid = verifyAdminPassword(password);

    if (!isValid) {
      const { remainingAttempts, isBlocked } = recordFailedAttempt(ip);
      const msg = isBlocked
        ? 'Account temporarily locked for 15 minutes due to multiple failed attempts.'
        : `Invalid password. ${remainingAttempts} attempt(s) remaining.`;

      return NextResponse.json(
        { success: false, error: msg, remainingAttempts },
        { status: 401 }
      );
    }

    // 3. Reset rate limiter and generate session token
    resetFailedAttempts(ip);
    const token = createSessionToken();

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Studio Desk unlocked.',
      authenticated: true,
    });

    setSessionCookie(response, token);
    return response;
  } catch (error) {
    console.error('[Auth Login] Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
