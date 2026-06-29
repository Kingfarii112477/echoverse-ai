'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Upload,
  Play,
  ZoomIn,
  ZoomOut,
  Scissors,
  Download,
  Plus,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Slider } from '@/components/ui/Slider';

interface Scene {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  voice: string;
  color: string;
}

interface Subtitle {
  id: string;
  startTime: string;
  endTime: string;
  text: string;
}

export default function VideoStudioPage() {
  const [videoFile, setVideoFile] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(30);
  const [selectedResolution, setSelectedResolution] = useState('1080p');

  const [scenes, setScenes] = useState<Scene[]>([
    { id: '1', title: 'Scene 1: Opening', startTime: '0:00', endTime: '0:15', voice: 'sophia-professional', color: '#aeecff' },
    { id: '2', title: 'Scene 2: Introduction', startTime: '0:15', endTime: '0:45', voice: 'marcus-energetic', color: '#00d8ff' },
    { id: '3', title: 'Scene 3: Main Content', startTime: '0:45', endTime: '2:00', voice: 'sophia-professional', color: '#ccbdff' },
    { id: '4', title: 'Scene 4: Closing', startTime: '2:00', endTime: '2:30', voice: 'oliver-wise', color: '#859398' },
  ]);

  const [subtitles, setSubtitles] = useState<Subtitle[]>([
    { id: '1', startTime: '0:00', endTime: '0:03', text: 'Welcome to our video presentation' },
    { id: '2', startTime: '0:03', endTime: '0:06', text: 'Today we will explore the future' },
    { id: '3', startTime: '0:06', endTime: '0:09', text: 'of voice synthesis technology' },
    { id: '4', startTime: '0:15', endTime: '0:18', text: 'First, let me introduce the concept' },
    { id: '5', startTime: '0:18', endTime: '0:22', text: 'This is a revolutionary approach' },
    { id: '6', startTime: '0:45', endTime: '0:49', text: 'The main features include accuracy' },
  ]);

  const [captionStyle, setCaptionStyle] = useState({
    font: 'Inter',
    fontSize: 24,
    position: 'bottom',
    color: '#aeecff',
    bgOpacity: 70,
  });

  const voices = [
    { id: 'sophia-professional', name: 'Sophia - Professional' },
    { id: 'marcus-energetic', name: 'Marcus - Energetic' },
    { id: 'oliver-wise', name: 'Oliver - Wise' },
    { id: 'emma-calm', name: 'Emma - Calm' },
  ];

  const fonts = ['Inter', 'Arial', 'Roboto', 'Montserrat', 'Poppins', 'Open Sans'];
  const positions = ['top', 'center', 'bottom'];
  const colors = ['#aeecff', '#00d8ff', '#ccbdff', '#ffffff', '#ffb4ab'];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      setVideoFile({
        name: files[0].name,
        size: `${(files[0].size / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      setVideoFile({
        name: files[0].name,
        size: `${(files[0].size / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  };

  const updateScene = (id: string, field: keyof Scene, value: string) => {
    setScenes(scenes.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateSubtitle = (id: string, field: keyof Subtitle, value: string) => {
    setSubtitles(subtitles.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const addSubtitle = () => {
    setSubtitles([...subtitles, {
      id: String(subtitles.length + 1),
      startTime: '0:00',
      endTime: '0:03',
      text: 'New subtitle',
    }]);
  };

  const deleteSubtitle = (id: string) => {
    setSubtitles(subtitles.filter(s => s.id !== id));
  };

  const timeToSeconds = (time: string): number => {
    const parts = time.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
    return 0;
  };

  const totalDuration = 150; // 2:30 in seconds

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
          <Video className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-on-surface">Video Studio</h1>
        </div>

        {/* Video Upload */}
        <Card className="bg-ev-surface border-ev-outline">
          <CardHeader>
            <CardTitle className="text-ev-on-surface">Upload Video</CardTitle>
          </CardHeader>
          <CardContent>
            {!videoFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                  'border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer',
                  isDragging ? 'border-ev-primary bg-ev-surface-high' : 'border-ev-outline bg-ev-surface-container'
                )}
                onClick={() => document.getElementById('video-input')?.click()}
              >
                <Upload className="w-12 h-12 text-ev-on-surface-variant mx-auto mb-4" />
                <p className="text-ev-on-surface mb-2">Drop your video file here</p>
                <p className="text-sm text-ev-on-surface-variant">Supports MP4, MOV, WebM</p>
                <input
                  id="video-input"
                  type="file"
                  className="hidden"
                  accept="video/*"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-ev-surface-container rounded-lg">
                  <Video className="w-8 h-8 text-ev-primary" />
                  <div className="flex-1">
                    <p className="text-ev-on-surface font-medium">{videoFile.name}</p>
                    <p className="text-sm text-ev-on-surface-variant">{videoFile.size}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoFile(null)}
                    className="text-ev-error"
                  >
                    Remove
                  </Button>
                </div>
                <div className="aspect-video bg-ev-surface-high rounded-lg flex items-center justify-center">
                  <Play className="w-16 h-16 text-ev-on-surface-variant" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {videoFile && (
          <>
            {/* Timeline Editor */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Timeline Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-ev-on-surface-variant w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Time markers */}
                  <div className="flex text-xs text-ev-on-surface-variant border-b border-ev-outline pb-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex-1 text-center">
                        0:{String(i * 30).padStart(2, '0')}
                      </div>
                    ))}
                  </div>

                  {/* Video Track */}
                  <div className="space-y-2">
                    <div className="text-sm text-ev-on-surface-variant font-medium">Video Track</div>
                    <div className="relative h-16 bg-ev-surface-container rounded">
                      <div className="absolute inset-0 flex">
                        {scenes.map((scene) => {
                          const start = timeToSeconds(scene.startTime);
                          const end = timeToSeconds(scene.endTime);
                          const duration = end - start;
                          const left = (start / totalDuration) * 100;
                          const width = (duration / totalDuration) * 100;

                          return (
                            <div
                              key={scene.id}
                              className="absolute h-full flex items-center px-3 text-xs font-medium text-ev-bg"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                backgroundColor: scene.color,
                              }}
                            >
                              <span className="truncate">{scene.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Voice Track */}
                  <div className="space-y-2">
                    <div className="text-sm text-ev-on-surface-variant font-medium">Voice Track</div>
                    <div className="relative h-12 bg-ev-surface-container rounded">
                      <div className="absolute inset-0 flex">
                        {scenes.map((scene, index) => {
                          const start = timeToSeconds(scene.startTime);
                          const end = timeToSeconds(scene.endTime);
                          const duration = end - start;
                          const left = (start / totalDuration) * 100;
                          const width = (duration / totalDuration) * 100;
                          const colors = ['#aeecff', '#00d8ff', '#ccbdff', '#859398'];

                          return (
                            <div
                              key={scene.id}
                              className="absolute h-full"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                                backgroundColor: colors[index % colors.length],
                                opacity: 0.7,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Subtitles Track */}
                  <div className="space-y-2">
                    <div className="text-sm text-ev-on-surface-variant font-medium">Subtitles Track</div>
                    <div className="relative h-12 bg-ev-surface-container rounded">
                      <div className="absolute inset-0">
                        {subtitles.map((subtitle, index) => {
                          const start = timeToSeconds(subtitle.startTime);
                          const end = timeToSeconds(subtitle.endTime);
                          const duration = end - start;
                          const left = (start / totalDuration) * 100;
                          const width = (duration / totalDuration) * 100;

                          return (
                            <div
                              key={subtitle.id}
                              className="absolute h-full bg-ev-secondary opacity-60 border border-ev-outline"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Playhead */}
                  <div className="relative -mt-2">
                    <div
                      className="absolute w-0.5 bg-ev-primary h-48 -mt-44"
                      style={{ left: `${playheadPosition}%` }}
                    >
                      <div className="absolute -top-2 -left-2 w-4 h-4 bg-ev-primary rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scene Manager */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Scenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {scenes.map((scene, index) => (
                  <motion.div
                    key={scene.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 bg-ev-surface-container rounded-lg"
                  >
                    <div
                      className="w-16 h-16 rounded flex items-center justify-center text-2xl font-bold text-ev-bg"
                      style={{ backgroundColor: scene.color }}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        value={scene.title}
                        onChange={(e) => updateScene(scene.id, 'title', e.target.value)}
                        className="bg-ev-surface-high border-ev-outline text-ev-on-surface"
                      />
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-ev-surface-high text-ev-on-surface-variant">
                          {scene.startTime} - {scene.endTime}
                        </Badge>
                        <select
                          value={scene.voice}
                          onChange={(e) => updateScene(scene.id, 'voice', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface text-sm"
                        >
                          {voices.map(voice => (
                            <option key={voice.id} value={voice.id}>{voice.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Scissors className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Subtitle Editor */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-ev-on-surface">Subtitles</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Auto Generate
                    </Button>
                    <Button onClick={addSubtitle} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subtitles.map((subtitle) => (
                    <div key={subtitle.id} className="flex items-start gap-3 p-3 bg-ev-surface-container rounded-lg">
                      <div className="flex gap-2 items-center">
                        <Input
                          value={subtitle.startTime}
                          onChange={(e) => updateSubtitle(subtitle.id, 'startTime', e.target.value)}
                          className="w-20 bg-ev-surface-high border-ev-outline text-ev-on-surface text-sm"
                        />
                        <span className="text-ev-on-surface-variant">→</span>
                        <Input
                          value={subtitle.endTime}
                          onChange={(e) => updateSubtitle(subtitle.id, 'endTime', e.target.value)}
                          className="w-20 bg-ev-surface-high border-ev-outline text-ev-on-surface text-sm"
                        />
                      </div>
                      <Input
                        value={subtitle.text}
                        onChange={(e) => updateSubtitle(subtitle.id, 'text', e.target.value)}
                        className="flex-1 bg-ev-surface-high border-ev-outline text-ev-on-surface"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubtitle(subtitle.id)}
                        className="text-ev-error"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Caption Style Editor */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Caption Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-ev-on-surface-variant">Font</label>
                    <select
                      value={captionStyle.font}
                      onChange={(e) => setCaptionStyle({ ...captionStyle, font: e.target.value })}
                      className="w-full px-3 py-2 bg-ev-surface-high border border-ev-outline rounded-md text-ev-on-surface"
                    >
                      {fonts.map(font => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-ev-on-surface-variant">Font Size: {captionStyle.fontSize}px</label>
                    <Slider
                      value={[captionStyle.fontSize]}
                      onValueChange={([value]) => setCaptionStyle({ ...captionStyle, fontSize: value })}
                      min={12}
                      max={48}
                      step={2}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-ev-on-surface-variant">Position</label>
                  <div className="flex gap-2">
                    {positions.map(pos => (
                      <Button
                        key={pos}
                        variant={captionStyle.position === pos ? 'default' : 'outline'}
                        onClick={() => setCaptionStyle({ ...captionStyle, position: pos })}
                        className={captionStyle.position === pos ? 'bg-ev-primary-container text-ev-bg' : ''}
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-ev-on-surface-variant">Color</label>
                  <div className="flex gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setCaptionStyle({ ...captionStyle, color })}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all',
                          captionStyle.color === color ? 'border-ev-primary scale-110' : 'border-ev-outline'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-ev-on-surface-variant">Background Opacity: {captionStyle.bgOpacity}%</label>
                  <Slider
                    value={[captionStyle.bgOpacity]}
                    onValueChange={([value]) => setCaptionStyle({ ...captionStyle, bgOpacity: value })}
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export */}
            <Card className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <CardTitle className="text-ev-on-surface">Export Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-ev-on-surface-variant">Resolution:</label>
                  <div className="flex gap-2">
                    {['1080p', '720p', '480p'].map(res => (
                      <Button
                        key={res}
                        variant={selectedResolution === res ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedResolution(res)}
                        className={selectedResolution === res ? 'bg-ev-primary-container text-ev-bg' : ''}
                      >
                        {res}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button className="w-full bg-ev-primary-container hover:bg-ev-primary text-ev-bg font-bold py-6 text-lg">
                  <Download className="w-5 h-5 mr-2" />
                  Export as MP4
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>
    </div>
  );
}
