/**
 * OpenAI client — all calls proxied through /api/ai/* server routes.
 * The OPENAI_API_KEY is server-side only and never exposed to the browser.
 */

export const openAIService = {
  async generateScript(type: string, prompt: string, language?: string): Promise<string> {
    const res = await fetch('/api/ai/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, prompt, language }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Script generation failed');
    }
    const data = await res.json();
    return data.text;
  },

  async generatePodcastScript(topic: string): Promise<string> {
    return this.generateScript('podcast', `Create an engaging podcast script about: ${topic}`);
  },

  async generateStoryScript(prompt: string): Promise<string> {
    return this.generateScript('story', prompt);
  },

  async generateSSML(text: string, emotion: string): Promise<string> {
    return this.generateScript('ssml', `Convert this text to SSML with "${emotion}" emotion:\n\n${text}`);
  },

  async generateScriptForType(type: string, context: string): Promise<string> {
    return this.generateScript(type, context);
  },
};
