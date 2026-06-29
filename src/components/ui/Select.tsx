'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn('w-full', className)} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-ev-on-surface mb-1.5 font-body">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg bg-ev-surface-container border border-ev-outline/50 text-ev-on-surface px-4 py-2.5 font-body text-sm transition-all duration-200',
            'flex items-center justify-between',
            'focus:outline-none focus:ring-2 focus:ring-ev-primary/50 focus:border-ev-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-ev-error focus:ring-ev-error/50 focus:border-ev-error'
          )}
        >
          <span className={cn(!selectedOption && 'text-ev-on-surface-variant/50')}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-ev-on-surface-variant transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 rounded-lg bg-ev-surface-container border border-ev-outline/50 shadow-lg overflow-hidden">
            <div className="max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm font-body transition-colors',
                    'hover:bg-ev-surface-high',
                    option.value === value
                      ? 'bg-ev-surface-high text-ev-primary'
                      : 'text-ev-on-surface'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-ev-error font-body">{error}</p>}
    </div>
  );
}
