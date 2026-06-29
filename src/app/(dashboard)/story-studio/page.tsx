'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Upload,
  Music,
  Volume2,
  Mic,
  Play,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { projectService } from '@/lib/supabase';

interface Character {
  id: string;
  name: string;
  color: string;
  voice: string;
}

interface TimelineSegment {
  id: string;
  type: 'voice' | 'music' | 'sfx';
  characterId?: string;
  label: string;
  start: number;
  duration: number;
  color?: string;
}

interface Scene {
  id: string;
  number: number;
  text: string;
  characters: string[];
}

const demoStory = `Narrator: ایک دفعہ کا ذکر ہے، لاہور کی گلیوں میں ایک چھوٹا سا گھر تھا۔ Once upon a time, in the streets of Lahore, there was a small house.

Ali: دادی جان، مجھے وہ پرانی کہانی سنائیں نا! Dadi Jaan, please tell me that old story!

Grandmother: آؤ بیٹا، آج میں تمہیں اپنے بچپن کی کہانی سناتی ہوں۔ Come my child, today I will tell you a story from my childhood.

Sara: میں بھی سنوں گی! I want to hear too!

Narrator: اور اس طرح، ایک خوبصورت شام کا آغاز ہوا۔ And thus began a beautiful evening.`;

const voiceOptions = [
  'Sarah - Female (English)',
  'Ali - Male (Urdu)',
  'Fatima - Female (Urdu)',
  'Ahmed - Male (English)',
  'Zara - Female (Bilingual)',
  'Hassan - Male (Bilingual)',
];

