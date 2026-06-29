import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Use service role for webhook processing — no user session available
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyPaddleSignature(body: string, signature: string, secret: string): boolean {
  try {
    const parts = signature.split(';');
    const tsPart = parts.find(p => p.startsWith('ts='));
    const h1Part = parts.find(p => p.startsWith('h1='));
    if (!tsPart || !h1Part) return false;

    const ts = tsPart.split('=')[1];
    const receivedHash = h1Part.split('=')[1];
    const signedPayload = `${ts}:${body}`;
    const expectedHash = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(receivedHash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return false;
  }
}

const PLAN_TIERS: Record<string, string> = {
  'free': 'free',
  'starter': 'pro',
  'pro': 'studio',
  'enterprise': 'enterprise',
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('PADDLE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get('paddle-signature') || '';

  if (!verifyPaddleSignature(body, signature, webhookSecret)) {
    console.error('Invalid Paddle signature');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = event.event_type;
  const data = event.data;

  console.log('Paddle webhook:', eventType);

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated': {
        const customerId = data.customer_id;
        const status = data.status;
        const priceId = data.items?.[0]?.price?.id;
        const planName = data.items?.[0]?.price?.name?.toLowerCase() || 'free';
        const tier = PLAN_TIERS[planName] || 'free';

        // Look up user by paddle customer id
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_customer_id', customerId)
          .single();

        const userId = existingSub?.user_id || data.custom_data?.user_id;
        if (!userId) {
          console.error('No user found for customer:', customerId);
          break;
        }

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          paddle_customer_id: customerId,
          paddle_subscription_id: data.id,
          plan_id: priceId || planName,
          status,
          current_period_start: data.current_billing_period?.starts_at,
          current_period_end: data.current_billing_period?.ends_at,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        // Update user profile tier
        await supabase.from('profiles').update({
          subscription_tier: tier,
          updated_at: new Date().toISOString(),
        }).eq('id', userId);

        break;
      }

      case 'subscription.canceled': {
        const customerId = data.customer_id;
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('paddle_customer_id', customerId)
          .single();

        if (sub?.user_id) {
          await supabase.from('subscriptions').update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          }).eq('user_id', sub.user_id);

          await supabase.from('profiles').update({
            subscription_tier: 'free',
            updated_at: new Date().toISOString(),
          }).eq('id', sub.user_id);
        }
        break;
      }

      case 'transaction.completed': {
        // Log billing event
        const customerId = data.customer_id;
        await supabase.from('billing_events').insert([{
          paddle_customer_id: customerId,
          paddle_transaction_id: data.id,
          amount: data.details?.totals?.total,
          currency: data.currency_code,
          status: 'completed',
          created_at: new Date().toISOString(),
        }]);
        break;
      }

      case 'transaction.payment_failed': {
        const customerId = data.customer_id;
        await supabase.from('billing_events').insert([{
          paddle_customer_id: customerId,
          paddle_transaction_id: data.id,
          status: 'failed',
          created_at: new Date().toISOString(),
        }]);
        break;
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
