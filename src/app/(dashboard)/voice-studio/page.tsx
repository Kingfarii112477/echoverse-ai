'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Timer,
  Bold,
  Waves,
  PauseIcon,
  FastForward,
  Rewind,
  Sparkles,
  Download,
  Plus,
  X,
  GripVertical,
  RotateCcw,
  Users,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceStore, useVoiceStudioCompat } from '@/stores/voiceStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';
import { EmotionSelector } from '@/components/studio/EmotionSelector';
import { TextEditor } from '@/components/studio/TextEditor';
import { VoiceCard } from '@/components/voice/VoiceCard';
import { WaveformPlayer } from '@/components/voice/WaveformPlayer';
import type { VoiceLanguage, EmotionType } from '@/types';

interface Speaker {
  id: string;
  label: string;
  name: string;
  voiceId: string;
  color: string;
}

interface DialogueLine {
  id: string;
  speakerId: string;
  text: string;
}

const LANGUAGES: Array<{ label: string; value: VoiceLanguage | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Urdu', value: 'ur' },
  { label: 'Hindi', value: 'hi' },
  { label: 'English', value: 'en' },
  { label: 'Arabic', value: 'ar' },
];

const SPEAKER_COLORS = [
  { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' },
  { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
  { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' },
  { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
];

export default function VoiceStudioPage() {
  const {
    voices,
    selectedVoice,
    selectVoice,
    voiceSettings,
    setVoiceSettings,
    currentEmotion,
    setEmotion,
    isGenerating,
    setGenerating,
    fetchVoices,
  } = useVoiceStudioCompat();

  // Load voices on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchVoices(); }, []);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<VoiceLanguage | 'all'>('all');

  // Text content
  const [textContent, setTextContent] = useState('');

  // Multi-speaker mode
  const [isMultiSpeaker, setIsMultiSpeaker] = useState(false);
  const [speakers, setSpeakers] = useState<Speaker[]>([
    {
      id: 'speaker-a',
      label: 'A',
      name: 'Speaker A',
      voiceId: voices[0]?.id || '',
      color: SPEAKER_COLORS[0].text,
    },
  ]);
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    { id: 'line-1', speakerId: 'speaker-a', text: '' },
  ]);

  // Audio output
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | undefined>();

  // Mobile panel state
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  // Filter voices
  const filteredVoices = voices.filter((voice) => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLanguage = selectedLanguage === 'all' || voice.language === selectedLanguage;
    return matchesSearch && matchesLanguage;
  });

  // Default voice selection
  useEffect(() => {
    if (!selectedVoice && voices.length > 0) {
      selectVoice(voices[0]);
    }
  }, [voices, selectedVoice, selectVoice]);

  // Handle voice selection
  const handleSelectVoice = (voice: any) => {
    selectVoice(voice);
    setShowLeftPanel(false);
  };

  // SSML insertion helpers
  const insertSSML = (tag: string) => {
    setTextContent((prev) => prev + tag);
  };

  // Multi-speaker functions
  const addSpeaker = () => {
    if (speakers.length >= 4) return;
    const labels = ['A', 'B', 'C', 'D'];
    const nextLabel = labels[speakers.length];
    const colorIndex = speakers.length % SPEAKER_COLORS.length;

    const newSpeaker: Speaker = {
      id: `speaker-${nextLabel.toLowerCase()}`,
      label: nextLabel,
      name: `Speaker ${nextLabel}`,
      voiceId: voices[0]?.id || '',
      color: SPEAKER_COLORS[colorIndex].text,
    };

    setSpeakers([...speakers, newSpeaker]);
  };

  const removeSpeaker = (speakerId: string) => {
    if (speakers.length <= 1) return;
    setSpeakers(speakers.filter((s) => s.id !== speakerId));
    setDialogueLines(dialogueLines.filter((line) => line.speakerId !== speakerId));
  };

  const updateSpeaker = (speakerId: string, updates: Partial<Speaker>) => {
    setSpeakers(speakers.map((s) => (s.id === speakerId ? { ...s, ...updates } : s)));
  };

  const addDialogueLine = () => {
    const newLine: DialogueLine = {
      id: `line-${Date.now()}`,
      speakerId: speakers[0].id,
      text: '',
    };
    setDialogueLines([...dialogueLines, newLine]);
  };

  const updateDialogueLine = (lineId: string, updates: Partial<DialogueLine>) => {
    setDialogueLines(dialogueLines.map((line) => (line.id === lineId ? { ...line, ...updates } : line)));
  };

  const removeDialogueLine = (lineId: string) => {
    if (dialogueLines.length <= 1) return;
    setDialogueLines(dialogueLines.filter((line) => line.id !== lineId));
  };

  const moveDialogueLine = (lineId: string, direction: 'up' | 'down') => {
    const index = dialogueLines.findIndex((line) => line.id === lineId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === dialogueLines.length - 1)
    ) {
      return;
    }

    const newLines = [...dialogueLines];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newLines[index], newLines[targetIndex]] = [newLines[targetIndex], newLines[index]];
    setDialogueLines(newLines);
  };

  // Generate voice — calls real ElevenLabs via server-side API route
  const handleGenerate = async () => {
    const textToGenerate = isMultiSpeaker
      ? dialogueLines.map(l => `${l.text}`).join(' ')
      : textContent;

    if (!textToGenerate.trim()) return;
    if (!selectedVoice?.id) return;

    setGenerating(true);
    if (generatedAudioUrl) URL.revokeObjectURL(generatedAudioUrl);
    setGeneratedAudioUrl(undefined);

    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToGenerate,
          voiceId: selectedVoice.id,
          stability: voiceSettings.stability / 100,
          similarityBoost: voiceSettings.similarity / 100,
          style: voiceSettings.style / 100,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Generation failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudioUrl(url);

      // Save to project if user logged in
      try {
        const { useAuthStore } = await import('@/stores/authStore');
        const { user } = useAuthStore.getState();
        if (user) {
          const { projectService } = await import('@/lib/supabase');
          await projectService.createProject({
            user_id: user.id,
            title: textToGenerate.slice(0, 60) + (textToGenerate.length > 60 ? '...' : ''),
            type: 'voice',
            status: 'completed',
            progress: 100,
            metadata: {
              voice_id: selectedVoice.id,
              voice_name: selectedVoice.name,
              text_length: textToGenerate.length,
              language: selectedVoice.language,
            },
          });
        }
      } catch (saveErr) {
        console.warn('Could not save project:', saveErr);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      alert(`Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Reset settings
  const resetSettings = () => {
    setVoiceSettings({
      stability: 50,
      similarity: 75,
      style: 30,
      speed: 1.0,
    });
  };

  // Export functions
  const exportAudio = (format: 'mp3' | 'wav') => {
    if (!generatedAudioUrl) return;
    const link = document.createElement('a');
    link.href = generatedAudioUrl;
    link.download = `echoverse-audio.${format}`;
    link.click();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <Button
          size="sm"
          variant="outline"
          icon={<Menu className="h-4 w-4" />}
          onClick={() => setShowLeftPanel(!showLeftPanel)}
        >
          Voice Library
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowRightPanel(!showRightPanel)}
        >
          Settings
        </Button>
      </div>

      {/* Left Panel - Voice Library */}
      <AnimatePresence>
        {(showLeftPanel || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            className={cn(
              'w-full lg:w-80 flex-shrink-0 bg-ev-surface border border-ev-outline/30 rounded-xl overflow-hidden flex flex-col',
              'fixed lg:relative inset-0 z-50 lg:z-auto',
              showLeftPanel ? 'block' : 'hidden lg:block'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-ev-outline/30 flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-ev-on-surface">Voice Library</h2>
              <button
                onClick={() => setShowLeftPanel(false)}
                className="lg:hidden p-1 hover:bg-ev-surface-high rounded"
              >
                <X className="h-5 w-5 text-ev-on-surface" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-ev-outline/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ev-on-surface-variant" />
                <Input
                  placeholder="Search voices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Language Filter */}
            <div className="p-4 border-b border-ev-outline/30">
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <Button
                    key={lang.value}
                    size="sm"
                    variant={selectedLanguage === lang.value ? 'primary' : 'outline'}
                    onClick={() => setSelectedLanguage(lang.value)}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Voice List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={{
                    id: voice.id,
                    name: voice.name,
                    language: voice.language,
                    gender: voice.gender,
                    provider: voice.provider === 'elevenlabs' ? 'ElevenLabs' : voice.provider === 'openai' ? 'OpenAI' : 'PlayHT',
                    isPremium: voice.is_premium,
                    previewUrl: voice.preview_url,
                  }}
                  isSelected={selectedVoice?.id === voice.id}
                  onSelect={() => handleSelectVoice(voice)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Panel - Content Editor */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {/* SSML Controls Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<Timer className="h-4 w-4" />}
                onClick={() => insertSSML('<break time="500ms"/>')}
              >
                Pause
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Bold className="h-4 w-4" />}
                onClick={() => insertSSML('<emphasis></emphasis>')}
              >
                Emphasis
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Waves className="h-4 w-4" />}
                onClick={() => insertSSML('<prosody></prosody>')}
              >
                Prosody
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<PauseIcon className="h-4 w-4" />}
                onClick={() => insertSSML('<break/>')}
              >
                Break
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<FastForward className="h-4 w-4" />}
                onClick={() => insertSSML('<prosody rate="fast"></prosody>')}
              >
                Speed Up
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Rewind className="h-4 w-4" />}
                onClick={() => insertSSML('<prosody rate="slow"></prosody>')}
              >
                Slow Down
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Text Editor */}
        {!isMultiSpeaker && (
          <Card>
            <CardHeader>
              <CardTitle>Content Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <TextEditor
                value={textContent}
                onChange={setTextContent}
                placeholder="Enter your text here... Type in Urdu, English, Hindi, or Arabic"
                maxLength={5000}
                showToolbar={true}
                className="min-h-[300px]"
              />
            </CardContent>
          </Card>
        )}

        {/* Emotion Selector */}
        {!isMultiSpeaker && (
          <Card>
            <CardContent className="p-6">
              <EmotionSelector
                value={currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1) as any}
                onChange={(emotion) => setEmotion(emotion.toLowerCase() as EmotionType)}
              />
            </CardContent>
          </Card>
        )}

        {/* Multi-Speaker Mode */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Multi-Speaker Mode</CardTitle>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultiSpeaker}
                  onChange={(e) => setIsMultiSpeaker(e.target.checked)}
                  className="w-4 h-4 rounded border-ev-outline accent-ev-primary"
                />
                <span className="text-sm text-ev-on-surface-variant">Enable</span>
              </label>
            </div>
          </CardHeader>
          {isMultiSpeaker && (
            <CardContent className="space-y-4">
              {/* Speakers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-ev-on-surface">Speakers</h3>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Plus className="h-3.5 w-3.5" />}
                    onClick={addSpeaker}
                    disabled={speakers.length >= 4}
                  >
                    Add Speaker
                  </Button>
                </div>
                <div className="space-y-2">
                  {speakers.map((speaker, index) => {
                    const colorStyle = SPEAKER_COLORS[index % SPEAKER_COLORS.length];
                    return (
                      <div
                        key={speaker.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border',
                          colorStyle.bg,
                          colorStyle.border
                        )}
                      >
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold',
                            colorStyle.text
                          )}
                        >
                          {speaker.label}
                        </div>
                        <Input
                          placeholder="Speaker name"
                          value={speaker.name}
                          onChange={(e) => updateSpeaker(speaker.id, { name: e.target.value })}
                          className="flex-1"
                        />
                        <select
                          value={speaker.voiceId}
                          onChange={(e) => updateSpeaker(speaker.id, { voiceId: e.target.value })}
                          className="bg-ev-surface-container border border-ev-outline/50 rounded-lg px-3 py-1.5 text-sm text-ev-on-surface"
                        >
                          {voices.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name}
                            </option>
                          ))}
                        </select>
                        {speakers.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<X className="h-4 w-4" />}
                            onClick={() => removeSpeaker(speaker.id)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conversation Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-ev-on-surface mb-3">
                  Conversation Timeline
                </h3>
                <div className="space-y-2">
                  {dialogueLines.map((line, index) => {
                    const speaker = speakers.find((s) => s.id === line.speakerId);
                    const speakerIndex = speakers.findIndex((s) => s.id === line.speakerId);
                    const lineColorStyle = SPEAKER_COLORS[speakerIndex % SPEAKER_COLORS.length];

                    return (
                      <motion.div
                        key={line.id}
                        layout
                        className="flex items-start gap-2 p-3 bg-ev-surface-container rounded-lg border border-ev-outline/30"
                      >
                        <button
                          className="mt-1 cursor-move text-ev-on-surface-variant hover:text-ev-on-surface"
                          onClick={() => {
                            if (index > 0) moveDialogueLine(line.id, 'up');
                          }}
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                        <div
                          className={cn(
                            'mt-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                            lineColorStyle.text,
                            lineColorStyle.bg
                          )}
                        >
                          {speaker?.label}
                        </div>
                        <div className="flex-1 space-y-2">
                          <select
                            value={line.speakerId}
                            onChange={(e) => updateDialogueLine(line.id, { speakerId: e.target.value })}
                            className="w-full bg-ev-surface border border-ev-outline/50 rounded px-2 py-1 text-xs text-ev-on-surface"
                          >
                            {speakers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <Input
                            placeholder="Enter dialogue..."
                            value={line.text}
                            onChange={(e) => updateDialogueLine(line.id, { text: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<X className="h-4 w-4" />}
                          onClick={() => removeDialogueLine(line.id)}
                          disabled={dialogueLines.length <= 1}
                        />
                      </motion.div>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Plus className="h-3.5 w-3.5" />}
                  onClick={addDialogueLine}
                  className="mt-2 w-full"
                >
                  Add Line
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Generate Button */}
        <Card>
          <CardContent className="p-6">
            <Button
              size="lg"
              variant="primary"
              icon={
                isGenerating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <Sparkles className="h-5 w-5" />
                )
              }
              onClick={handleGenerate}
              disabled={isGenerating || (!textContent && !isMultiSpeaker)}
              className="w-full"
            >
              {isGenerating ? 'Generating Voice...' : 'Generate Voice'}
            </Button>

            {generatedAudioUrl && (
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="md"
                  variant="outline"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => exportAudio('mp3')}
                >
                  Export MP3
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => exportAudio('wav')}
                >
                  Export WAV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Waveform Player */}
        <Card>
          <CardContent className="p-6">
            <WaveformPlayer audioUrl={generatedAudioUrl} />
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Voice Settings */}
      <AnimatePresence>
        {(showRightPanel || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            className={cn(
              'w-full lg:w-72 flex-shrink-0 bg-ev-surface border border-ev-outline/30 rounded-xl overflow-hidden flex flex-col',
              'fixed lg:relative inset-0 z-50 lg:z-auto right-0 left-auto',
              showRightPanel ? 'block' : 'hidden lg:block'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-ev-outline/30 flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-ev-on-surface">Voice Settings</h2>
              <button
                onClick={() => setShowRightPanel(false)}
                className="lg:hidden p-1 hover:bg-ev-surface-high rounded"
              >
                <X className="h-5 w-5 text-ev-on-surface" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Selected Voice Info */}
              {selectedVoice && (
                <div className="bg-ev-surface-container rounded-lg p-4 border border-ev-outline/30">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-ev-primary-container flex items-center justify-center text-xl font-display font-bold text-ev-bg">
                      {selectedVoice.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-ev-on-surface">
                        {selectedVoice.name}
                      </h3>
                      <div className="flex gap-1.5 mt-1">
                        <Badge size="sm" variant="default">
                          {selectedVoice.language}
                        </Badge>
                        <Badge size="sm" variant="info">
                          {selectedVoice.gender}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Sliders */}
              <div className="space-y-4">
                <Slider
                  label="Stability"
                  min={0}
                  max={100}
                  step={1}
                  value={voiceSettings.stability * 100}
                  onChange={(value) => setVoiceSettings({ stability: value / 100 })}
                  showValue={true}
                />

                <Slider
                  label="Similarity"
                  min={0}
                  max={100}
                  step={1}
                  value={voiceSettings.similarity * 100}
                  onChange={(value) => setVoiceSettings({ similarity: value / 100 })}
                  showValue={true}
                />

                <Slider
                  label="Style"
                  min={0}
                  max={100}
                  step={1}
                  value={voiceSettings.style * 100}
                  onChange={(value) => setVoiceSettings({ style: value / 100 })}
                  showValue={true}
                />

                <Slider
                  label="Speed"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={voiceSettings.speed}
                  onChange={(value) => setVoiceSettings({ speed: value })}
                  showValue={true}
                />
              </div>

              {/* Reset Button */}
              <Button
                size="md"
                variant="outline"
                icon={<RotateCcw className="h-4 w-4" />}
                onClick={resetSettings}
                className="w-full"
              >
                Reset to Defaults
              </Button>

              {/* Info */}
              <div className="bg-ev-surface-high/50 rounded-lg p-3 border border-ev-outline/20">
                <p className="text-xs text-ev-on-surface-variant leading-relaxed">
                  Adjust these settings to fine-tune the voice output. Higher stability values
                  produce more consistent results, while higher similarity values make the voice
                  closer to the original.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Backdrop */}
      {(showLeftPanel || showRightPanel) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            setShowLeftPanel(false);
            setShowRightPanel(false);
          }}
        />
      )}
    </div>
  );
}