export default function StoryStudioPage() {
  const [storyText, setStoryText] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [timelineSegments, setTimelineSegments] = useState<TimelineSegment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const { user } = useAuthStore();

  const characterColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  const loadDemoStory = () => {
    setStoryText(demoStory);

    // Detect characters
    const detectedChars: Character[] = [
      { id: '1', name: 'Narrator', color: characterColors[0], voice: voiceOptions[0] },
      { id: '2', name: 'Ali', color: characterColors[1], voice: voiceOptions[1] },
      { id: '3', name: 'Grandmother', color: characterColors[2], voice: voiceOptions[2] },
      { id: '4', name: 'Sara', color: characterColors[3], voice: voiceOptions[4] },
    ];
    setCharacters(detectedChars);

    // Create scenes
    const demoScenes: Scene[] = [
      {
        id: 's1',
        number: 1,
        text: 'Narrator introduces the setting in Lahore',
        characters: ['Narrator'],
      },
      {
        id: 's2',
        number: 2,
        text: 'Ali asks Grandmother for a story',
        characters: ['Ali', 'Grandmother'],
      },
      {
        id: 's3',
        number: 3,
        text: 'Sara joins to listen',
        characters: ['Sara', 'Grandmother'],
      },
      {
        id: 's4',
        number: 4,
        text: 'The evening story session begins',
        characters: ['Narrator'],
      },
    ];
    setScenes(demoScenes);

    // Create timeline segments
    const segments: TimelineSegment[] = [
      // Voice layer
      { id: 'v1', type: 'voice', characterId: '1', label: 'Narrator Opening', start: 0, duration: 150, color: detectedChars[0].color },
      { id: 'v2', type: 'voice', characterId: '2', label: 'Ali', start: 160, duration: 80, color: detectedChars[1].color },
      { id: 'v3', type: 'voice', characterId: '3', label: 'Grandmother', start: 250, duration: 120, color: detectedChars[2].color },
      { id: 'v4', type: 'voice', characterId: '4', label: 'Sara', start: 380, duration: 60, color: detectedChars[3].color },
      { id: 'v5', type: 'voice', characterId: '1', label: 'Narrator Closing', start: 450, duration: 100, color: detectedChars[0].color },
      // Music layer
      { id: 'm1', type: 'music', label: 'Background Ambient', start: 0, duration: 550 },
      // SFX layer
      { id: 's1', type: 'sfx', label: 'Door Creak', start: 155, duration: 20 },
      { id: 's2', type: 'sfx', label: 'Footsteps', start: 375, duration: 30 },
    ];
    setTimelineSegments(segments);
  };

  const updateCharacterVoice = (characterId: string, voice: string) => {
    setCharacters(characters.map(c => c.id === characterId ? { ...c, voice } : c));
  };

  const addScene = () => {
    const newScene: Scene = {
      id: `s${Date.now()}`,
      number: scenes.length + 1,
      text: 'New scene',
      characters: [],
    };
    setScenes([...scenes, newScene]);
  };

  const removeScene = (sceneId: string) => {
    setScenes(scenes.filter(s => s.id !== sceneId));
  };

  const handleGenerateAudioDrama = useCallback(async () => {
    if (!user || !storyText.trim() || characters.length === 0) return;
    setIsGenerating(true);
    setGenerationError('');
    try {
      // Save project first
      const project = await projectService.createProject({
        user_id: user.id,
        title: `Story — ${new Date().toLocaleDateString()}`,
        type: 'story',
        status: 'generating',
        progress: 0,
        metadata: {
          characters: characters.map(c => ({ id: c.id, name: c.name, voice: c.voice })),
          scenes: scenes.length,
          storyText: storyText.slice(0, 500),
        },
      });
      setSavedProjectId(project.id);

      // Generate speech for each character segment sequentially
      const audioBlobs: Blob[] = [];
      for (const seg of timelineSegments.filter(s => s.type === 'voice')) {
        const char = characters.find(c => c.id === seg.characterId);
        if (!char) continue;

        // Find this segment's text from the story
        const segText = `${char.name}: ${seg.label}`;
        const res = await fetch('/api/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: seg.label,
            voiceId: char.voice || 'EXAVITQu4vr4xnSDxMaL', // fallback
            stability: 0.5,
            similarityBoost: 0.75,
          }),
        });
        if (res.ok) {
          audioBlobs.push(await res.blob());
        }

        // Update progress
        const progress = Math.round((audioBlobs.length / timelineSegments.filter(s => s.type === 'voice').length) * 100);
        await projectService.updateProject(project.id, { progress });
      }

      // Update project as completed
      await projectService.updateProject(project.id, { status: 'completed', progress: 100 });
    } catch (err: any) {
      setGenerationError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [user, storyText, characters, scenes, timelineSegments]);


  return (
    <div className="min-h-screen bg-ev-bg">
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-ev-primary flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ev-on-surface">Story Studio</h1>
            <p className="text-ev-on-surface-variant">Transform text into audio dramas</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload/Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Story Input */}
            <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-ev-on-surface">Story Input</h2>
                <Upload className="w-5 h-5 text-ev-on-surface-variant" />
              </div>

              <div>
                <label className="block text-sm font-medium text-ev-on-surface mb-2">
                  Paste Story
                </label>
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Paste your story text here..."
                  className="w-full min-h-[200px] px-4 py-3 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary resize-none"
                />
              </div>

              <button
                onClick={loadDemoStory}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-ev-primary-container text-ev-primary hover:bg-ev-primary hover:text-white rounded-lg font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Load Demo Story
              </button>
            </div>

            {/* Character Detection */}
            {characters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4"
              >
                <h2 className="text-lg font-semibold text-ev-on-surface">Detected Characters</h2>

                <div className="space-y-3">
                  {characters.map(character => (
                    <div
                      key={character.id}
                      className="flex items-center gap-3 p-3 bg-ev-surface-container rounded-lg"
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: character.color }}
                      >
                        {character.name.charAt(0)}
                      </div>
                      <span className="font-medium text-ev-on-surface">{character.name}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Voice Assignment */}
            {characters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4"
              >
                <h2 className="text-lg font-semibold text-ev-on-surface">Voice Assignment</h2>

                {/* Narrator - Special Highlight */}
                {characters.find(c => c.name === 'Narrator') && (
                  <div className="p-4 bg-ev-primary-container rounded-lg border-2 border-ev-primary">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: characters.find(c => c.name === 'Narrator')!.color }}
                      >
                        N
                      </div>
                      <div>
                        <div className="font-medium text-ev-on-surface">Narrator</div>
                        <div className="text-xs text-ev-on-surface-variant">Primary voice</div>
                      </div>
                    </div>
                    <select
                      value={characters.find(c => c.name === 'Narrator')!.voice}
                      onChange={(e) => updateCharacterVoice(characters.find(c => c.name === 'Narrator')!.id, e.target.value)}
                      className="w-full px-3 py-2 bg-ev-surface border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                    >
                      {voiceOptions.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3">
                  {characters.filter(c => c.name !== 'Narrator').map(character => (
                    <div key={character.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                          style={{ backgroundColor: character.color }}
                        >
                          {character.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-ev-on-surface">{character.name}</span>
                      </div>
                      <select
                        value={character.voice}
                        onChange={(e) => updateCharacterVoice(character.id, e.target.value)}
                        className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-sm text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      >
                        {voiceOptions.map(voice => (
                          <option key={voice} value={voice}>{voice}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Center/Right - Timeline & Scenes */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Audio Drama Builder - Timeline */}
            {timelineSegments.length > 0 && (
              <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ev-on-surface">Audio Drama Timeline</h2>
                  <div className="text-sm text-ev-on-surface-variant">Duration: ~9 min</div>
                </div>

                {/* Voice Layer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-ev-on-surface">
                    <Mic className="w-4 h-4" />
                    <span>Voice Layer</span>
                  </div>
                  <div className="relative h-16 bg-ev-surface-container rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      {timelineSegments
                        .filter(s => s.type === 'voice')
                        .map(segment => (
                          <div
                            key={segment.id}
                            className="absolute h-12 rounded-md flex items-center px-3 text-xs font-medium text-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              left: `${(segment.start / 600) * 100}%`,
                              width: `${(segment.duration / 600) * 100}%`,
                              backgroundColor: segment.color,
                            }}
                          >
                            {segment.label}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Music Layer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-ev-on-surface">
                    <Music className="w-4 h-4" />
                    <span>Music Layer</span>
                  </div>
                  <div className="relative h-16 bg-ev-surface-container rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      {timelineSegments
                        .filter(s => s.type === 'music')
                        .map(segment => (
                          <div
                            key={segment.id}
                            className="absolute h-12 rounded-md flex items-center px-3 text-xs font-medium text-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              left: `${(segment.start / 600) * 100}%`,
                              width: `${(segment.duration / 600) * 100}%`,
                              backgroundColor: '#f97316',
                            }}
                          >
                            {segment.label}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* SFX Layer */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-ev-on-surface">
                    <Volume2 className="w-4 h-4" />
                    <span>Sound Effects</span>
                  </div>
                  <div className="relative h-16 bg-ev-surface-container rounded-lg overflow-hidden">
                    <div className="absolute inset-0 flex items-center">
                      {timelineSegments
                        .filter(s => s.type === 'sfx')
                        .map(segment => (
                          <div
                            key={segment.id}
                            className="absolute h-12 rounded-md flex items-center px-3 text-xs font-medium text-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                            style={{
                              left: `${(segment.start / 600) * 100}%`,
                              width: `${(segment.duration / 600) * 100}%`,
                              backgroundColor: '#eab308',
                            }}
                          >
                            {segment.label}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scene Cards */}
            {scenes.length > 0 && (
              <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-ev-on-surface">Scenes</h2>
                  <button
                    onClick={addScene}
                    className="flex items-center gap-2 px-3 py-1.5 bg-ev-primary-container text-ev-primary hover:bg-ev-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Scene
                  </button>
                </div>

                <div className="space-y-3">
                  {scenes.map(scene => (
                    <motion.div
                      key={scene.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-ev-surface-container rounded-lg border border-ev-outline p-4 hover:border-ev-primary transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <button className="mt-1 text-ev-on-surface-variant hover:text-ev-on-surface cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5" />
                        </button>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-ev-primary">
                              Scene {scene.number}
                            </span>
                            <button
                              onClick={() => removeScene(scene.id)}
                              className="text-ev-error hover:text-ev-error/80 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <p className="text-sm text-ev-on-surface">{scene.text}</p>

                          <div className="flex items-center gap-2">
                            {scene.characters.map(charName => {
                              const character = characters.find(c => c.name === charName);
                              if (!character) return null;
                              return (
                                <div
                                  key={character.id}
                                  className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                  style={{ backgroundColor: character.color }}
                                >
                                  {character.name}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            {scenes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-ev-surface rounded-xl border border-ev-outline p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-ev-on-surface-variant mb-1">Estimated Duration</div>
                    <div className="text-2xl font-bold text-ev-on-surface">8:45</div>
                  </div>
                  <button
                    onClick={handleGenerateAudioDrama}
                    disabled={isGenerating || characters.length === 0}
                    className="flex items-center gap-2 px-8 py-3 bg-ev-primary hover:bg-ev-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isGenerating
                      ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Generating...</>
                      : <><Play className="w-5 h-5" />Generate Audio Drama</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
