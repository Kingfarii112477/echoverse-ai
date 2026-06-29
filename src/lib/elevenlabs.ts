/**
 * ElevenLabs client — all calls proxied through /api/voices and /api/generate-speech
 * The actual API key is NEVER sent to the browser.
 */

export const elevenLabsService = {
  async getVoices() {
    const res = await fetch('/api/voices');
    if (!res.ok) throw new Error('Failed to fetch voices');
    return res.json();
  },

  async generateSpeech(options: {
    text: string;
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    modelId?: string;
  }): Promise<Blob> {
    const res = await fetch('/api/generate-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Speech generation failed');
    }
    return res.blob();
  },

  async cloneVoice(name: string, description: string, files: File[]): Promise<{ voice_id: string }> {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    files.forEach(f => formData.append('files', f));

    const res = await fetch('/api/clone-voice', { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Voice cloning failed');
    }
    return res.json();
  },
};
