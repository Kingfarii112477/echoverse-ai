import type { ScriptGenerationOptions, TTSOptions, TTSResult } from '../index';

function getApiKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not configured');
  return key;
}

// ── Script / Content Generation ────────────────────────────────
export async function generateScript(opts: ScriptGenerationOptions): Promise<string> {
  const { prompt, type, tone = 'professional', language = 'English', wordCount = 300 } = opts;

  const systemPrompts: Record<string, string> = {
    podcast: `You are an expert podcast script writer. Create engaging, conversational podcast scripts in ${language}. Use a ${tone} tone. Format with clear HOST/GUEST dialogue markers.`,
    story: `You are a creative storyteller. Write compelling narratives in ${language} with vivid characters and engaging plots. Use a ${tone} tone.`,
    video: `You are a professional video script writer. Create scripts with clear scene descriptions, voiceover text, and B-roll notes. Language: ${language}. Tone: ${tone}.`,
    reel: `You are an expert short-form content creator. Write punchy, attention-grabbing scripts for social media reels (30-60 seconds). Language: ${language}. Hook in first 3 seconds.`,
    ssml: `You are an SSML expert. Generate valid SSML markup with prosody, emphasis, breaks, and other elements to create natural speech. Language: ${language}.`,
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompts[type] || systemPrompts.story },
        {
          role: 'user',
          content: `${prompt}\n\nTarget length: approximately ${wordCount} words.`,
        },
      ],
      temperature: 0.8,
      max_tokens: Math.max(wordCount * 2, 1000),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`OpenAI script generation failed: ${detail}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── OpenAI TTS (fallback) ──────────────────────────────────────
export async function generateSpeechOpenAI(opts: TTSOptions): Promise<TTSResult> {
  const voices: Record<string, string> = {
    alloy: 'alloy', echo: 'echo', fable: 'fable',
    onyx: 'onyx', nova: 'nova', shimmer: 'shimmer',
  };

  const voice = voices[opts.voiceId] ?? 'alloy';

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: opts.text,
      voice,
      speed: opts.speed ?? 1.0,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI TTS failed: ${res.statusText}`);
  const audioBuffer = await res.arrayBuffer();
  return { audioBuffer, provider: 'openai' };
}
