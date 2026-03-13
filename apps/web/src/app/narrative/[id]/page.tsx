import { notFound } from 'next/navigation';
import { MOCK_NARRATIVES, MOCK_PROVIDERS } from '@/lib/mock-data';
import { NarrativeDetailClient } from './NarrativeDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NarrativePage({ params }: PageProps) {
  const { id } = await params;
  const narrative = MOCK_NARRATIVES.find((n) => n.id === id);
  if (!narrative) notFound();

  return <NarrativeDetailClient narrative={narrative} providers={MOCK_PROVIDERS} />;
}

export async function generateStaticParams() {
  return MOCK_NARRATIVES.map((n) => ({ id: n.id }));
}
