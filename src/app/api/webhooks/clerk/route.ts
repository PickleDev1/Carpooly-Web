import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  try {
    console.log('[Webhook] Request received at:', new Date().toISOString());
    
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    if (!WEBHOOK_SECRET) {
      console.error('[Webhook] Missing WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Missing WEBHOOK_SECRET' },
        { status: 500 }
      );
    }

    // Get the headers
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error('[Webhook] Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
      return NextResponse.json(
        { error: 'Missing svix headers' },
        { status: 400 }
      );
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent
    } catch (err) {
      console.error('[Webhook] Error verifying webhook:', err);
      return NextResponse.json(
        { error: 'Error verifying webhook' },
        { status: 400 }
      );
    }

    // Handle the webhook
    const eventType = evt.type;
    console.log('----------------------------------------');
    console.log(`[Webhook ${Date.now()}] New event received:`);
    console.log('[Webhook] Event type:', eventType);
    console.log('[Webhook] Event data:', JSON.stringify(evt.data, null, 2));

    if (eventType === 'user.created') {
      console.log('[Webhook] 🎉 Processing user.created event');
      const { id, email_addresses } = evt.data;
      
      // Use WEBHOOK_SECRET for authentication
      const webhookSecret = process.env.WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.error('[Webhook] Missing WEBHOOK_SECRET');
        return NextResponse.json(
          { error: 'Missing WEBHOOK_SECRET' },
          { status: 500 }
        );
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
      };
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          clerk_id: id,
          email: email_addresses[0].email_address
        }),
      });

      console.log('[Webhook] User creation response status:', response.status);

      if (!response.ok) {
        console.error('[Webhook] Error creating user in backend');
        return NextResponse.json(
          { error: 'Error creating user' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Webhook] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 