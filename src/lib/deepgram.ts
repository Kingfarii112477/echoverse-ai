/**
 * Deepgram service — all calls proxied through /api/transcribe.
 * DEEPGRAM_API_KEY is server-side only, never in client bundles.
 */

export const deepgramService = {
  async transcribeFile(file: File): Promise<{ transcript: string; confidence: number }> {
    const formData = new FormData();
    formData.append('audio', file);
    const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Transcription failed');
    }
    return res.json();
  },

  async transcribeUrl(url: string): Promise<{ transcript: string; confidence: number }> {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Transcription failed');
    }
    return res.json();
  },
};
