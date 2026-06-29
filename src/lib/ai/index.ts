/**
 * EchoVerse AI Services Abstraction Layer
 * Supports: ElevenLabs, OpenAI, Deepgram, PlayHT, Google
 * All providers implement the same interface — swap with env vars
 */

export type TTSProvider = 'elevenlabs' | 'openai' | 'playht';
export type TranscriptionProvider = 'deepgram' | 'openai-whisper';
export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface TTSOptions {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speed?: number;
  emotion?: string;
}

export interface TTSResult {
  audioBuffer: ArrayBuffer;
  duration?: number;
  provider: TTSProvider;
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  samples: File[];
}

export interface ScriptGenerationOptions {
  prompt: string;
  type: 'podcast' | 'story' | 'video' | 'reel' | 'ssml';
  tone?: string;
  language?: string;
  wordCount?: number;
}

// ── Provider resolution ────────────────────────────────────────
export function getActiveTTSProvider(): TTSProvider {
  const provider = process.env.ACTIVE_TTS_PROVIDER as TTSProvider;
  if (provider && ['elevenlabs', 'openai', 'playht'].includes(provider)) return provider;
  if (process.env.ELEVENLABS_API_KEY) return 'elevenlabs';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return 'elevenlabs'; // default
}

export function getActiveLLMProvider(): LLMProvider {
  const provider = process.env.ACTIVE_LLM_PROVIDER as LLMProvider;
  if (provider) return provider;
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'openai';
}

// ── Re-exports ─────────────────────────────────────────────────
export { generateSpeech, getVoices } from './providers/elevenlabs';
export { generateScript } from './providers/openai';
export { transcribeAudio } from './providers/deepgram';
