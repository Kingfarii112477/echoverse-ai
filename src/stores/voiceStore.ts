import { create } from 'zustand';
import type { Voice, EmotionType, VoiceLanguage } from '@/types';

interface VoiceState {
  voices: Voice[];
  selectedVoice: Voice | null;
  selectedEmotion: EmotionType;
  selectedLanguage: VoiceLanguage | 'all';
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  pitch: number;
  isGenerating: boolean;
  generatedAudioUrl: string | null;
  error: string | null;

  fetchVoices: () => Promise<void>;
  selectVoice: (voice: Voice) => void;
  setEmotion: (emotion: EmotionType) => void;
  setLanguage: (lang: VoiceLanguage | 'all') => void;
  setStability: (v: number) => void;
  setSimilarityBoost: (v: number) => void;
  setStyle: (v: number) => void;
  setSpeed: (v: number) => void;
  setPitch: (v: number) => void;
  generateSpeech: (text: string) => Promise<void>;
  clearAudio: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  voices: [],
  selectedVoice: null,
  selectedEmotion: 'calm',
  selectedLanguage: 'all',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.5,
  speed: 1.0,
  pitch: 0,
  isGenerating: false,
  generatedAudioUrl: null,
  error: null,

  fetchVoices: async () => {
    try {
      const res = await fetch('/api/voices');
      if (!res.ok) throw new Error('Failed to load voices');
      const voices = await res.json();
      set({ voices });
    } catch (err: any) {
      set({ error: err.message });
      console.error('Fetch voices error:', err);
    }
  },

  selectVoice: (voice) => set({ selectedVoice: voice }),
  setEmotion: (emotion) => set({ selectedEmotion: emotion }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
  setStability: (v) => set({ stability: v }),
  setSimilarityBoost: (v) => set({ similarityBoost: v }),
  setStyle: (v) => set({ style: v }),
  setSpeed: (v) => set({ speed: v }),
  setPitch: (v) => set({ pitch: v }),

  generateSpeech: async (text: string) => {
    const { selectedVoice, stability, similarityBoost, style } = get();
    if (!selectedVoice) throw new Error('No voice selected');
    if (!text.trim()) throw new Error('No text provided');

    set({ isGenerating: true, error: null, generatedAudioUrl: null });

    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice.id,
          stability,
          similarityBoost,
          style,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      set({ generatedAudioUrl: url, isGenerating: false });
    } catch (err: any) {
      set({ error: err.message, isGenerating: false });
      throw err;
    }
  },

  clearAudio: () => {
    const { generatedAudioUrl } = get();
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    set({ generatedAudioUrl: null });
  },
}));

// ── Compatibility shim ─────────────────────────────────────────
// The VoiceStudio page uses voiceSettings object + setVoiceSettings partial updater
// Add these as computed accessors on the store
export function useVoiceStudioCompat() {
  const store = useVoiceStore();
  return {
    ...store,
    voiceSettings: {
      stability: store.stability,
      similarity: store.similarityBoost,
      style: store.style,
      speed: store.speed,
    },
    setVoiceSettings: (updates: Partial<{ stability: number; similarity: number; style: number; speed: number }>) => {
      if (updates.stability !== undefined) store.setStability(updates.stability);
      if (updates.similarity !== undefined) store.setSimilarityBoost(updates.similarity);
      if (updates.style !== undefined) store.setStyle(updates.style);
      if (updates.speed !== undefined) store.setSpeed(updates.speed);
    },
    currentEmotion: store.selectedEmotion as string,
    isGenerating: store.isGenerating,
    setGenerating: (v: boolean) => useVoiceStore.setState({ isGenerating: v }),
  };
}
