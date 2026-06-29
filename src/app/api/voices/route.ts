import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function GET(request: NextRequest) {
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
    // Return voices seeded in DB
    const { data } = await supabase.from('voices').select('*').order('name');
    return NextResponse.json(data || []);
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    if (!response.ok) throw new Error('Failed to fetch voices');
    const data = await response.json();

    const voices = data.voices.map((v: any) => ({
      id: v.voice_id,
      name: v.name,
      language: 'english',
      gender: v.labels?.gender || 'neutral',
      provider: 'elevenlabs',
      preview_url: v.preview_url,
      avatar_url: v.avatar_url,
      tags: Object.values(v.labels || {}),
      is_premium: v.category === 'premade',
      is_cloned: v.category === 'cloned',
      stability: v.settings?.stability || 0.5,
      similarity: v.settings?.similarity_boost || 0.75,
      style: v.settings?.style || 0.5,
    }));

    return NextResponse.json(voices);
  } catch (error) {
    const { data } = await supabase.from('voices').select('*').order('name');
    return NextResponse.json(data || []);
  }
}
