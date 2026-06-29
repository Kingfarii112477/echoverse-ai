'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  label?: string;
  showValue?: boolean;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  min = 0,
  max = 100,
  step = 1,
  value: controlledValue,
  defaultValue = min,
  onChange,
  label,
  showValue = true,
  className,
  disabled = false,
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(controlledValue ?? defaultValue);
  const value = controlledValue ?? internalValue;
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const percentage = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = min + percent * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));

    setInternalValue(clampedValue);
    onChange?.(clampedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e.clientX);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-ev-on-surface font-body">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-ev-on-surface-variant font-body">
              {Number(value).toFixed(step < 1 ? 1 : 0)}
            </span>
          )}
        </div>
      )}
      <div
        ref={sliderRef}
        onMouseDown={handleMouseDown}
        className={cn(
          'relative h-2 w-full rounded-full bg-ev-surface-high cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div
          className="absolute h-full rounded-full bg-ev-primary-container transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-ev-primary border-2 border-ev-primary-container shadow-lg transition-transform duration-100 hover:scale-110"
          style={{ left: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
