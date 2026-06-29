'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Code, List, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface TextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  showToolbar?: boolean;
  className?: string;
}

const SSML_TEMPLATES = [
  { label: 'Pause', value: '<break time="1s"/>' },
  { label: 'Emphasis', value: '<emphasis level="strong"></emphasis>' },
  { label: 'Speed', value: '<prosody rate="medium"></prosody>' },
  { label: 'Pitch', value: '<prosody pitch="medium"></prosody>' },
  { label: 'Volume', value: '<prosody volume="medium"></prosody>' },
];

export function TextEditor({
  value = '',
  onChange,
  placeholder = 'Enter your text here...',
  maxLength = 5000,
  showToolbar = true,
  className,
}: TextEditorProps) {
  const [text, setText] = useState(value);
  const [showSSMLMenu, setShowSSMLMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setText(newValue);
      onChange?.(newValue);
    }
  };

  const insertAtCursor = (insertText: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.substring(0, start) + insertText + text.substring(end);

    setText(newText);
    onChange?.(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertText.length, start + insertText.length);
    }, 0);
  };

  const wrapSelection = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      const newText =
        text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
      setText(newText);
      onChange?.(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selectedText.length
        );
      }, 0);
    }
  };

  const insertSSML = (template: string) => {
    insertAtCursor(template);
    setShowSSMLMenu(false);
  };

  const charCount = text.length;
  const charPercentage = (charCount / maxLength) * 100;

  return (
    <div className={cn('w-full', className)}>
      {showToolbar && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-ev-surface-container rounded-lg border border-ev-outline/30">
          <Button
            size="sm"
            variant="ghost"
            icon={<Bold className="h-4 w-4" />}
            onClick={() => wrapSelection('**', '**')}
            title="Bold"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Italic className="h-4 w-4" />}
            onClick={() => wrapSelection('*', '*')}
            title="Italic"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<Code className="h-4 w-4" />}
            onClick={() => wrapSelection('`', '`')}
            title="Code"
          />
          <Button
            size="sm"
            variant="ghost"
            icon={<List className="h-4 w-4" />}
            onClick={() => insertAtCursor('\n- ')}
            title="List"
          />

          <div className="h-4 w-px bg-ev-outline/30 mx-1" />

          <div className="relative">
            <Button
              size="sm"
              variant="secondary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowSSMLMenu(!showSSMLMenu)}
            >
              SSML
            </Button>
            {showSSMLMenu && (
              <div className="absolute top-full left-0 mt-1 bg-ev-surface-container border border-ev-outline/30 rounded-lg shadow-lg z-10 min-w-[200px]">
                {SSML_TEMPLATES.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={() => insertSSML(template.value)}
                    className="w-full text-left px-4 py-2 text-sm font-body text-ev-on-surface hover:bg-ev-surface-high transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'w-full min-h-[200px] p-4 rounded-lg bg-ev-surface-container border border-ev-outline/50',
          'text-ev-on-surface font-body text-base leading-relaxed',
          'placeholder:text-ev-on-surface-variant/50',
          'focus:outline-none focus:ring-2 focus:ring-ev-primary/50 focus:border-ev-primary',
          'resize-y transition-all duration-200'
        )}
      />

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div className="text-xs text-ev-on-surface-variant font-body">
            {charCount} / {maxLength} characters
          </div>
          <div className="w-24 h-1.5 bg-ev-surface-high rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-300',
                charPercentage > 90
                  ? 'bg-ev-error'
                  : charPercentage > 75
                  ? 'bg-yellow-500'
                  : 'bg-ev-primary-container'
              )}
              style={{ width: `${charPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
