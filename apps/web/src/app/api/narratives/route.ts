import { NextRequest, NextResponse } from 'next/server';
import { MOCK_NARRATIVES } from '@/lib/mock-data';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') ?? 'score';
  const limit = parseInt(searchParams.get('limit') ?? '20', 10);
  const page = parseInt(searchParams.get('page') ?? '1', 10);

  let narratives = [...MOCK_NARRATIVES];

  if (status) {
    narratives = narratives.filter((n) => n.status === status);
  }

  if (sort === 'score') {
    narratives.sort((a, b) => b.narrativeScore - a.narrativeScore);
  } else if (sort === 'recent') {
    narratives.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const start = (page - 1) * limit;
  const paginated = narratives.slice(start, start + limit);

  return NextResponse.json({
    data: paginated,
    meta: { total: narratives.length, page, limit },
  });
}
