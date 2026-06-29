'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { brandKitService } from '@/lib/supabase';
import { useVoiceStore } from '@/stores/voiceStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

type Kit = {
  id: string;
  name: string;
  tone: string;
  toneColor: string;
  voiceCount: number;
  lastUsed: string;
  description?: string;
  preferredVoices: string[];
  pronunciationRules: Array<{ word: string; phonetic: string; language: string }>;
  templates: string[];
  shareWithTeam: boolean;
};

type PronunciationRule = {
  word: string;
  phonetic: string;
  language: string;
};

const demoKits: Kit[] = [
  {
    id: '1',
    name: 'Corporate Pakistan',
    tone: 'Professional',
    toneColor: '#0891b2',
    voiceCount: 3,
    lastUsed: 'Today',
    description: 'Professional voice kit for corporate communications',
    preferredVoices: ['voice-1', 'voice-2', 'voice-3'],
    pronunciationRules: [
      { word: 'Pakistan', phonetic: 'pa-ki-stan', language: 'Urdu' },
      { word: 'EchoVerse', phonetic: 'echo-verse', language: 'English' },
    ],
    templates: ['template-1', 'template-2'],
    shareWithTeam: true,
  },
  {
    id: '2',
    name: 'Islamic Content',
    tone: 'Spiritual',
    toneColor: '#d97706',
    voiceCount: 2,
    lastUsed: 'Yesterday',
    description: 'Reverent and spiritual tone for Islamic content',
    preferredVoices: ['voice-4', 'voice-5'],
    pronunciationRules: [
      { word: 'Allah', phonetic: 'al-laah', language: 'Arabic' },
      { word: 'Quran', phonetic: 'qur-aan', language: 'Arabic' },
    ],
    templates: ['template-3'],
    shareWithTeam: false,
  },
  {
    id: '3',
    name: 'Kids Stories',
    tone: 'Fun & Energetic',
    toneColor: '#fb923c',
    voiceCount: 2,
    lastUsed: '3 days ago',
    description: 'Playful and engaging voices for children',
    preferredVoices: ['voice-6', 'voice-7'],
    pronunciationRules: [
      { word: 'Superhero', phonetic: 'soo-per-hero', language: 'English' },
    ],
    templates: ['template-4'],
    shareWithTeam: true,
  },
];

const demoVoices = [
  { id: 'voice-1', name: 'Ali Hassan', language: 'Urdu', accent: 'Pakistani' },
  { id: 'voice-2', name: 'Fatima Khan', language: 'Urdu', accent: 'Pakistani' },
  { id: 'voice-3', name: 'Ahmed Malik', language: 'Urdu', accent: 'Pakistani' },
  { id: 'voice-4', name: 'Imam Rashid', language: 'Arabic', accent: 'Classical' },
  { id: 'voice-5', name: 'Sheikh Omar', language: 'Arabic', accent: 'Gulf' },
  { id: 'voice-6', name: 'Zara Playful', language: 'English', accent: 'American' },
  { id: 'voice-7', name: 'Bilal Fun', language: 'Urdu', accent: 'Pakistani' },
  { id: 'voice-8', name: 'Sarah Bright', language: 'English', accent: 'British' },
];

const demoTemplates = [
  { id: 'template-1', name: 'Corporate Announcement' },
  { id: 'template-2', name: 'Product Description' },
  { id: 'template-3', name: 'Islamic Lecture' },
  { id: 'template-4', name: 'Bedtime Story' },
];

