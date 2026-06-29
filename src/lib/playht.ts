/**
 * PlayHT service — proxied through server-side API routes.
 * The PlayHT API credentials are never exposed to the browser.
 *
 * Note: PlayHT is a secondary TTS provider. Primary is ElevenLabs.
 * Enable by setting PLAYHT_API_KEY and PLAYHT_USER_ID in .env.local
 */

export const playHTService = {
  async getVoices(): Promise<any[]> {
    // Primary voice library comes from ElevenLabs via /api/voices
    // PlayHT voices would come from a separate /api/playht/voices route
    const res = await fetch('/api/voices');
    if (!res.ok) throw new Error('Failed to fetch voices');
    return res.json();
  },

  async generateSpeech(text: string, voiceId: string): Promise<Blob> {
    const res = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'PlayHT generation failed');
    }
    return res.blob();
  },
};
