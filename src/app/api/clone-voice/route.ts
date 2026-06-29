import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

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

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'Voice cloning service not configured' }, { status: 503 });
  }

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const elevenlabsForm = new FormData();
  elevenlabsForm.append('name', name);
  if (description) elevenlabsForm.append('description', description);

  // Attach audio files
  const files = formData.getAll('files') as File[];
  if (files.length === 0) {
    return NextResponse.json({ error: 'At least one audio sample is required' }, { status: 400 });
  }
  files.forEach((file) => elevenlabsForm.append('files', file));

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      body: elevenlabsForm,
    });

    if (!response.ok) {
      const errData = await response.json();
      return NextResponse.json({ error: errData.detail?.message || 'Clone failed' }, { status: response.status });
    }

    const result = await response.json();

    // Save to DB
    const { data: clone } = await supabase.from('voice_clones').insert([{
      user_id: user.id,
      name,
      description,
      clone_id: result.voice_id,
      status: 'ready',
      provider: 'elevenlabs',
      quality_score: 85,
      sample_urls: [],
      created_at: new Date().toISOString(),
    }]).select().single();

    return NextResponse.json({ voice_id: result.voice_id, clone });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
