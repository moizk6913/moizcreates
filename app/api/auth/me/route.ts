import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const isAuthenticated = verifyAdminSession(request);

  if (!isAuthenticated) {
    return NextResponse.json(
      { authenticated: false, role: null },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    role: 'admin',
    user: 'Moiz Khan',
  });
}
