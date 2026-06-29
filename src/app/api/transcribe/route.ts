import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen';

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

  if (!DEEPGRAM_API_KEY) {
    return NextResponse.json({ error: 'Transcription service not configured' }, { status: 503 });
  }

  const contentType = request.headers.get('content-type') || '';
  let body: BodyInit;
  let headers: Record<string, string> = {
    'Authorization': `Token ${DEEPGRAM_API_KEY}`,
  };
  let queryParams = 'model=nova-2&language=multi&punctuate=true&diarize=true';

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });

    body = await audioFile.arrayBuffer();
    headers['Content-Type'] = audioFile.type || 'audio/mpeg';
  } else {
    const { url } = await request.json();
    if (!url) return NextResponse.json({ error: 'No audio URL provided' }, { status: 400 });
    body = JSON.stringify({ url });
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${DEEPGRAM_URL}?${queryParams}`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Transcription failed: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    const result = data?.results?.channels?.[0]?.alternatives?.[0];

    return NextResponse.json({
      transcript: result?.transcript || '',
      confidence: result?.confidence || 0,
      words: result?.words || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
