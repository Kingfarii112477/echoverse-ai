import type { TTSOptions, TTSResult } from '../index';

const BASE = 'https://api.elevenlabs.io/v1';

function getApiKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY is not configured');
  return key;
}

// ── Text-to-Speech ─────────────────────────────────────────────
export async function generateSpeech(opts: TTSOptions): Promise<TTSResult> {
  const { text, voiceId, stability = 0.5, similarityBoost = 0.75, style = 0.3, speed = 1.0 } = opts;

  const res = await fetch(`${BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': getApiKey(),
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability,
        similarity_boost: similarityBoost,
        style,
        use_speaker_boost: true,
        speed,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs TTS failed (${res.status}): ${detail}`);
  }

  const audioBuffer = await res.arrayBuffer();
  return { audioBuffer, provider: 'elevenlabs' };
}

// ── Voice Library ──────────────────────────────────────────────
export async function getVoices() {
  const res = await fetch(`${BASE}/voices`, {
    headers: { 'xi-api-key': getApiKey() },
  });
  if (!res.ok) throw new Error(`ElevenLabs voices failed: ${res.statusText}`);
  const data = await res.json();
  return data.voices ?? [];
}

// ── Voice Cloning ──────────────────────────────────────────────
export async function cloneVoice(name: string, description: string, samples: Buffer[]) {
  const form = new FormData();
  form.append('name', name);
  form.append('description', description);
  samples.forEach((buf, i) => {
    const blob = new Blob([buf], { type: 'audio/mpeg' });
    form.append('files', blob, `sample_${i}.mp3`);
  });

  const res = await fetch(`${BASE}/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': getApiKey() },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs clone failed: ${detail}`);
  }
  return res.json();
}
