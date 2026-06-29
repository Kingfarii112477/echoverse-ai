'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Sparkles,
  Play,
  Download,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Music,
  Type,
  Wand2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface MusicOption {
  id: string;
  name: string;
  mood: string;
}

export default function ReelsGeneratorPage() {
  const [script, setScript] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('bold-center');
  const [selectedVoice, setSelectedVoice] = useState('sophia-professional');
  const [autoSubtitles, setAutoSubtitles] = useState(true);
  const [selectedMusic, setSelectedMusic] = useState('energetic-beat');
  const [selectedPlatform, setSelectedPlatform] = useState('instagram');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHook, setGeneratedHook] = useState('');

  const templates: Template[] = [
    { id: 'bold-center', name: 'Bold Center', description: 'Large centered text', icon: 'A' },
    { id: 'subtitle-bar', name: 'Subtitle Bar', description: 'Bottom bar style', icon: '━' },
    { id: 'word-by-word', name: 'Word by Word', description: 'Highlight current word', icon: '↔' },
    { id: 'pop-up', name: 'Pop Up', description: 'Animated pop-up text', icon: '↑' },
    { id: 'classic', name: 'Classic', description: 'Standard subtitles', icon: '═' },
    { id: 'minimal', name: 'Minimal', description: 'Small bottom text', icon: '·' },
  ];

  const voices = [
    { id: 'sophia-professional', name: 'Sophia - Professional' },
    { id: 'marcus-energetic', name: 'Marcus - Energetic' },
    { id: 'emma-calm', name: 'Emma - Calm' },
    { id: 'nathan-dark', name: 'Nathan - Dark' },
  ];

  const musicOptions: MusicOption[] = [
    { id: 'energetic-beat', name: 'Energetic Beat', mood: 'High Energy' },
    { id: 'calm-ambient', name: 'Calm Ambient', mood: 'Relaxing' },
    { id: 'corporate', name: 'Corporate', mood: 'Professional' },
    { id: 'dramatic', name: 'Dramatic', mood: 'Intense' },
    { id: 'upbeat-pop', name: 'Upbeat Pop', mood: 'Fun' },
    { id: 'no-music', name: 'No Music', mood: 'Silent' },
  ];

  const platforms = [
    { id: 'instagram', name: 'Instagram Reels', icon: '📸' },
    { id: 'tiktok', name: 'TikTok', icon: '🎵' },
    { id: 'youtube', name: 'YouTube Shorts', icon: '▶️' },
  ];

  const generateHook = () => {
    const hooks = [
      'Want to know the secret to going viral? Here it is...',
      'This changed everything for me. Listen up.',
      'Stop scrolling. This will blow your mind.',
      'I wish I knew this 5 years ago. Here\'s what I learned...',
      'The truth nobody talks about. Let me explain.',
    ];
    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
    setGeneratedHook(randomHook);
    setScript(randomHook);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const characterCount = script.length;
  const maxCharacters = 300;

  return (
    <div className="min-h-screen bg-ev-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Video className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-on-surface">Reels Generator</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-6">
            {/* Script Section */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Script</CardTitle>
                  <Button onClick={generateHook} size="sm" variant="outline">
                    <Sparkles className="w-4 h-4 mr-1" />
                    AI Hook Generator
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Write your script or generate an AI hook..."
                  className="w-full h-32 px-4 py-3 bg-ev-surface-high border border-ev-outline rounded-lg text-ev-on-surface placeholder-ev-on-surface-variant resize-none focus:outline-none focus:ring-2 focus:ring-ev-primary"
                  maxLength={maxCharacters}
                />
                <div className="flex justify-between items-center text-sm">
                  <span className={cn(
                    characterCount > maxCharacters * 0.9 ? 'text-ev-error' : 'text-ev-on-surface-variant'
                  )}>
                    {characterCount} / {maxCharacters} characters
                  </span>
                  {generatedHook && (
                    <Badge className="bg-ev-primary-container text-ev-bg">
                      AI Generated
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Caption Template Picker */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Caption Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {templates.map((template) => (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-left',
                        selectedTemplate === template.id
                          ? 'border-ev-primary bg-ev-surface-high'
                          : 'border-ev-outline bg-ev-surface-container hover:border-ev-primary/50'
                      )}
                    >
                      <div className="text-3xl font-bold text-ev-primary mb-2">{template.icon}</div>
                      <div className="text-sm font-medium text-ev-on-surface">{template.name}</div>
                      <div className="text-xs text-ev-on-surface-variant">{template.description}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voice Selector */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Voice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
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

            {/* Auto Subtitle Toggle */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-ev-on-surface">Auto Subtitles</div>
                    <div className="text-sm text-ev-on-surface-variant">Generate subtitles automatically</div>
                  </div>
                  <button
                    onClick={() => setAutoSubtitles(!autoSubtitles)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      autoSubtitles ? 'bg-ev-primary-container' : 'bg-ev-outline'
                    )}
                  >
                    <motion.div
                      animate={{ x: autoSubtitles ? 24 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full"
                    />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Background Music Picker */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Background Music
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {musicOptions.map((music) => (
                    <motion.button
                      key={music.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedMusic(music.id)}
                      className={cn(
                        'p-4 rounded-lg border-2 transition-all text-left',
                        selectedMusic === music.id
                          ? 'border-ev-primary bg-ev-surface-high'
                          : 'border-ev-outline bg-ev-surface-container hover:border-ev-primary/50'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Music className="w-5 h-5 text-ev-primary" />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); }}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium text-ev-on-surface">{music.name}</div>
                      <div className="text-xs text-ev-on-surface-variant">{music.mood}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export Preset Selector */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {platforms.map((platform) => (
                    <motion.button
                      key={platform.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPlatform(platform.id)}
                      className={cn(
                        'flex-1 p-4 rounded-lg border-2 transition-all',
                        selectedPlatform === platform.id
                          ? 'border-ev-primary bg-ev-surface-high'
                          : 'border-ev-outline bg-ev-surface-container hover:border-ev-primary/50'
                      )}
                    >
                      <div className="text-2xl mb-2">{platform.icon}</div>
                      <div className="text-sm font-medium text-ev-on-surface">{platform.name}</div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!script || isGenerating}
              className="w-full bg-ev-primary-container hover:bg-ev-primary text-ev-bg font-bold py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Reel...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Generate Reel
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Phone Preview */}
          <div className="lg:sticky lg:top-6 lg:h-fit">
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Preview</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  {/* Phone Frame */}
                  <div className="w-[280px] h-[500px] bg-ev-surface-high rounded-[32px] border-4 border-ev-outline shadow-2xl overflow-hidden relative">
                    {/* Status Bar Mockup */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-black/50 to-transparent z-10 flex items-center justify-between px-6 text-white text-xs">
                      <span>9:41</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-3 bg-white/80 rounded-sm" />
                        <div className="w-4 h-3 bg-white/80 rounded-sm" />
                        <div className="w-4 h-3 bg-white/80 rounded-sm" />
                      </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="absolute inset-0 bg-gradient-to-br from-ev-surface-high via-ev-surface-container to-ev-surface flex items-center justify-center p-8">
                      {script ? (
                        <div className="text-center">
                          <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              'text-white font-bold leading-tight',
                              selectedTemplate === 'bold-center' && 'text-3xl',
                              selectedTemplate === 'subtitle-bar' && 'text-xl',
                              selectedTemplate === 'word-by-word' && 'text-2xl',
                              selectedTemplate === 'pop-up' && 'text-2xl',
                              selectedTemplate === 'classic' && 'text-lg',
                              selectedTemplate === 'minimal' && 'text-base'
                            )}
                            style={{
                              textShadow: '2px 2px 8px rgba(0,0,0,0.8)',
                            }}
                          >
                            {script.slice(0, 80)}{script.length > 80 ? '...' : ''}
                          </motion.p>
                        </div>
                      ) : (
                        <div className="text-center text-ev-on-surface-variant">
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-sm">Your content will appear here</p>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="absolute bottom-0 right-0 p-4 flex flex-col gap-4 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Heart className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <MessageCircle className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <Share2 className="w-6 h-6 text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                      >
                        <MoreHorizontal className="w-6 h-6 text-white" />
                      </motion.button>
                    </div>

                    {/* Music Indicator */}
                    {selectedMusic !== 'no-music' && (
                      <div className="absolute bottom-20 left-4 right-20 z-10">
                        <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
                          <Music className="w-4 h-4 text-white" />
                          <span className="text-white text-xs truncate flex-1">
                            {musicOptions.find(m => m.id === selectedMusic)?.name}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
