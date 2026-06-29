'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, Heart, Zap, Drama, Sparkles, Church, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Emotion =
  | 'Happy'
  | 'Sad'
  | 'Calm'
  | 'Excited'
  | 'Dramatic'
  | 'Inspirational'
  | 'Spiritual'
  | 'Corporate';

interface EmotionConfig {
  label: Emotion;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  ringColor: string;
}

const emotions: EmotionConfig[] = [
  {
    label: 'Happy',
    icon: <Smile className="h-5 w-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    ringColor: 'ring-yellow-400',
  },
  {
    label: 'Sad',
    icon: <Frown className="h-5 w-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    ringColor: 'ring-blue-400',
  },
  {
    label: 'Calm',
    icon: <Heart className="h-5 w-5" />,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    ringColor: 'ring-green-400',
  },
  {
    label: 'Excited',
    icon: <Zap className="h-5 w-5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    ringColor: 'ring-orange-400',
  },
  {
    label: 'Dramatic',
    icon: <Drama className="h-5 w-5" />,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
    ringColor: 'ring-red-400',
  },
  {
    label: 'Inspirational',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    ringColor: 'ring-purple-400',
  },
  {
    label: 'Spiritual',
    icon: <Church className="h-5 w-5" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10',
    ringColor: 'ring-cyan-400',
  },
  {
    label: 'Corporate',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    ringColor: 'ring-gray-400',
  },
];

interface EmotionSelectorProps {
  value?: Emotion;
  onChange?: (emotion: Emotion) => void;
  className?: string;
}

export function EmotionSelector({ value, onChange, className }: EmotionSelectorProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | undefined>(value);

  const handleSelect = (emotion: Emotion) => {
    setSelectedEmotion(emotion);
    onChange?.(emotion);
  };

  return (
    <div className={cn('w-full', className)}>
      <label className="block text-sm font-medium text-ev-on-surface mb-3 font-body">
        Select Emotion
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotion === emotion.label;
          return (
            <motion.button
              key={emotion.label}
              type="button"
              onClick={() => handleSelect(emotion.label)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200',
                'bg-ev-surface-container border-ev-outline/30',
                'hover:border-ev-outline/60',
                isSelected && [
                  'ring-2',
                  emotion.ringColor,
                  'border-transparent',
                  `shadow-[0_0_20px_${emotion.color}]`,
                ]
              )}
            >
              <div
                className={cn(
                  'p-3 rounded-full transition-all duration-200',
                  emotion.bgColor,
                  emotion.color
                )}
              >
                {emotion.icon}
              </div>
              <span
                className={cn(
                  'text-sm font-medium font-body transition-colors',
                  isSelected ? emotion.color : 'text-ev-on-surface'
                )}
              >
                {emotion.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
