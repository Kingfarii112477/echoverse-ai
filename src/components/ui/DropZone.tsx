'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
  maxFiles?: number;
  multiple?: boolean;
  className?: string;
}

export function DropZone({
  onFilesSelected,
  acceptedFormats = [],
  maxFiles = 1,
  multiple = false,
  className,
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      setSelectedFiles(files);
      onFilesSelected(files);
    },
    [maxFiles, onFilesSelected]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files).slice(0, maxFiles) : [];
      setSelectedFiles(files);
      onFilesSelected(files);
    },
    [maxFiles, onFilesSelected]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFilesSelected(newFiles);
    },
    [selectedFiles, onFilesSelected]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer',
          isDragOver
            ? 'border-ev-primary bg-ev-primary/5'
            : 'border-ev-outline hover:border-ev-outline/70'
        )}
      >
        <input
          type="file"
          multiple={multiple}
          accept={acceptedFormats.join(',')}
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center text-center">
          <Upload
            className={cn(
              'h-12 w-12 mb-4 transition-colors',
              isDragOver ? 'text-ev-primary' : 'text-ev-on-surface-variant'
            )}
          />
          <p className="text-ev-on-surface font-medium font-body mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-ev-on-surface-variant font-body">
            {acceptedFormats.length > 0
              ? `Accepted formats: ${acceptedFormats.join(', ')}`
              : 'Any file format'}
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-ev-on-surface-variant font-body mt-1">
              Maximum {maxFiles} files
            </p>
          )}
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-ev-surface-container rounded-lg border border-ev-outline/30"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-ev-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ev-on-surface font-body truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-ev-on-surface-variant font-body">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-ev-on-surface-variant hover:text-ev-error transition-colors p-1 rounded hover:bg-ev-surface-high"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
