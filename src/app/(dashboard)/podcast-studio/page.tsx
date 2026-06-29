'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Headphones,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  Mic,
  User,
  GripVertical,
  Play,
  Download,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { projectService } from '@/lib/supabase';
import { openAIService } from '@/lib/openai';

interface Guest {
  id: string;
  name: string;
  voice: string;
}

interface ScriptSegment {
  id: string;
  speaker: 'host' | string;
  text: string;
  speakerName: string;
  color: string;
}

const voiceOptions = [
  'Sarah - Professional Female',
  'Alex - Energetic Male',
  'Maya - Warm Female',
  'David - Deep Male',
  'Zara - Conversational Female',
  'Omar - Smooth Male',
];

const speakerColors: { [key: string]: string } = {
  host: '#3b82f6',
  guest1: '#8b5cf6',
  guest2: '#ec4899',
  guest3: '#f59e0b',
  guest4: '#10b981',
};

export default function PodcastStudioPage() {
  const [podcastTitle, setPodcastTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [hostVoice, setHostVoice] = useState(voiceOptions[0]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const { user } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState('');
  const [scriptSegments, setScriptSegments] = useState<ScriptSegment[]>([
    {
      id: '1',
      speaker: 'host',
      speakerName: 'Host',
      text: 'Welcome to Tech Talks Pakistan, where we explore the latest innovations shaping our digital future. I\'m your host, and today we have an incredible conversation lined up.',
      color: speakerColors.host,
    },
    {
      id: '2',
      speaker: 'guest1',
      speakerName: 'Guest 1',
      text: 'Thanks for having me! I\'m excited to share insights about AI development in Pakistan and how it\'s transforming various industries.',
      color: speakerColors.guest1,
    },
    {
      id: '3',
      speaker: 'host',
      speakerName: 'Host',
      text: 'Let\'s dive into today\'s topic. The intersection of artificial intelligence and local languages has been a fascinating development.',
      color: speakerColors.host,
    },
    {
      id: '4',
      speaker: 'guest1',
      speakerName: 'Guest 1',
      text: 'Absolutely! The progress we\'ve made in Urdu language processing is remarkable. We\'re now able to handle complex linguistic nuances that were impossible just a few years ago.',
      color: speakerColors.guest1,
    },
  ]);

  const addGuest = () => {
    if (guests.length >= 4) return;

    const newGuest: Guest = {
      id: `guest${guests.length + 1}`,
      name: `Guest ${guests.length + 1}`,
      voice: voiceOptions[guests.length + 1] || voiceOptions[0],
    };
    setGuests([...guests, newGuest]);
  };

  const removeGuest = (guestId: string) => {
    setGuests(guests.filter(g => g.id !== guestId));
    setScriptSegments(scriptSegments.filter(s => s.speaker !== guestId));
  };

  const updateGuestName = (guestId: string, name: string) => {
    setGuests(guests.map(g => g.id === guestId ? { ...g, name } : g));
    setScriptSegments(scriptSegments.map(s =>
      s.speaker === guestId ? { ...s, speakerName: name } : s
    ));
  };

  const updateGuestVoice = (guestId: string, voice: string) => {
    setGuests(guests.map(g => g.id === guestId ? { ...g, voice } : g));
  };

  const addScriptSegment = () => {
    const newSegment: ScriptSegment = {
      id: Date.now().toString(),
      speaker: 'host',
      speakerName: 'Host',
      text: '',
      color: speakerColors.host,
    };
    setScriptSegments([...scriptSegments, newSegment]);
  };

  const removeScriptSegment = (segmentId: string) => {
    setScriptSegments(scriptSegments.filter(s => s.id !== segmentId));
  };

  const updateScriptSegment = (segmentId: string, field: 'speaker' | 'text', value: string) => {
    setScriptSegments(scriptSegments.map(s => {
      if (s.id === segmentId) {
        if (field === 'speaker') {
          const speakerName = value === 'host' ? 'Host' : guests.find(g => g.id === value)?.name || value;
          return { ...s, speaker: value, speakerName, color: speakerColors[value] || speakerColors.host };
        }
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  const handleGenerateScript = useCallback(async () => {
    if (!topic.trim()) return;
    setIsGeneratingScript(true);
    try {
      const guestNames = guests.map(g => g.name).join(', ');
      const prompt = `Create a ${podcastTitle || 'podcast'} script about: ${topic}. Host: ${hostVoice}${guestNames ? `. Guests: ${guestNames}` : ''}. Format: Host: [dialogue]\nGuest: [dialogue]`;
      const script = await openAIService.generateScript('podcast', prompt);
      // Parse into segments
      const lines = script.split('\n').filter(l => l.trim());
      const newSegments = lines
        .filter(l => l.includes(':'))
        .slice(0, 20)
        .map((line, i) => {
          const [speaker, ...rest] = line.split(':');
          return { id: `seg-${Date.now()}-${i}`, speaker: speaker.trim(), text: rest.join(':').trim(), voice: hostVoice };
        });
      if (newSegments.length > 0) setScriptSegments(newSegments);
    } catch (err: any) { setGenerateError(err.message); }
    finally { setIsGeneratingScript(false); }
  }, [topic, podcastTitle, hostVoice, guests]);

  const handleGeneratePodcast = useCallback(async () => {
    if (!user || scriptSegments.length === 0) return;
    setIsGenerating(true);
    setGenerateError('');
    try {
      const project = await projectService.createProject({
        user_id: user.id,
        title: podcastTitle || `Podcast — ${topic}`,
        type: 'podcast',
        status: 'generating',
        progress: 0,
        metadata: { topic, segments: scriptSegments.length },
      });

      // Generate each segment
      const blobs: Blob[] = [];
      for (let i = 0; i < scriptSegments.length; i++) {
        const seg = scriptSegments[i];
        const res = await fetch('/api/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: seg.text, voiceId: 'EXAVITQu4vr4xnSDxMaL', stability: 0.5, similarityBoost: 0.75 }),
        });
        if (res.ok) blobs.push(await res.blob());
        await projectService.updateProject(project.id, { progress: Math.round(((i + 1) / scriptSegments.length) * 100) });
      }

      if (blobs.length > 0) {
        const url = URL.createObjectURL(blobs[0]);
        setGeneratedAudioUrl(url);
      }
      await projectService.updateProject(project.id, { status: 'completed', progress: 100 });
    } catch (err: any) { setGenerateError(err.message); }
    finally { setIsGenerating(false); }
  }, [user, scriptSegments, podcastTitle, topic]);

  const downloadAudio = (url: string, format: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podcastTitle || 'podcast'}.${format}`;
    a.click();
  };


  return (
    <div className="min-h-screen bg-ev-bg">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-ev-primary flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-ev-on-surface">Podcast Studio</h1>
            <p className="text-ev-on-surface-variant">Create professional podcasts with AI</p>
          </div>
        </motion.div>

        {/* Top Section - Podcast Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Podcast Title
              </label>
              <input
                type="text"
                value={podcastTitle}
                onChange={(e) => setPodcastTitle(e.target.value)}
                placeholder="e.g., Tech Talks Pakistan"
                className="w-full px-4 py-2.5 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Episode Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Pakistani Languages"
                className="w-full px-4 py-2.5 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ev-on-surface mb-2">
              Episode Description
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe your podcast episode..."
              className="w-full min-h-[80px] px-4 py-2.5 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary resize-none"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Host & Guests */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Host Voice */}
            <div className="bg-ev-surface rounded-xl border-2 border-ev-primary p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-ev-on-surface">Host</h3>
                  <p className="text-xs text-ev-on-surface-variant">Primary voice</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ev-on-surface mb-2">
                  Voice Selection
                </label>
                <select
                  value={hostVoice}
                  onChange={(e) => setHostVoice(e.target.value)}
                  className="w-full px-3 py-2 bg-ev-surface-container border border-ev-outline rounded-lg text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                >
                  {voiceOptions.map(voice => (
                    <option key={voice} value={voice}>{voice}</option>
                  ))}
                </select>
              </div>

              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline rounded-lg text-sm font-medium text-ev-on-surface transition-colors">
                <Play className="w-4 h-4" />
                Preview Voice
              </button>
            </div>

            {/* Guests */}
            <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ev-on-surface">Guest Voices</h3>
                <span className="text-xs text-ev-on-surface-variant">{guests.length}/4</span>
              </div>

              <div className="space-y-3">
                {guests.map((guest, index) => (
                  <div
                    key={guest.id}
                    className="p-4 bg-ev-surface-container rounded-lg border border-ev-outline space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: speakerColors[guest.id] }}
                      >
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={guest.name}
                        onChange={(e) => updateGuestName(guest.id, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-ev-surface border border-ev-outline rounded text-sm text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                      />
                      <button
                        onClick={() => removeGuest(guest.id)}
                        className="text-ev-error hover:text-ev-error/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={guest.voice}
                      onChange={(e) => updateGuestVoice(guest.id, e.target.value)}
                      className="w-full px-3 py-2 bg-ev-surface border border-ev-outline rounded-lg text-sm text-ev-on-surface focus:outline-none focus:ring-2 focus:ring-ev-primary"
                    >
                      {voiceOptions.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {guests.length < 4 && (
                <button
                  onClick={addGuest}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-ev-primary-container text-ev-primary hover:bg-ev-primary hover:text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Guest
                </button>
              )}
            </div>

            {/* AI Generators */}
            <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-3">
              <h3 className="font-semibold text-ev-on-surface mb-4">AI Generators</h3>

              <button className="w-full flex items-center gap-3 p-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-ev-primary-container flex items-center justify-center group-hover:bg-ev-primary transition-colors">
                  <Wand2 className="w-5 h-5 text-ev-primary group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <button onClick={handleGenerateScript} disabled={isGeneratingScript || !topic.trim()} className="text-sm font-medium text-ev-on-surface disabled:opacity-50">{isGeneratingScript ? "Generating..." : "Generate Script"}</button>
                  <div className="text-xs text-ev-on-surface-variant">AI-powered script</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-ev-primary-container flex items-center justify-center group-hover:bg-ev-primary transition-colors">
                  <Sparkles className="w-5 h-5 text-ev-primary group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-ev-on-surface">Generate Intro</div>
                  <div className="text-xs text-ev-on-surface-variant">Engaging opening</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-ev-primary-container flex items-center justify-center group-hover:bg-ev-primary transition-colors">
                  <FileText className="w-5 h-5 text-ev-primary group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-ev-on-surface">Generate Outro</div>
                  <div className="text-xs text-ev-on-surface-variant">Perfect closing</div>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-ev-primary-container flex items-center justify-center group-hover:bg-ev-primary transition-colors">
                  <FileText className="w-5 h-5 text-ev-primary group-hover:text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium text-ev-on-surface">Generate Chapters</div>
                  <div className="text-xs text-ev-on-surface-variant">Auto timestamps</div>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Right Panel - Script Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Script Editor */}
            <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ev-on-surface">Podcast Script</h3>
                <button
                  onClick={addScriptSegment}
                  className="flex items-center gap-2 px-3 py-1.5 bg-ev-primary-container text-ev-primary hover:bg-ev-primary hover:text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Segment
                </button>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {scriptSegments.map((segment, index) => (
                  <motion.div
                    key={segment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-ev-surface-container rounded-lg border border-ev-outline p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-2 text-ev-on-surface-variant hover:text-ev-on-surface cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-5 h-5" />
                      </button>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <select
                            value={segment.speaker}
                            onChange={(e) => updateScriptSegment(segment.id, 'speaker', e.target.value)}
                            className="px-3 py-1.5 rounded-full text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-ev-primary"
                            style={{ backgroundColor: segment.color }}
                          >
                            <option value="host">Host</option>
                            {guests.map(guest => (
                              <option key={guest.id} value={guest.id}>
                                {guest.name}
                              </option>
                            ))}
                          </select>

                          <div className="text-xs text-ev-on-surface-variant">
                            Segment {index + 1}
                          </div>
                        </div>

                        <textarea
                          value={segment.text}
                          onChange={(e) => updateScriptSegment(segment.id, 'text', e.target.value)}
                          placeholder="Enter dialogue..."
                          className="w-full min-h-[80px] px-3 py-2 bg-ev-surface border border-ev-outline rounded-lg text-sm text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary resize-none"
                        />
                      </div>

                      <button
                        onClick={() => removeScriptSegment(segment.id)}
                        className="mt-2 text-ev-error hover:text-ev-error/80 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Waveform Preview Placeholder */}
            <div className="bg-ev-surface rounded-xl border border-ev-outline p-6 space-y-4">
              <h3 className="text-lg font-semibold text-ev-on-surface">Preview</h3>

              <div className="h-32 bg-ev-surface-container rounded-lg border border-ev-outline flex items-center justify-center">
                <div className="text-center text-ev-on-surface-variant">
                  <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Generate podcast to preview waveform</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGeneratePodcast}
                  disabled={isGenerating || scriptSegments.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-ev-primary hover:bg-ev-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isGenerating
                    ? <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />Generating...</>
                    : <><Play className="w-5 h-5" />Generate Podcast</>
                  }
                </button>
                <button
                  onClick={() => generatedAudioUrl && downloadAudio(generatedAudioUrl, 'mp3')}
                  disabled={!generatedAudioUrl}
                  className="flex items-center gap-2 px-4 py-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline text-ev-on-surface rounded-lg font-medium transition-colors disabled:opacity-40"
                >
                  <Download className="w-5 h-5" />MP3
                </button>
                <button className="flex items-center gap-2 px-4 py-3 bg-ev-surface-container hover:bg-ev-surface-high border border-ev-outline text-ev-on-surface rounded-lg font-medium transition-colors">
                  <Download className="w-5 h-5" />
                  WAV
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
