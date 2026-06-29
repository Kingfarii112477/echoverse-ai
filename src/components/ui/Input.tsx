'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-ev-on-surface mb-1.5 font-body">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ev-on-surface-variant">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'w-full rounded-lg bg-ev-surface-container border border-ev-outline/50 text-ev-on-surface px-4 py-2.5 font-body text-sm transition-all duration-200',
              'placeholder:text-ev-on-surface-variant/50',
              'focus:outline-none focus:ring-2 focus:ring-ev-primary/50 focus:border-ev-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-ev-error focus:ring-ev-error/50 focus:border-ev-error',
              icon && 'pl-10',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-ev-error font-body">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
