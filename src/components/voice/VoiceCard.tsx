'use client';

import React from 'react';
import { Play, User, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface Voice {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  provider: 'ElevenLabs' | 'OpenAI' | 'PlayHT';
  isPremium?: boolean;
  previewUrl?: string;
}

interface VoiceCardProps {
  voice: Voice;
  isSelected?: boolean;
  onSelect?: () => void;
  onPreview?: () => void;
  className?: string;
}

export function VoiceCard({
  voice,
  isSelected = false,
  onSelect,
  onPreview,
  className,
}: VoiceCardProps) {
  const getGenderIcon = () => {
    if (voice.gender === 'male') return '♂';
    if (voice.gender === 'female') return '♀';
    return '⚲';
  };

  const getProviderColor = () => {
    switch (voice.provider) {
      case 'ElevenLabs':
        return 'text-purple-400';
      case 'OpenAI':
        return 'text-green-400';
      case 'PlayHT':
        return 'text-blue-400';
      default:
        return 'text-ev-on-surface-variant';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative bg-ev-surface-container border border-ev-outline/30 rounded-xl p-4 transition-all duration-200',
        isSelected &&
          'ring-2 ring-ev-primary-container border-ev-primary shadow-[0_0_30px_rgba(174,236,255,0.2)]',
        className
      )}
    >
      {voice.isPremium && (
        <div className="absolute top-3 right-3">
          <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center text-xl font-display font-semibold',
              isSelected
                ? 'bg-ev-primary-container text-ev-bg'
                : 'bg-ev-surface-high text-ev-on-surface'
            )}
          >
            {voice.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-ev-on-surface truncate">
              {voice.name}
            </h3>
            <span className="text-ev-on-surface-variant text-sm">{getGenderIcon()}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge size="sm" variant="default">
              {voice.language}
            </Badge>
            <Badge size="sm" variant="info" className={getProviderColor()}>
              {voice.provider}
            </Badge>
            {voice.isPremium && (
              <Badge size="sm" variant="premium">
                Premium
              </Badge>
            )}
          </div>

          <div className="flex gap-2">
            {voice.previewUrl && (
              <Button
                size="sm"
                variant="outline"
                icon={<Play className="h-3.5 w-3.5" />}
                onClick={onPreview}
              >
                Preview
              </Button>
            )}
            <Button
              size="sm"
              variant={isSelected ? 'primary' : 'secondary'}
              onClick={onSelect}
              className="flex-1"
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
