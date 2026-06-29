import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const PADDLE_API_KEY = process.env.PADDLE_API_KEY;
  if (!PADDLE_API_KEY) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
  }

  const { priceId, planId } = await request.json();
  if (!priceId) return NextResponse.json({ error: 'Price ID required' }, { status: 400 });

  try {
    // Create Paddle transaction
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch('https://sandbox-api.paddle.com/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ price_id: priceId, quantity: 1 }],
        customer: { email: user.email },
        custom_data: { user_id: user.id, plan_id: planId },
        checkout: {
          url: `${appUrl}/dashboard?upgraded=true`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paddle error:', data);
      return NextResponse.json({ error: data.error?.detail || 'Checkout creation failed' }, { status: 400 });
    }

    const checkoutUrl = data.data?.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
    }

    // Save paddle customer id to subscription record
    if (data.data?.customer?.id) {
      await supabase.from('subscriptions').upsert({
        user_id: user.id,
        paddle_customer_id: data.data.customer.id,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
