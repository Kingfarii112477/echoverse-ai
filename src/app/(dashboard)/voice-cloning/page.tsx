'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Upload, Check, Trash2, Play, Loader2, X, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/stores/authStore';
import { voiceCloneService } from '@/lib/supabase';
import type { VoiceClone } from '@/types';

type AudioFile = { name: string; size: string; file: File };

const steps = [
  { id: 1, label: 'Samples Uploaded' },
  { id: 2, label: 'Processing' },
  { id: 3, label: 'Ready' },
];

export default function VoiceCloningPage() {
  const { user } = useAuthStore();
  const [uploadedFiles, setUploadedFiles] = useState<AudioFile[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [clones, setClones] = useState<VoiceClone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClone, setSelectedClone] = useState<VoiceClone | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadClones = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await voiceCloneService.getVoiceClones(user.id);
      setClones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadClones(); }, [loadClones]);

  const handleFiles = (files: File[]) => {
    const audio = files.filter(f => f.type.startsWith('audio/'));
    if (audio.length === 0) { setError('Please upload audio files only (MP3, WAV, M4A).'); return; }
    setError('');
    const mapped: AudioFile[] = audio.map(f => ({
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      file: f,
    }));
    setUploadedFiles(prev => [...prev, ...mapped]);
    setCurrentStep(1);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleStartCloning = async () => {
    if (!cloneName.trim() || uploadedFiles.length < 1) return;
    setIsCloning(true); setCurrentStep(2); setError('');

    try {
      const formData = new FormData();
      formData.append('name', cloneName);
      formData.append('description', cloneDescription);
      uploadedFiles.forEach(f => formData.append('files', f.file));

      const res = await fetch('/api/clone-voice', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Cloning failed');
      }
      const result = await res.json();

      setCurrentStep(3);
      if (result.clone) setClones(prev => [result.clone, ...prev]);

      setTimeout(() => {
        setUploadedFiles([]); setCloneName(''); setCloneDescription(''); setCurrentStep(0);
      }, 2000);
    } catch (err: any) {
      setError(err.message); setCurrentStep(1);
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this voice clone? This cannot be undone.')) return;
    try {
      await voiceCloneService.deleteVoiceClone(id);
      setClones(prev => prev.filter(c => c.id !== id));
      if (selectedClone?.id === id) setSelectedClone(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getQualityColor = (q: number) => q >= 80 ? '#10b981' : q >= 60 ? '#f59e0b' : '#ef4444';
  const getStepStatus = (id: number) => id < currentStep ? 'completed' : id === currentStep ? 'current' : 'pending';

  return (
    <div className="min-h-screen bg-ev-bg text-ev-on-surface p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Copy className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-primary">Voice Cloning</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={loadClones}>
          <RefreshCw className="w-4 h-4 mr-2" />Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card className="bg-ev-surface border-ev-outline">
            <CardHeader>
              <CardTitle className="text-xl text-ev-on-surface">Upload Samples</CardTitle>
              <p className="text-sm text-ev-on-surface-variant">Minimum 1 sample, 30+ seconds each recommended</p>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
                  isDragging ? 'border-ev-primary bg-ev-primary/10' : 'border-ev-outline hover:border-ev-primary/50'
                )}
              >
                <Upload className="w-10 h-10 text-ev-on-surface-variant mx-auto mb-3" />
                <p className="font-medium text-ev-on-surface">Drop audio files here</p>
                <p className="text-sm text-ev-on-surface-variant mt-1">MP3, WAV, M4A, OGG — up to 25MB each</p>
                <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden"
                  onChange={e => handleFiles(Array.from(e.target.files || []))} />
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-ev-surface-container rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-ev-primary/20 flex items-center justify-center shrink-0">
                        <Play className="w-3.5 h-3.5 text-ev-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ev-on-surface truncate">{f.name}</p>
                        <p className="text-xs text-ev-on-surface-variant">{f.size}</p>
                      </div>
                      <button onClick={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}
                        className="text-ev-on-surface-variant hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-ev-surface border-ev-outline">
            <CardHeader><CardTitle>Voice Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-ev-on-surface-variant mb-1.5 block">Voice Name *</label>
                <Input value={cloneName} onChange={e => setCloneName(e.target.value)} placeholder="e.g. My Urdu Narrator" />
              </div>
              <div>
                <label className="text-sm font-medium text-ev-on-surface-variant mb-1.5 block">Description</label>
                <Input value={cloneDescription} onChange={e => setCloneDescription(e.target.value)}
                  placeholder="What is this voice for?" />
              </div>
              <Button
                className="w-full"
                disabled={!cloneName.trim() || uploadedFiles.length === 0 || isCloning}
                onClick={handleStartCloning}
              >
                {isCloning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cloning...</> : 'Start Cloning'}
              </Button>
            </CardContent>
          </Card>

          {/* Progress Steps */}
          {currentStep > 0 && (
            <div className="flex items-center gap-3">
              {steps.map((step, i) => {
                const status = getStepStatus(step.id);
                return (
                  <div key={step.id} className="flex items-center gap-2 flex-1">
                    <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                      status === 'completed' ? 'bg-green-500 text-white' :
                      status === 'current' ? 'bg-ev-primary text-ev-bg' : 'bg-ev-surface-container text-ev-on-surface-variant'
                    )}>
                      {status === 'completed' ? <Check className="w-3.5 h-3.5" /> : step.id}
                    </div>
                    <span className={cn('text-xs', status === 'current' ? 'text-ev-primary font-medium' : 'text-ev-on-surface-variant')}>
                      {step.label}
                    </span>
                    {i < steps.length - 1 && <div className="flex-1 h-px bg-ev-outline" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Clones List */}
        <div>
          <h2 className="text-xl font-semibold text-ev-on-surface mb-4">
            Your Clones {!isLoading && <span className="text-ev-on-surface-variant text-sm font-normal">({clones.length})</span>}
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-24 bg-ev-surface-container rounded-xl animate-pulse" />)}
            </div>
          ) : clones.length === 0 ? (
            <Card className="bg-ev-surface border-ev-outline border-dashed">
              <CardContent className="p-10 text-center">
                <Copy className="w-12 h-12 text-ev-on-surface-variant mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-ev-on-surface mb-1">No clones yet</p>
                <p className="text-sm text-ev-on-surface-variant">Upload audio samples to clone your first voice.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {clones.map(clone => (
                <motion.div key={clone.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="bg-ev-surface border-ev-outline hover:border-ev-primary/40 transition-all cursor-pointer"
                    onClick={() => setSelectedClone(clone)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `conic-gradient(${getQualityColor(clone.quality_score || 0)} ${(clone.quality_score || 0) * 3.6}deg, #1a2123 0deg)` }}>
                            <div className="w-7 h-7 rounded-full bg-ev-surface flex items-center justify-center">
                              <span className="text-xs font-bold">{clone.quality_score || '—'}</span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ev-on-surface truncate">{clone.name}</p>
                            <p className="text-xs text-ev-on-surface-variant mt-0.5 truncate">{clone.description || 'No description'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={clone.status === 'ready' ? 'success' : clone.status === 'processing' ? 'warning' : 'error'}>
                            {clone.status}
                          </Badge>
                          <button onClick={e => { e.stopPropagation(); handleDelete(clone.id); }}
                            className="text-ev-on-surface-variant hover:text-red-400 p-1 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
