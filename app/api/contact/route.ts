import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getClientIp } from '@/lib/auth';

// Rate Limiter: max 5 inquiries per hour per IP
const contactRateLimits = new Map<string, { count: number; resetAt: number }>();

function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = contactRateLimits.get(ip);
  if (!entry) return false;
  if (now > entry.resetAt) {
    contactRateLimits.delete(ip);
    return false;
  }
  return entry.count >= 5;
}

function recordContactSubmission(ip: string): void {
  const now = Date.now();
  const entry = contactRateLimits.get(ip) || { count: 0, resetAt: now + 60 * 60 * 1000 };
  entry.count += 1;
  contactRateLimits.set(ip, entry);
}

function sanitizeInput(str: string): string {
  return str
    .replace(/[<>]/g, '') // Strip brackets to prevent script injection
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limit Check
    if (isContactRateLimited(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please wait a while before sending another inquiry.',
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, message, subject, service, budget, _hp, _website } = body;

    // 2. Honeypot Anti-Spam Check
    if (_hp || _website) {
      // Silently return success to fool spam bots without saving junk
      return NextResponse.json({
        success: true,
        message: 'Inquiry received. The studio will get back to you shortly.',
      });
    }

    // 3. Server-side Field Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid name (2–100 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 5000) {
      return NextResponse.json(
        { success: false, error: 'Message must be between 10 and 5,000 characters.' },
        { status: 400 }
      );
    }

    // 4. Record rate limit
    recordContactSubmission(ip);

    // 5. Hash IP for privacy compliance
    const ipHash = crypto.createHash('sha256').update(ip + 'salt-contact-2026').digest('hex').slice(0, 16);

    // 6. Save Inquiry to Database
    const savedInquiry = await db.inquiries.create({
      name: sanitizeInput(name),
      email: email.trim().toLowerCase(),
      message: sanitizeInput(message),
      subject: subject ? sanitizeInput(subject) : undefined,
      service: service ? sanitizeInput(service) : undefined,
      budget: budget ? sanitizeInput(budget) : undefined,
      ipHash,
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry successfully transmitted to Moiz Khan Studio.',
      inquiryId: savedInquiry.id,
    });
  } catch (error: any) {
    console.error('[Contact API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry. Please email directly.' },
      { status: 500 }
    );
  }
}
