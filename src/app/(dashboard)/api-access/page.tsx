'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key, Copy, Trash2, XCircle, CheckCircle, Code,
  ChevronDown, ChevronUp, Globe, Plus, Loader2, AlertCircle, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  full_key?: string; // only shown once on creation
  scopes: string[];
  last_used_at: string | null;
  is_active: boolean;
  created_at: string;
}

export default function APIAccessPage() {
  const { user } = useAuthStore();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedKey, setGeneratedKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [expandedCode, setExpandedCode] = useState<string | null>('javascript');
  const [usageData] = useState([
    { name: 'Mon', calls: 0 }, { name: 'Tue', calls: 0 }, { name: 'Wed', calls: 0 },
    { name: 'Thu', calls: 0 }, { name: 'Fri', calls: 0 }, { name: 'Sat', calls: 0 },
    { name: 'Sun', calls: 0 },
  ]);

  const [rateLimits] = useState({
    perMinute: { current: 45, max: 100 },
    perDay: { current: 1250, max: 10000 },
  });
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState([
    { id: 'generation.complete', label: 'generation.complete', checked: true },
    { id: 'generation.failed', label: 'generation.failed', checked: true },
    { id: 'clone.complete', label: 'clone.complete', checked: false },
    { id: 'subscription.updated', label: 'subscription.updated', checked: false },
  ]);
  const [permissions, setPermissions] = useState([
    { id: 'generate', label: 'Generate Speech', checked: true },
    { id: 'clone', label: 'Clone Voice', checked: false },
    { id: 'read', label: 'Read Projects', checked: true },
    { id: 'write', label: 'Write Projects', checked: false },
  ]);
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [apiEndpoints] = useState([
    { id: 'generate', method: 'POST', path: '/v1/generate', description: 'Generate speech', params: ['text: string', 'voice: string', 'stability?: number'], response: '{ audio_url: string, duration: number }' },
    { id: 'voices', method: 'GET', path: '/v1/voices', description: 'List available voices', params: ['language?: string', 'gender?: string'], response: '{ voices: Voice[] }' },
    { id: 'clone', method: 'POST', path: '/v1/clone', description: 'Clone a voice', params: ['audio_file: File', 'name: string'], response: '{ voice_id: string }' },
    { id: 'delete', method: 'DELETE', path: '/v1/voices/:id', description: 'Delete a voice clone', params: ['id: string'], response: '{ success: boolean }' },
  ]);

  const loadKeys = useCallback(async () => {
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/keys');
      if (!res.ok) throw new Error('Failed to load keys');
      setApiKeys(await res.json());
    } catch (err: any) { setError(err.message); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { if (user) loadKeys(); }, [user, loadKeys]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id); setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true); setError('');
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create key');
      setGeneratedKey(data.full_key);
      setApiKeys(prev => [data, ...prev]);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setNewKeyName('');
    } catch (err: any) { setError(err.message); }
    finally { setIsCreating(false); }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Revoke this API key? Any apps using it will stop working.')) return;
    try {
      const res = await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Failed to revoke key');
      setApiKeys(prev => prev.filter(k => k.id !== id));
    } catch (err: any) { setError(err.message); }
  };

  const timeAgo = (date: string | null) => {
    if (!date) return 'Never';
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    return Math.floor(h / 24) + 'd ago';
  };

  const codeExamples = {
    javascript: `// Install: npm install @echoverse/sdk

import EchoVerse from '@echoverse/sdk';

const client = new EchoVerse({
  apiKey: 'ev_prod_your_key_here'
});

const audio = await client.generate({
  text: 'Hello, world!',
  voice: 'nova-en-us'
});`,
    python: `# Install: pip install echoverse

from echoverse import Client

client = Client(
    api_key='ev_prod_your_key_here'
)

audio = client.generate(
    text='Hello, world!',
    voice='nova-en-us'
)`,
    curl: `curl -X POST https://api.echoverse.ai/v1/generate \\
  -H "Authorization: Bearer ev_prod_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Hello, world!",
    "voice": "nova-en-us"
  }'`,
  };


  const getRateLimitColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 90) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRateLimitPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  return (
    <div className="min-h-screen bg-ev-bg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="w-8 h-8 text-ev-primary" />
          <h1 className="text-3xl font-bold text-ev-on-surface">API Access</h1>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-ev-primary-container text-ev-bg hover:bg-ev-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Key
        </Button>
      </div>

      {/* API Keys Table */}
      <Card className="bg-ev-surface border-ev-outline">
        <CardHeader>
          <CardTitle className="text-ev-on-surface">API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ev-outline">
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    API Key
                  </th>
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    Last Used
                  </th>
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-ev-on-surface-variant font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <motion.tr
                    key={key.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-ev-outline/50 hover:bg-ev-surface-container transition-colors"
                  >
                    <td className="py-3 px-4 text-ev-on-surface">{key.name}</td>
                    <td className="py-3 px-4">
                      <code className="text-ev-primary text-sm font-mono">{key.key_prefix}***</code>
                    </td>
                    <td className="py-3 px-4 text-ev-on-surface-variant">{timeAgo(key.created_at)}</td>
                    <td className="py-3 px-4 text-ev-on-surface-variant">{timeAgo(key.last_used_at)}</td>
                    <td className="py-3 px-4">
                      <Badge
                        className={cn(
                          'text-xs',
                          key.is_active === true
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        )}
                      >
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(key.key_prefix, key.id)}
                          className="p-1.5 hover:bg-ev-surface-high rounded transition-colors"
                          title="Copy"
                        >
                          {copiedId === key.id ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-ev-on-surface-variant" />
                          )}
                        </button>
                        <button
                          className="p-1.5 hover:bg-ev-surface-high rounded transition-colors"
                          title="Revoke"
                        >
                          <XCircle className="w-4 h-4 text-yellow-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="p-1.5 hover:bg-ev-surface-high rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-ev-error" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Usage Graph */}
      <Card className="bg-ev-surface border-ev-outline">
        <CardHeader>
          <CardTitle className="text-ev-on-surface">API Usage - Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3c494d" />
              <XAxis dataKey="day" stroke="#859398" />
              <YAxis stroke="#859398" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2123',
                  border: '1px solid #3c494d',
                  borderRadius: '8px',
                  color: '#dde4e6',
                }}
                cursor={{ fill: 'rgba(174, 236, 255, 0.1)' }}
              />
              <Bar dataKey="calls" fill="#00d8ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-ev-surface border-ev-outline">
          <CardHeader>
            <CardTitle className="text-ev-on-surface">Requests per Minute</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-ev-on-surface">
                  {rateLimits.perMinute.current.toLocaleString()}
                </span>
                <span className="text-ev-on-surface-variant">
                  / {rateLimits.perMinute.max.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-ev-surface-container rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${getRateLimitPercentage(
                      rateLimits.perMinute.current,
                      rateLimits.perMinute.max
                    )}%`,
                  }}
                  className={cn(
                    'h-full rounded-full',
                    getRateLimitColor(
                      getRateLimitPercentage(
                        rateLimits.perMinute.current,
                        rateLimits.perMinute.max
                      )
                    )
                  )}
                />
              </div>
              <p className="text-sm text-ev-on-surface-variant">
                {getRateLimitPercentage(
                  rateLimits.perMinute.current,
                  rateLimits.perMinute.max
                ).toFixed(1)}
                % used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-ev-surface border-ev-outline">
          <CardHeader>
            <CardTitle className="text-ev-on-surface">Requests per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-ev-on-surface">
                  {rateLimits.perDay.current.toLocaleString()}
                </span>
                <span className="text-ev-on-surface-variant">
                  / {rateLimits.perDay.max.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-ev-surface-container rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${getRateLimitPercentage(
                      rateLimits.perDay.current,
                      rateLimits.perDay.max
                    )}%`,
                  }}
                  className={cn(
                    'h-full rounded-full',
                    getRateLimitColor(
                      getRateLimitPercentage(rateLimits.perDay.current, rateLimits.perDay.max)
                    )
                  )}
                />
              </div>
              <p className="text-sm text-ev-on-surface-variant">
                {getRateLimitPercentage(rateLimits.perDay.current, rateLimits.perDay.max).toFixed(
                  1
                )}
                % used
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Webhook Configuration */}
      <Card className="bg-ev-surface border-ev-outline">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-ev-primary" />
            <CardTitle className="text-ev-on-surface">Webhooks</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-2">
                Webhook URL
              </label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-domain.com/webhook"
                className="bg-ev-surface-container border-ev-outline text-ev-on-surface"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ev-on-surface mb-3">Events</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {webhookEvents.map((event) => (
                  <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={event.checked}
                      onChange={(e) =>
                        setWebhookEvents(
                          webhookEvents.map((ev) =>
                            ev.id === event.id ? { ...ev, checked: e.target.checked } : ev
                          )
                        )
                      }
                      className="w-4 h-4 rounded border-ev-outline bg-ev-surface-container text-ev-primary-container focus:ring-ev-primary"
                    />
                    <span className="text-ev-on-surface font-mono text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <Button className="bg-ev-primary-container text-ev-bg hover:bg-ev-primary">
              Save Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* SDK Examples */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-ev-on-surface">SDK Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(codeExamples).map(([lang, code]) => (
            <Card key={lang} className="bg-ev-surface border-ev-outline">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-ev-primary" />
                    <CardTitle className="text-ev-on-surface capitalize">{lang}</CardTitle>
                  </div>
                  <button
                    onClick={() => handleCopyCode(code, lang)}
                    className="p-1.5 hover:bg-ev-surface-high rounded transition-colors"
                  >
                    {copiedCode === lang ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-ev-on-surface-variant" />
                    )}
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-ev-surface-container p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm text-ev-on-surface font-mono whitespace-pre">
                    {code}
                  </code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Interactive API Docs */}
      <Card className="bg-ev-surface border-ev-outline">
        <CardHeader>
          <CardTitle className="text-ev-on-surface">API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="border border-ev-outline rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)
                  }
                  className="w-full flex items-center justify-between p-4 hover:bg-ev-surface-container transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={cn(
                        'text-xs font-bold',
                        endpoint.method === 'GET' && 'bg-green-500/20 text-green-400',
                        endpoint.method === 'POST' && 'bg-blue-500/20 text-blue-400',
                        endpoint.method === 'DELETE' && 'bg-red-500/20 text-red-400'
                      )}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-ev-primary font-mono">{endpoint.path}</code>
                    <span className="text-ev-on-surface-variant text-sm">
                      {endpoint.description}
                    </span>
                  </div>
                  {expandedEndpoint === endpoint.id ? (
                    <ChevronUp className="w-5 h-5 text-ev-on-surface-variant" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-ev-on-surface-variant" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedEndpoint === endpoint.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-ev-outline"
                    >
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="text-ev-on-surface font-semibold mb-2">Parameters</h4>
                          <div className="bg-ev-surface-container p-3 rounded">
                            {endpoint.params.map((param, i) => (
                              <code key={i} className="text-ev-secondary text-sm block">
                                {param}
                                {i < endpoint.params.length - 1 && ','}
                              </code>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-ev-on-surface font-semibold mb-2">Response</h4>
                          <div className="bg-ev-surface-container p-3 rounded">
                            <code className="text-ev-primary text-sm">{endpoint.response}</code>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Key Modal */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <div className="bg-ev-surface rounded-xl p-6 max-w-md w-full border border-ev-outline">
            <h2 className="text-2xl font-bold text-ev-on-surface mb-4">Create New API Key</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ev-on-surface mb-2">
                  Key Name
                </label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production Key"
                  className="bg-ev-surface-container border-ev-outline text-ev-on-surface"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ev-on-surface mb-3">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permission.checked}
                        onChange={(e) =>
                          setPermissions(
                            permissions.map((p) =>
                              p.id === permission.id ? { ...p, checked: e.target.checked } : p
                            )
                          )
                        }
                        className="w-4 h-4 rounded border-ev-outline bg-ev-surface-container text-ev-primary-container focus:ring-ev-primary"
                      />
                      <span className="text-ev-on-surface">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-ev-surface-high text-ev-on-surface hover:bg-ev-outline"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim()}
                  className="flex-1 bg-ev-primary-container text-ev-bg hover:bg-ev-primary disabled:opacity-50"
                >
                  Create Key
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Generated Key Modal */}
      {showKeyModal && (
        <Modal onClose={() => setShowKeyModal(false)}>
          <div className="bg-ev-surface rounded-xl p-6 max-w-md w-full border border-ev-outline">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-ev-on-surface mb-2 text-center">
              API Key Created!
            </h2>
            <p className="text-ev-on-surface-variant text-center mb-4">
              Save this key now. You won't be able to see it again.
            </p>
            <div className="bg-ev-surface-container p-4 rounded-lg mb-4">
              <code className="text-ev-primary text-sm break-all block">{generatedKey}</code>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(generatedKey);
                  handleCopyCode(generatedKey, 'generated');
                }}
                className="flex-1 bg-ev-primary-container text-ev-bg hover:bg-ev-primary"
              >
                {copiedCode === 'generated' ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Key
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 bg-ev-surface-high text-ev-on-surface hover:bg-ev-outline"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
