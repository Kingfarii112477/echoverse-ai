'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Slider } from '@/components/ui/Slider';

type EmotionNode = {
  id: string;
  label: string;
  emoji: string;
  color: string;
  angle?: number;
  radius?: number;
};

const emotions: EmotionNode[] = [
  { id: 'happy', label: 'Happy', emoji: '😊', color: '#fbbf24', angle: 0, radius: 220 },
  { id: 'excited', label: 'Excited', emoji: '🎉', color: '#fb923c', angle: 60, radius: 220 },
  { id: 'drama', label: 'Drama', emoji: '🎭', color: '#a855f7', angle: 120, radius: 220 },
  { id: 'sad', label: 'Sad', emoji: '😢', color: '#3b82f6', angle: 180, radius: 220 },
  { id: 'calm', label: 'Calm', emoji: '😌', color: '#14b8a6', angle: 240, radius: 220 },
  { id: 'inspire', label: 'Inspire', emoji: '✨', color: '#06b6d4', angle: 300, radius: 220 },
  { id: 'spiritual', label: 'Spiritual', emoji: '🕌', color: '#d97706', angle: 45, radius: 110 },
  { id: 'corporate', label: 'Corporate', emoji: '💼', color: '#0891b2', angle: 225, radius: 110 },
];

export default function EmotionEnginePage() {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('happy');
  const [intensity, setIntensity] = useState(70);
  const [pacing, setPacing] = useState(1.0);
  const [pitchShift, setPitchShift] = useState(0);
  const [testText, setTestText] = useState('آواز کی دنیا میں خوش آمدید');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const selectedEmotionData = emotions.find(e => e.id === selectedEmotion);

  // Waveform animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 20;
    const bars: number[] = Array(barCount).fill(0).map(() => Math.random());
    const targetBars: number[] = Array(barCount).fill(0).map(() => Math.random());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const maxHeight = canvas.height;

      bars.forEach((height, i) => {
        // Smooth transition to target
        bars[i] += (targetBars[i] - bars[i]) * 0.1;

        // Generate new target randomly
        if (Math.abs(bars[i] - targetBars[i]) < 0.01) {
          targetBars[i] = Math.random();
        }

        const barHeight = bars[i] * maxHeight;
        const x = i * barWidth + barWidth * 0.2;
        const width = barWidth * 0.6;

        ctx.fillStyle = selectedEmotionData?.color || '#00d8ff';
        ctx.fillRect(x, maxHeight - barHeight, width, barHeight);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedEmotionData]);

  const handlePreview = async () => {
    if (!testText.trim()) return;
    setIsGenerating(true);
    setProgress(0);

    try {
      // Build emotion-adjusted SSML via OpenAI, then synthesize
      const emotionPrompts: Record<string, string> = {
        calm: 'in a slow, peaceful, gentle voice',
        happy: 'in a joyful, upbeat, enthusiastic voice',
        sad: 'in a slow, sorrowful, mournful voice',
        excited: 'in a fast, energetic, animated voice',
        dramatic: 'in a dramatic, theatrical, intense voice',
        inspirational: 'in an uplifting, motivational, powerful voice',
        spiritual: 'in a reverent, serene, meditative voice',
        corporate: 'in a clear, professional, confident voice',
      };

      const emotionHint = emotionPrompts[selectedEmotion] || 'in a neutral voice';
      // Use a stable voice ID for emotion preview — replace with voice selector if available
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: testText,
          voiceId: 'EXAVITQu4vr4xnSDxMaL', // Rachel — replace with user's selected voice
          stability: selectedEmotion === 'calm' ? 0.8 : selectedEmotion === 'excited' ? 0.2 : 0.5,
          similarityBoost: 0.75,
          style: selectedEmotion === 'dramatic' ? 0.9 : selectedEmotion === 'corporate' ? 0.1 : 0.5,
        }),
      });

      setProgress(80);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Preview failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
      setProgress(100);
      setTimeout(() => { setProgress(0); }, 1000);
    } catch (err: any) {
      console.error('Emotion preview error:', err);
      alert(`Preview failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getNodePosition = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  return (
    <div className="min-h-screen bg-ev-bg text-ev-on-surface relative overflow-hidden">
      {/* Particle background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-ev-primary/20 rounded-full"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 p-8 h-screen">
        {/* Left - Emotion Matrix */}
        <div className="flex items-center justify-center">
          <div className="relative w-full max-w-[600px] aspect-square">
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {emotions.map((emotion) => {
                if (!emotion.angle || !emotion.radius) return null;
                const pos = getNodePosition(emotion.angle, emotion.radius);
                return (
                  <line
                    key={emotion.id}
                    x1="50%"
                    y1="50%"
                    x2={`calc(50% + ${pos.x}px)`}
                    y2={`calc(50% + ${pos.y}px)`}
                    stroke={selectedEmotion === emotion.id ? emotion.color : '#3c494d'}
                    strokeWidth={selectedEmotion === emotion.id ? '2' : '1'}
                    opacity={selectedEmotion === emotion.id ? '0.6' : '0.2'}
                    filter={selectedEmotion === emotion.id ? 'url(#glow)' : undefined}
                  />
                );
              })}
            </svg>

            {/* Center Heart */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-ev-primary-container/30 blur-xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <div className="relative w-20 h-20 bg-ev-surface-high rounded-full flex items-center justify-center border-2 border-ev-primary-container">
                  <Heart className="w-10 h-10 text-ev-primary-container fill-current" />
                </div>
              </div>
            </motion.div>

            {/* Emotion Nodes */}
            {emotions.map((emotion) => {
              if (!emotion.angle || !emotion.radius) return null;
              const nodePos = getNodePosition(emotion.angle, emotion.radius);
              const isSelected = selectedEmotion === emotion.id;

              return (
                <motion.div
                  key={emotion.id}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{
                    x: nodePos.x,
                    y: nodePos.y,
                  }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSelectedEmotion(emotion.id)}
                >
                  <div className="relative flex flex-col items-center gap-2">
                    {/* Glow effect */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className="absolute inset-0 rounded-full blur-xl -z-10"
                          style={{ backgroundColor: emotion.color }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [1.2, 1.5, 1.2],
                            opacity: [0.4, 0.6, 0.4],
                          }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                    </AnimatePresence>

                    {/* Node circle */}
                    <motion.div
                      className={cn(
                        'w-20 h-20 rounded-full flex items-center justify-center text-4xl bg-ev-surface-high border-2 transition-all',
                        isSelected ? 'border-current' : 'border-ev-outline'
                      )}
                      style={{
                        borderColor: isSelected ? emotion.color : undefined,
                        boxShadow: isSelected ? `0 0 20px ${emotion.color}40` : undefined,
                      }}
                      animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {emotion.emoji}
                    </motion.div>

                    {/* Label */}
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isSelected ? 'text-current' : 'text-ev-on-surface-variant'
                      )}
                      style={{ color: isSelected ? emotion.color : undefined }}
                    >
                      {emotion.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="bg-ev-surface rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold text-ev-primary mb-2">Emotion Engine</h1>
            <p className="text-ev-on-surface-variant text-sm">
              Select an emotion and adjust parameters to shape your voice output
            </p>
          </div>

          {/* Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-ev-on-surface">Intensity</label>
                <span className="text-sm text-ev-primary font-mono">{intensity}%</span>
              </div>
              <Slider
                value={intensity}
                onChange={(val) => setIntensity(val)}
                min={0}
                max={100}
                step={1}
                showValue={false}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-ev-on-surface">Pacing</label>
                <span className="text-sm text-ev-primary font-mono">{Number(pacing).toFixed(1)}x</span>
              </div>
              <Slider
                value={pacing}
                onChange={(val) => setPacing(val)}
                min={0.5}
                max={2.0}
                step={0.1}
                showValue={false}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-ev-on-surface">Pitch Shift</label>
                <span className="text-sm text-ev-primary font-mono">
                  {pitchShift > 0 ? '+' : ''}
                  {pitchShift}
                </span>
              </div>
              <Slider
                value={pitchShift}
                onChange={(val) => setPitchShift(val)}
                min={-10}
                max={10}
                step={1}
                showValue={false}
              />
            </div>
          </div>

          {/* Resonance Output */}
          <div>
            <label className="text-sm font-medium text-ev-on-surface mb-3 block">
              Resonance Output
            </label>
            <div className="bg-ev-surface-container rounded-lg p-4 h-24">
              <canvas ref={canvasRef} width={400} height={80} className="w-full h-full" />
            </div>
          </div>

          {/* Test Phrase */}
          <div>
            <label className="text-sm font-medium text-ev-on-surface mb-3 block">Test Phrase</label>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full bg-ev-surface-container border border-ev-outline rounded-lg p-3 text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:border-ev-primary-container focus:ring-1 focus:ring-ev-primary-container min-h-[100px] resize-none"
              placeholder="Type or paste text to hear emotion applied"
            />
            <div className="text-right text-xs text-ev-on-surface-variant mt-1">
              {testText.length} characters
            </div>
          </div>

          {/* Live Preview */}
          <div>
            <Button
              onClick={handlePreview}
              disabled={isGenerating || !testText.trim()}
              className="w-full bg-ev-primary-container text-ev-bg hover:bg-ev-primary-container/90 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Preview'}
            </Button>

            {isGenerating && (
              <motion.div
                className="mt-3 bg-ev-surface-container rounded-lg p-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="h-2 bg-ev-surface-high rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-ev-primary-container"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-ev-on-surface-variant font-mono">
                    {progress}%
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
