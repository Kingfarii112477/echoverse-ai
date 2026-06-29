import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPTS: Record<string, string> = {
  podcast: 'You are an expert podcast scriptwriter. Create engaging, conversational podcast scripts with natural dialogue between hosts.',
  story: 'You are a creative storyteller. Write vivid, compelling stories with rich descriptions suitable for audio narration.',
  audiobook: 'You are a skilled author writing audiobook chapters with engaging narrative and natural pacing.',
  video: 'You are a video scriptwriter creating clear, engaging voiceover scripts with scene descriptions.',
  reel: 'You are a short-form content creator. Write punchy, attention-grabbing 30-60 second scripts.',
  ssml: 'You are an SSML expert. Convert plain text into expressive SSML markup with prosody, emphasis, and break tags.',
};

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

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
  }

  const { type, prompt, language = 'en', maxTokens = 2000 } = await request.json();
  if (!type || !prompt) {
    return NextResponse.json({ error: 'type and prompt are required' }, { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.story;
  const langNote = language === 'ur' ? ' Write entirely in Urdu script.' :
                   language === 'hi' ? ' Write in Hindi.' :
                   language === 'ar' ? ' Write in Arabic.' : '';

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt + langNote },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ error: err.error?.message || 'AI generation failed' }, { status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content || '';
    return NextResponse.json({ text, usage: data.usage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