export default function VoiceBrandKitsPage() {
  const { user } = useAuthStore();
  const [kits, setKits] = useState<Kit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadKits = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await brandKitService.getBrandKits(user.id);
      if (data.length > 0) {
        setKits(data.map(k => ({
          id: k.id,
          name: k.name,
          tone: k.brand_tone || 'Professional',
          toneColor: '#00d8ff',
          voiceCount: (k.preferred_voices || []).length,
          lastUsed: new Date(k.updated_at).toLocaleDateString(),
          description: k.description || '',
          preferredVoices: k.preferred_voices || [],
          pronunciationRules: k.pronunciation_rules || [],
          templates: [],
          shareWithTeam: false,
        })));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [user]);

  useEffect(() => { loadKits(); }, [loadKits]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<Kit | null>(null);
  const [selectedKitDetail, setSelectedKitDetail] = useState<Kit | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formTone, setFormTone] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formVoices, setFormVoices] = useState<string[]>([]);
  const [formRules, setFormRules] = useState<PronunciationRule[]>([]);
  const [formTemplates, setFormTemplates] = useState<string[]>([]);
  const [formShareWithTeam, setFormShareWithTeam] = useState(false);

  const openCreateModal = () => {
    setEditingKit(null);
    setFormName('');
    setFormTone('');
    setFormDescription('');
    setFormVoices([]);
    setFormRules([]);
    setFormTemplates([]);
    setFormShareWithTeam(false);
    setIsModalOpen(true);
  };

  const openEditModal = (kit: Kit) => {
    setEditingKit(kit);
    setFormName(kit.name);
    setFormTone(kit.tone);
    setFormDescription(kit.description || '');
    setFormVoices(kit.preferredVoices);
    setFormRules(kit.pronunciationRules);
    setFormTemplates(kit.templates);
    setFormShareWithTeam(kit.shareWithTeam);
    setIsModalOpen(true);
    setSelectedKitDetail(null);
  };

  const handleSave = async () => {
    if (!user || !formName.trim()) return;
    const toneColors: Record<string, string> = {
      Professional: '#0891b2', Spiritual: '#d97706',
      'Fun & Energetic': '#fb923c', Casual: '#14b8a6', Formal: '#6366f1',
    };

    try {
      const payload = {
        user_id: user.id,
        name: formName,
        brand_tone: formTone,
        description: formDescription,
        preferred_voices: formVoices,
        pronunciation_rules: formRules,
      };

      if (editingKit) {
        const updated = await brandKitService.updateBrandKit(editingKit.id, payload);
        setKits(prev => prev.map(k => k.id === editingKit.id
          ? { ...k, name: updated.name, tone: updated.brand_tone, description: updated.description, preferredVoices: updated.preferred_voices, voiceCount: updated.preferred_voices.length }
          : k
        ));
      } else {
        const created = await brandKitService.createBrandKit(payload);
        setKits(prev => [{
          id: created.id, name: created.name, tone: created.brand_tone || 'Professional',
          toneColor: toneColors[created.brand_tone] || '#00d8ff',
          voiceCount: (created.preferred_voices || []).length,
          lastUsed: 'Just now', description: created.description || '',
          preferredVoices: created.preferred_voices || [],
          pronunciationRules: created.pronunciation_rules || [],
          templates: [], shareWithTeam: false,
        }, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) { alert(`Save failed: ${err.message}`); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this kit?')) return;
    try {
      await brandKitService.deleteBrandKit(id);
      setKits(prev => prev.filter(k => k.id !== id));
      if (selectedKitDetail?.id === id) setSelectedKitDetail(null);
    } catch (err: any) { alert(`Delete failed: ${err.message}`); }
  };

  const toggleVoice = (voiceId: string) => {
    if (formVoices.includes(voiceId)) {
      setFormVoices(formVoices.filter((v) => v !== voiceId));
    } else {
      setFormVoices([...formVoices, voiceId]);
    }
  };

  const toggleTemplate = (templateId: string) => {
    if (formTemplates.includes(templateId)) {
      setFormTemplates(formTemplates.filter((t) => t !== templateId));
    } else {
      setFormTemplates([...formTemplates, templateId]);
    }
  };

  const addRule = () => {
    setFormRules([...formRules, { word: '', phonetic: '', language: 'Urdu' }]);
  };

  const updateRule = (index: number, field: keyof PronunciationRule, value: string) => {
    const newRules = [...formRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormRules(newRules);
  };

  const removeRule = (index: number) => {
    setFormRules(formRules.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-ev-bg text-ev-on-surface p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-primary">Voice Brand Kits</h1>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-ev-primary-container text-ev-bg hover:bg-ev-primary-container/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Kit
        </Button>
      </div>

      {/* Kit Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <motion.div
            key={kit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            layout
          >
            <Card
              className="bg-ev-surface border-ev-outline hover:border-ev-primary-container transition-colors cursor-pointer"
              onClick={() => setSelectedKitDetail(kit)}
            >
              <CardHeader>
                <CardTitle className="text-xl text-ev-on-surface">{kit.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge
                  style={{ backgroundColor: kit.toneColor + '20', color: kit.toneColor }}
                  className="border-0"
                >
                  {kit.tone}
                </Badge>

                <div className="space-y-2 text-sm text-ev-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Preferred Voices:</span>
                    <span className="text-ev-on-surface font-medium">{kit.voiceCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Used:</span>
                    <span className="text-ev-on-surface font-medium">{kit.lastUsed}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(kit);
                    }}
                    className="flex-1 bg-ev-surface-high text-ev-primary hover:bg-ev-surface-container"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(kit.id);
                    }}
                    className="flex-1 bg-ev-surface-high text-ev-error hover:bg-ev-error/10"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="bg-ev-surface rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-ev-primary">
              {editingKit ? 'Edit Kit' : 'Create New Kit'}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-ev-on-surface-variant hover:text-ev-on-surface"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Brand Name
              </label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Enter brand kit name"
                className="bg-ev-surface-container border-ev-outline text-ev-on-surface"
              />
            </div>

            {/* Tone Description */}
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Tone Description
              </label>
              <Input
                value={formTone}
                onChange={(e) => setFormTone(e.target.value)}
                placeholder="e.g., Professional, Spiritual, Fun & Energetic"
                className="bg-ev-surface-container border-ev-outline text-ev-on-surface"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe the purpose of this brand kit"
                className="w-full bg-ev-surface-container border border-ev-outline rounded-lg p-3 text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:border-ev-primary-container focus:ring-1 focus:ring-ev-primary-container min-h-[80px] resize-none"
              />
            </div>

            {/* Preferred Voices */}
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-3">
                Preferred Voices
              </label>
              <div className="grid grid-cols-2 gap-3">
                {demoVoices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => toggleVoice(voice.id)}
                    className={cn(
                      'p-3 rounded-lg border-2 text-left transition-all',
                      formVoices.includes(voice.id)
                        ? 'border-ev-primary-container bg-ev-primary-container/10'
                        : 'border-ev-outline bg-ev-surface-container hover:border-ev-outline/60'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-ev-on-surface text-sm">
                          {voice.name}
                        </div>
                        <div className="text-xs text-ev-on-surface-variant">
                          {voice.language} • {voice.accent}
                        </div>
                      </div>
                      {formVoices.includes(voice.id) && (
                        <Check className="w-4 h-4 text-ev-primary-container" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Pronunciation Rules */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-ev-on-surface">
                  Pronunciation Rules
                </label>
                <Button
                  onClick={addRule}
                  className="bg-ev-surface-high text-ev-primary hover:bg-ev-surface-container text-sm h-8"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-2">
                {formRules.map((rule, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={rule.word}
                      onChange={(e) => updateRule(index, 'word', e.target.value)}
                      placeholder="Word"
                      className="flex-1 bg-ev-surface-container border-ev-outline text-ev-on-surface"
                    />
                    <Input
                      value={rule.phonetic}
                      onChange={(e) => updateRule(index, 'phonetic', e.target.value)}
                      placeholder="Phonetic"
                      className="flex-1 bg-ev-surface-container border-ev-outline text-ev-on-surface"
                    />
                    <Input
                      value={rule.language}
                      onChange={(e) => updateRule(index, 'language', e.target.value)}
                      placeholder="Language"
                      className="flex-1 bg-ev-surface-container border-ev-outline text-ev-on-surface"
                    />
                    <button
                      onClick={() => removeRule(index)}
                      className="px-3 bg-ev-surface-high text-ev-error hover:bg-ev-error/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand Templates */}
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-3">
                Linked Templates
              </label>
              <div className="space-y-2">
                {demoTemplates.map((template) => (
                  <label
                    key={template.id}
                    className="flex items-center gap-3 p-3 bg-ev-surface-container rounded-lg cursor-pointer hover:bg-ev-surface-high transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formTemplates.includes(template.id)}
                      onChange={() => toggleTemplate(template.id)}
                      className="w-4 h-4 rounded border-ev-outline text-ev-primary-container focus:ring-ev-primary-container"
                    />
                    <span className="text-ev-on-surface">{template.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Share with Team */}
            <div>
              <label className="flex items-center gap-3 p-3 bg-ev-surface-container rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formShareWithTeam}
                  onChange={(e) => setFormShareWithTeam(e.target.checked)}
                  className="w-4 h-4 rounded border-ev-outline text-ev-primary-container focus:ring-ev-primary-container"
                />
                <div>
                  <div className="text-ev-on-surface font-medium">Share with Team</div>
                  <div className="text-xs text-ev-on-surface-variant">
                    Allow team members to use this brand kit
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 bg-ev-surface-high text-ev-on-surface hover:bg-ev-surface-container"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || !formTone.trim()}
              className="flex-1 bg-ev-primary-container text-ev-bg hover:bg-ev-primary-container/90 disabled:opacity-50"
            >
              {editingKit ? 'Save Changes' : 'Create Kit'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Kit Detail Modal */}
      <Modal open={!!selectedKitDetail} onClose={() => setSelectedKitDetail(null)}>
        {selectedKitDetail && (
          <div className="bg-ev-surface rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-ev-primary">{selectedKitDetail.name}</h2>
              <button
                onClick={() => setSelectedKitDetail(null)}
                className="text-ev-on-surface-variant hover:text-ev-on-surface"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-sm text-ev-on-surface-variant mb-2">Tone</div>
                <Badge
                  style={{
                    backgroundColor: selectedKitDetail.toneColor + '20',
                    color: selectedKitDetail.toneColor,
                  }}
                  className="border-0"
                >
                  {selectedKitDetail.tone}
                </Badge>
              </div>

              {selectedKitDetail.description && (
                <div>
                  <div className="text-sm text-ev-on-surface-variant mb-2">Description</div>
                  <p className="text-ev-on-surface">{selectedKitDetail.description}</p>
                </div>
              )}

              <div>
                <div className="text-sm text-ev-on-surface-variant mb-2">Preferred Voices</div>
                <div className="grid grid-cols-2 gap-2">
                  {selectedKitDetail.preferredVoices.map((voiceId) => {
                    const voice = demoVoices.find((v) => v.id === voiceId);
                    return voice ? (
                      <div
                        key={voiceId}
                        className="p-2 bg-ev-surface-container rounded-lg text-sm"
                      >
                        <div className="font-medium text-ev-on-surface">{voice.name}</div>
                        <div className="text-xs text-ev-on-surface-variant">
                          {voice.language} • {voice.accent}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {selectedKitDetail.pronunciationRules.length > 0 && (
                <div>
                  <div className="text-sm text-ev-on-surface-variant mb-2">
                    Pronunciation Rules
                  </div>
                  <div className="space-y-2">
                    {selectedKitDetail.pronunciationRules.map((rule, index) => (
                      <div
                        key={index}
                        className="p-3 bg-ev-surface-container rounded-lg text-sm grid grid-cols-3 gap-2"
                      >
                        <div>
                          <div className="text-xs text-ev-on-surface-variant">Word</div>
                          <div className="text-ev-on-surface">{rule.word}</div>
                        </div>
                        <div>
                          <div className="text-xs text-ev-on-surface-variant">Phonetic</div>
                          <div className="text-ev-on-surface">{rule.phonetic}</div>
                        </div>
                        <div>
                          <div className="text-xs text-ev-on-surface-variant">Language</div>
                          <div className="text-ev-on-surface">{rule.language}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedKitDetail.templates.length > 0 && (
                <div>
                  <div className="text-sm text-ev-on-surface-variant mb-2">Linked Templates</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedKitDetail.templates.map((templateId) => {
                      const template = demoTemplates.find((t) => t.id === templateId);
                      return template ? (
                        <Badge
                          key={templateId}
                          className="bg-ev-surface-container text-ev-on-surface border-ev-outline"
                        >
                          {template.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-ev-on-surface-variant mb-2">Team Sharing</div>
                <div className="text-ev-on-surface">
                  {selectedKitDetail.shareWithTeam ? 'Shared with team' : 'Private'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => openEditModal(selectedKitDetail)}
                className="flex-1 bg-ev-primary-container text-ev-bg hover:bg-ev-primary-container/90"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Kit
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
