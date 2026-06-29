'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Library,
  Upload,
  GripVertical,
  Plus,
  Trash2,
  Play,
  Download,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';

interface Chapter {
  id: string;
  title: string;
  duration: string;
  emotion: string;
  intensity: number;
  content?: string;
  audioUrl?: string;
  status?: string;
}

interface Character {
  id: string;
  name: string;
  voice: string;
  color: string;
}

interface Pronunciation {
  id: string;
  word: string;
  phonetic: string;
  language: string;
}

export default function AudiobookStudioPage() {
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('sophia-professional');

  const [chapters, setChapters] = useState<Chapter[]>([
    { id: '1', title: 'Chapter 1: The Beginning', duration: '12:30', emotion: 'Calm', intensity: 50 },
    { id: '2', title: 'Chapter 2: The Journey', duration: '15:45', emotion: 'Exciting', intensity: 70 },
    { id: '3', title: 'Chapter 3: The Discovery', duration: '18:20', emotion: 'Dramatic', intensity: 80 },
    { id: '4', title: 'Chapter 4: The Challenge', duration: '14:15', emotion: 'Tense', intensity: 85 },
    { id: '5', title: 'Chapter 5: The Resolution', duration: '16:50', emotion: 'Uplifting', intensity: 60 },
  ]);

  const [characters, setCharacters] = useState<Character[]>([
    { id: '1', name: 'Narrator', voice: 'sophia-professional', color: '#aeecff' },
    { id: '2', name: 'Hero', voice: 'marcus-energetic', color: '#00d8ff' },
    { id: '3', name: 'Mentor', voice: 'oliver-wise', color: '#ccbdff' },
    { id: '4', name: 'Villain', voice: 'nathan-dark', color: '#ffb4ab' },
  ]);

  const [pronunciations, setPronunciations] = useState<Pronunciation[]>([
    { id: '1', word: 'محبت', phonetic: 'mohabbat', language: 'Urdu' },
    { id: '2', word: 'خوبصورت', phonetic: 'khubsurat', language: 'Urdu' },
    { id: '3', word: 'دوست', phonetic: 'dost', language: 'Urdu' },
    { id: '4', word: 'سلام', phonetic: 'salaam', language: 'Urdu' },
  ]);

  const voices = [
    { id: 'sophia-professional', name: 'Sophia - Professional' },
    { id: 'marcus-energetic', name: 'Marcus - Energetic' },
    { id: 'oliver-wise', name: 'Oliver - Wise' },
    { id: 'nathan-dark', name: 'Nathan - Dark' },
    { id: 'emma-calm', name: 'Emma - Calm' },
  ];

  const emotions = ['Calm', 'Dramatic', 'Exciting', 'Tense', 'Uplifting', 'Mysterious', 'Joyful'];

  const [bookTitle, setBookTitle] = useState('');
  const [narratorVoice, setNarratorVoice] = useState('sophia-professional');
  const [uploadedText, setUploadedText] = useState('');

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      setFile({
        name: files[0].name,
        size: `${(files[0].size / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      setFile({
        name: files[0].name,
        size: `${(files[0].size / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  };

  const updateChapter = (id: string, field: keyof Chapter, value: any) => {
    setChapters(chapters.map(ch => ch.id === id ? { ...ch, [field]: value } : ch));
  };

  const addChapter = () => {
    const newId = String(chapters.length + 1);
    setChapters([...chapters, {
      id: newId,
      title: `Chapter ${newId}: New Chapter`,
      duration: '10:00',
      emotion: 'Calm',
      intensity: 50,
    }]);
  };

  const removeChapter = (id: string) => {
    setChapters(chapters.filter(ch => ch.id !== id));
  };

  const updateCharacterVoice = (id: string, voice: string) => {
    setCharacters(characters.map(ch => ch.id === id ? { ...ch, voice } : ch));
  };

  const addPronunciation = () => {
    setPronunciations([...pronunciations, {
      id: String(pronunciations.length + 1),
      word: '',
      phonetic: '',
      language: 'Urdu',
    }]);
  };

  const updatePronunciation = (id: string, field: keyof Pronunciation, value: string) => {
    setPronunciations(pronunciations.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removePronunciation = (id: string) => {
    setPronunciations(pronunciations.filter(p => p.id !== id));
  };

  const calculateTotalDuration = () => {
    const totalMinutes = chapters.reduce((acc, ch) => {
      const [mins, secs] = ch.duration.split(':').map(Number);
      return acc + mins + (secs / 60);
    }, 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  const handleGenerate = async () => {
    const textToGenerate = uploadedText || chapters.map(c => c.content || c.title).join('\n\n');
    if (!textToGenerate.trim() || !narratorVoice) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Save project
      const { useAuthStore } = await import('@/stores/authStore');
      const { user } = useAuthStore.getState();
      let projectId: string | null = null;

      if (user) {
        const { projectService } = await import('@/lib/supabase');
        const project = await projectService.createProject({
          user_id: user.id,
          title: bookTitle || 'Untitled Audiobook',
          type: 'audiobook',
          status: 'generating',
          progress: 0,
          metadata: { chapters: chapters.length, narrator: narratorVoice },
        });
        projectId = project.id;
      }

      // Generate chapter by chapter
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const chapterText = chapter.content || chapter.title;
        if (!chapterText.trim()) continue;

        const res = await fetch('/api/generate-speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chapterText.slice(0, 2500), // ElevenLabs limit per request
            voiceId: narratorVoice,
            stability: 0.6,
            similarityBoost: 0.8,
            style: 0.3,
          }),
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setChapters(prev =>
            prev.map((c, idx) => idx === i ? { ...c, audioUrl: url, status: 'done' } : c)
          );
        }

        const progress = Math.round(((i + 1) / chapters.length) * 100);
        setProgress(progress);

        if (projectId) {
          const { projectService } = await import('@/lib/supabase');
          await projectService.updateProject(projectId, { progress });
        }
      }

      if (projectId) {
        const { projectService } = await import('@/lib/supabase');
        await projectService.updateProject(projectId, { status: 'completed', progress: 100 });
      }
    } catch (err: any) {
      console.error('Audiobook generation error:', err);
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-ev-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-on-surface">Audiobook Studio</h1>
        </div>

        {/* Upload Section */}
        <Card className="bg-ev-surface border-ev-outline">
          <CardHeader>
            <CardTitle className="text-ev-on-surface">Upload Book File</CardTitle>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
                  isDragging ? 'border-ev-primary bg-ev-surface-high' : 'border-ev-outline bg-ev-surface-container'
                )}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-12 h-12 text-ev-on-surface-variant mx-auto mb-4" />
                <p className="text-ev-on-surface mb-2">Drop your book file here</p>
                <p className="text-sm text-ev-on-surface-variant">Supports PDF, TXT, DOCX</p>
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-ev-surface-container rounded-lg">
                <FileText className="w-8 h-8 text-ev-primary" />
                <div className="flex-1">
                  <p className="text-ev-on-surface font-medium">{file.name}</p>
                  <p className="text-sm text-ev-on-surface-variant">{file.size}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  className="text-ev-error"
                >
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {file && (
          <>
            {/* Chapter Detection */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Chapters</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={addChapter} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Chapter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 bg-ev-surface-container rounded-lg"
                  >
                    <GripVertical className="w-5 h-5 text-ev-on-surface-variant cursor-grab" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Input
                          value={chapter.title}
                          onChange={(e) => updateChapter(chapter.id, 'title', e.target.value)}
                          className="flex-1 bg-ev-surface-high border-ev-outline text-ev-on-surface"
                        />
                        <Badge variant="outline" className="bg-ev-surface-high text-ev-on-surface-variant">
                          {chapter.duration}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <select
                          value={chapter.emotion}
                          onChange={(e) => updateChapter(chapter.id, 'emotion', e.target.value)}
                          className="px-3 py-1.5 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface text-sm"
                        >
                          {emotions.map(emotion => (
                            <option key={emotion} value={emotion}>{emotion}</option>
                          ))}
                        </select>
                        <div className="flex-1 flex items-center gap-3">
                          <span className="text-sm text-ev-on-surface-variant">Intensity:</span>
                          <Slider
                            value={chapter.intensity}
                            onChange={(value) => updateChapter(chapter.id, 'intensity', value)}
                            max={100}
                            step={5}
                          />
                          <span className="text-sm text-ev-on-surface w-8">{chapter.intensity}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChapter(chapter.id)}
                      className="text-ev-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Narrator Voice Selector */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Narrator Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <select
                    value={narratorVoice}
                    onChange={(e) => setNarratorVoice(e.target.value)}
                    className="flex-1 px-4 py-2 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface"
                  >
                    {voices.map(voice => (
                      <option key={voice.id} value={voice.id}>{voice.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" size="sm">
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Character Voice Map */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Character Voices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {characters.map((character) => (
                  <div key={character.id} className="flex items-center gap-4 p-3 bg-ev-surface-container rounded-lg">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-ev-bg"
                      style={{ backgroundColor: character.color }}
                    >
                      {character.name[0]}
                    </div>
                    <span className="text-ev-on-surface font-medium w-24">{character.name}</span>
                    <select
                      value={character.voice}
                      onChange={(e) => updateCharacterVoice(character.id, e.target.value)}
                      className="flex-1 px-3 py-2 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface"
                    >
                      {voices.map(voice => (
                        <option key={voice.id} value={voice.id}>{voice.name}</option>
                      ))}
                    </select>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pronunciation Dictionary */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Custom Pronunciations</CardTitle>
                  <Button onClick={addPronunciation} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr,1fr,120px,60px] gap-3 text-sm text-ev-on-surface-variant font-medium pb-2 border-b border-ev-outline">
                    <div>Word</div>
                    <div>Phonetic</div>
                    <div>Language</div>
                    <div></div>
                  </div>
                  {pronunciations.map((pronunciation) => (
                    <div key={pronunciation.id} className="grid grid-cols-[1fr,1fr,120px,60px] gap-3 items-center">
                      <Input
                        value={pronunciation.word}
                        onChange={(e) => updatePronunciation(pronunciation.id, 'word', e.target.value)}
                        placeholder="Word"
                        className="bg-ev-surface-high border-ev-outline text-ev-on-surface"
                      />
                      <Input
                        value={pronunciation.phonetic}
                        onChange={(e) => updatePronunciation(pronunciation.id, 'phonetic', e.target.value)}
                        placeholder="Phonetic"
                        className="bg-ev-surface-high border-ev-outline text-ev-on-surface"
                      />
                      <select
                        value={pronunciation.language}
                        onChange={(e) => updatePronunciation(pronunciation.id, 'language', e.target.value)}
                        className="px-3 py-2 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface"
                      >
                        <option value="Urdu">Urdu</option>
                        <option value="Arabic">Arabic</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Other">Other</option>
                      </select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePronunciation(pronunciation.id)}
                        className="text-ev-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Timeline</CardTitle>
                  <Badge className="bg-ev-primary-container text-ev-bg font-bold">
                    Total: {calculateTotalDuration()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chapters.map((chapter, index) => {
                    const colors = ['#aeecff', '#00d8ff', '#ccbdff', '#859398', '#3c494d'];
                    return (
                      <div key={chapter.id} className="flex items-center gap-3">
                        <div
                          className="h-12 rounded flex items-center px-4 text-ev-bg font-medium relative overflow-hidden"
                          style={{
                            backgroundColor: colors[index % colors.length],
                            width: `${(parseInt(chapter.duration.split(':')[0]) * 60 + parseInt(chapter.duration.split(':')[1])) / 10}%`,
                            minWidth: '120px',
                          }}
                        >
                          <span className="text-sm truncate">{chapter.title}</span>
                        </div>
                        <span className="text-sm text-ev-on-surface-variant">{chapter.duration}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardContent className="pt-6">
                {!isGenerating && progress < 100 ? (
                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-ev-primary-container hover:bg-ev-primary text-ev-bg font-bold py-6 text-lg"
                  >
                    Generate Audiobook
                  </Button>
                ) : progress === 100 ? (
                  <div className="space-y-4">
                    <div className="text-center text-ev-primary font-medium">
                      Audiobook generation complete!
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-ev-primary-container hover:bg-ev-primary text-ev-bg">
                        <Download className="w-4 h-4 mr-2" />
                        Download MP3
                      </Button>
                      <Button className="flex-1 bg-ev-secondary hover:bg-ev-secondary/90 text-ev-bg">
                        <Download className="w-4 h-4 mr-2" />
                        Download M4B
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-ev-on-surface-variant">
                      <span>Generating audiobook...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-3 bg-ev-surface-container rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-ev-primary-container"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
}
