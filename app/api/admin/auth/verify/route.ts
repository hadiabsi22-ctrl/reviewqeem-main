// ==================== Verify Admin Token ====================

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/middleware/auth';
import { ApiResponse } from '@/types';

async function handler(req: NextRequest, admin: any) {
  return NextResponse.json({
    success: true,
    data: { admin },
  } as ApiResponse);
}

export const GET = requireAuth(handler);
