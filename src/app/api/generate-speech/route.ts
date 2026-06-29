import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export async function POST(request: NextRequest) {
  // Authenticate user
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!ELEVENLABS_API_KEY) {
    return NextResponse.json({ error: 'TTS service not configured' }, { status: 503 });
  }

  const body = await request.json();
  const { text, voiceId, stability = 0.5, similarityBoost = 0.75, style = 0.5, modelId = 'eleven_multilingual_v2' } = body;

  if (!text || !voiceId) {
    return NextResponse.json({ error: 'text and voiceId are required' }, { status: 400 });
  }

  if (text.length > 5000) {
    return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 });
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('ElevenLabs error:', response.status, errText);
      return NextResponse.json(
        { error: `Voice generation failed: ${response.statusText}` },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    // Log usage
    await supabase.from('usage_logs').insert([{
      user_id: user.id,
      type: 'tts_generation',
      units: Math.ceil(text.length / 100),
      created_at: new Date().toISOString(),
    }]);

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error: any) {
    console.error('Generate speech error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
