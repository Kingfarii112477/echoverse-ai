'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface WaveformPlayerProps {
  audioUrl?: string;
  className?: string;
}

export function WaveformPlayer({ audioUrl, className }: WaveformPlayerProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wavesurferRef = useRef<any>(null);

  useEffect(() => {
    if (!audioUrl || !waveformRef.current) return;

    const initWavesurfer = async () => {
      try {
        const WaveSurfer = (await import('wavesurfer.js')).default;

        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
        }

        wavesurferRef.current = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: 'rgba(174, 236, 255, 0.3)',
          progressColor: 'rgba(174, 236, 255, 1)',
          cursorColor: 'rgba(174, 236, 255, 0.5)',
          barWidth: 2,
          barRadius: 3,
          cursorWidth: 2,
          height: 80,
          barGap: 2,
          normalize: true,
          responsive: true,
        });

        wavesurferRef.current.load(audioUrl);

        wavesurferRef.current.on('ready', () => {
          setDuration(wavesurferRef.current.getDuration());
        });

        wavesurferRef.current.on('audioprocess', () => {
          setCurrentTime(wavesurferRef.current.getCurrentTime());
        });

        wavesurferRef.current.on('finish', () => {
          setIsPlaying(false);
        });
      } catch (error) {
        console.error('Failed to initialize WaveSurfer:', error);
      }
    };

    initWavesurfer();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(nextSpeed);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'audio.mp3';
      link.click();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div
        className={cn(
          'bg-ev-surface-container border border-ev-outline/30 rounded-xl p-6',
          className
        )}
      >
        <div className="flex items-center justify-center h-20 gap-1">
          {[...Array(40)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-ev-primary-container/30 rounded-full"
              animate={{
                height: [20, Math.random() * 60 + 20, 20],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
        <div className="text-center mt-4 text-sm text-ev-on-surface-variant font-body">
          No audio loaded
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-ev-surface-container border border-ev-outline/30 rounded-xl p-6',
        className
      )}
    >
      <div ref={waveformRef} className="w-full mb-4" />

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-ev-on-surface-variant font-body">
          {formatTime(currentTime)}
        </span>
        <span className="text-sm text-ev-on-surface-variant font-body">
          {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          size="md"
          variant="primary"
          icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          onClick={togglePlayPause}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>

        <Button size="md" variant="outline" onClick={changeSpeed}>
          {speed}x
        </Button>

        <Button
          size="md"
          variant="ghost"
          icon={<Download className="h-4 w-4" />}
          onClick={handleDownload}
        >
          Download
        </Button>
      </div>
    </div>
  );
}
