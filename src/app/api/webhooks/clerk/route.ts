import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    console.log('[Webhook] Request received');
    const body = await req.json();
    console.log('[Webhook] Body:', JSON.stringify(body));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 