import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    narrativeId: string;
    providerId: string;
    launcherWallet: string;
  };

  // Validate required fields
  if (!body.narrativeId || !body.providerId || !body.launcherWallet) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const validProviders = ['pump', 'bags', 'bonk'];
  if (!validProviders.includes(body.providerId)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  // In production: forward to apps/api and orchestrate the launch
  // For the scaffold, return a mock launch request
  const launchRequestId = `lr-${Date.now()}`;

  return NextResponse.json(
    {
      launchRequestId,
      status: 'created',
      idempotencyKey: launchRequestId,
      message: 'Launch request created. Connect wallet to proceed.',
    },
    { status: 201 },
  );
}
