import { NextResponse } from 'next/server';
import { MOCK_PROVIDERS } from '@/lib/mock-data';

export const revalidate = 30; // 30s cache

export async function GET() {
  // In production: fetch from apps/api with live provider health
  return NextResponse.json({ providers: MOCK_PROVIDERS });
}
