function getApiKey() {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) throw new Error('DEEPGRAM_API_KEY is not configured');
  return key;
}

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words?: Array<{ word: string; start: number; end: number; confidence: number }>;
  language?: string;
}

export async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  options: {
    language?: string;
    model?: string;
    punctuate?: boolean;
    diarize?: boolean;
  } = {}
): Promise<TranscriptionResult> {
  const { language = 'en', model = 'nova-2', punctuate = true, diarize = false } = options;

  const params = new URLSearchParams({
    model,
    language,
    punctuate: String(punctuate),
    diarize: String(diarize),
    smart_format: 'true',
    utterances: 'false',
  });

  const res = await fetch(`https://api.deepgram.com/v1/listen?${params}`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${getApiKey()}`,
      'Content-Type': 'audio/mpeg',
    },
    body: audioBuffer,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText);
    throw new Error(`Deepgram transcription failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const channel = data?.results?.channels?.[0]?.alternatives?.[0];

  return {
    transcript: channel?.transcript ?? '',
    confidence: channel?.confidence ?? 0,
    words: channel?.words,
    language,
  };
}
