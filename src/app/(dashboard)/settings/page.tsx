'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  User,
  Lock,
  Bell,
  Key,
  BookOpen,
  CreditCard,
  Trash2,
  Plus,
  Edit2,
  Search,
  Download,
  Shield,
  Globe,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/authStore';
import { profileService } from '@/lib/supabase';

type Tab = 'profile' | 'account' | 'notifications' | 'api' | 'dictionary' | 'billing';

interface DictionaryEntry {
  id: string;
  word: string;
  phonetic: string;
  language: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending';
}

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveProfile = useCallback(async () => {
    if (!user) return;
    setIsSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      const updated = await profileService.updateProfile(user.id, { full_name: fullName, bio });
      if (user) setUser({ ...user, full_name: updated.full_name, bio: updated.bio });
      setSaveSuccess('Profile saved successfully.');
    } catch (err: any) { setSaveError(err.message); }
    finally { setIsSaving(false); }
  }, [user, fullName, bio, setUser]);

  const handleChangePassword = useCallback(async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setSaveError('Passwords do not match.'); return;
    }
    if (newPassword.length < 8) {
      setSaveError('Password must be at least 8 characters.'); return;
    }
    setIsSaving(true); setSaveError(''); setSaveSuccess('');
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSaveSuccess('Password updated successfully.');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) { setSaveError(err.message); }
    finally { setIsSaving(false); }
  }, [newPassword, confirmPassword]);
  const [language, setLanguage] = useState('english');
  const [timezone, setTimezone] = useState('UTC');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [emailNotifications, setEmailNotifications] = useState({
    projectCompleted: true,
    voiceCloneReady: true,
    teamActivity: false,
    newsletter: true,
    productUpdates: true,
  });

  const [pushNotifications, setPushNotifications] = useState({
    generationComplete: true,
    errorAlerts: true,
    teamMentions: true,
  });

  const [inAppNotifications, setInAppNotifications] = useState<'all' | 'mentions' | 'none'>('all');

  const [dictionaryEntries, setDictionaryEntries] = useState<DictionaryEntry[]>([
    { id: '1', word: 'پاکستان', phonetic: 'pa-ki-staan', language: 'Urdu' },
    { id: '2', word: 'EchoVerse', phonetic: 'eh-ko-vers', language: 'English' },
    { id: '3', word: 'مصنوعی ذہانت', phonetic: 'mas-noo-ee za-ha-nat', language: 'Urdu' },
    { id: '4', word: 'Podcast', phonetic: 'pod-kaast', language: 'English' },
    { id: '5', word: 'قرآن', phonetic: 'qur-aan', language: 'Arabic' },
  ]);

  const invoices: Invoice[] = [
    { id: 'INV-001', date: '2024-05-01', amount: '$29.00', status: 'paid' },
    { id: 'INV-002', date: '2024-04-01', amount: '$29.00', status: 'paid' },
    { id: 'INV-003', date: '2024-03-01', amount: '$29.00', status: 'paid' },
    { id: 'INV-004', date: '2024-02-01', amount: '$29.00', status: 'paid' },
    { id: 'INV-005', date: '2024-01-01', amount: '$29.00', status: 'paid' },
  ];

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'account' as Tab, label: 'Account', icon: Lock },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'api' as Tab, label: 'API', icon: Key },
    { id: 'dictionary' as Tab, label: 'Pronunciation Dictionary', icon: BookOpen },
    { id: 'billing' as Tab, label: 'Billing', icon: CreditCard },
  ];

  const addDictionaryEntry = () => {
    const newEntry: DictionaryEntry = {
      id: Date.now().toString(),
      word: '',
      phonetic: '',
      language: 'English',
    };
    setDictionaryEntries([...dictionaryEntries, newEntry]);
  };

  const deleteDictionaryEntry = (id: string) => {
    setDictionaryEntries(dictionaryEntries.filter((entry) => entry.id !== id));
  };

  const filteredEntries = dictionaryEntries.filter(
    (entry) =>
      entry.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.phonetic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[--ev-bg] text-[--ev-on-surface] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-[--ev-on-surface-variant]">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs Navigation */}
          <div className="md:w-64 flex-shrink-0">
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all whitespace-nowrap',
                      activeTab === tab.id
                        ? 'bg-[--ev-primary-container] text-[--ev-bg]'
                        : 'text-[--ev-on-surface-variant] hover:bg-[--ev-surface-high]'
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'profile' && (
                <Card className="bg-[--ev-surface] border-[--ev-outline]">
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Avatar Upload */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Profile Photo</label>
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full bg-[--ev-surface-high] flex items-center justify-center">
                            <User className="w-12 h-12 text-[--ev-on-surface-variant]" />
                          </div>
                          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[--ev-primary-container] flex items-center justify-center hover:opacity-80 transition-opacity">
                            <Camera className="w-4 h-4 text-[--ev-bg]" />
                          </button>
                        </div>
                        <Button variant="outline">Upload Photo</Button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input value={user?.email || ""} disabled />
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        className="w-full px-3 py-2 bg-[--ev-surface-high] border border-[--ev-outline] rounded-lg text-[--ev-on-surface] placeholder:text-[--ev-on-surface-variant] focus:outline-none focus:ring-2 focus:ring-[--ev-primary] min-h-[100px] resize-y"
                      />
                    </div>

                    {/* Language Preference */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Language Preference
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-3 py-2 bg-[--ev-surface-high] border border-[--ev-outline] rounded-lg text-[--ev-on-surface] focus:outline-none focus:ring-2 focus:ring-[--ev-primary]"
                      >
                        <option value="english">English</option>
                        <option value="urdu">Urdu</option>
                        <option value="hindi">Hindi</option>
                        <option value="arabic">Arabic</option>
                      </select>
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timezone
                      </label>
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full px-3 py-2 bg-[--ev-surface-high] border border-[--ev-outline] rounded-lg text-[--ev-on-surface] focus:outline-none focus:ring-2 focus:ring-[--ev-primary]"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Dubai">Dubai</option>
                        <option value="Asia/Karachi">Karachi</option>
                      </select>
                    </div>

                    <Button className="w-full md:w-auto">Save Changes</Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Email</label>
                        <div className="text-[--ev-on-surface-variant]">{user?.email || ""}</div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Current Password</label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <Input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                      <Button>Update Password</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Two-Factor Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium mb-1">Enable 2FA</p>
                          <p className="text-sm text-[--ev-on-surface-variant]">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button
                          onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                          className={cn(
                            'relative w-12 h-6 rounded-full transition-colors',
                            twoFactorEnabled ? 'bg-[--ev-primary-container]' : 'bg-[--ev-surface-high]'
                          )}
                        >
                          <div
                            className={cn(
                              'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                              twoFactorEnabled ? 'translate-x-7' : 'translate-x-1'
                            )}
                          />
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-2 border-[--ev-error]">
                    <CardHeader>
                      <CardTitle className="text-[--ev-error]">Danger Zone</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[--ev-on-surface-variant]">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button variant="outline" className="border-[--ev-error] text-[--ev-error] hover:bg-[--ev-error] hover:text-white">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <Card className="bg-[--ev-surface] border-[--ev-outline]">
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="font-semibold mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'projectCompleted', label: 'Project completed' },
                          { key: 'voiceCloneReady', label: 'Voice clone ready' },
                          { key: 'teamActivity', label: 'Team activity' },
                          { key: 'newsletter', label: 'Newsletter' },
                          { key: 'productUpdates', label: 'Product updates' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailNotifications[item.key as keyof typeof emailNotifications]}
                              onChange={(e) =>
                                setEmailNotifications({
                                  ...emailNotifications,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="w-4 h-4 accent-[--ev-primary-container]"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div>
                      <h3 className="font-semibold mb-4">Push Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'generationComplete', label: 'Generation complete' },
                          { key: 'errorAlerts', label: 'Error alerts' },
                          { key: 'teamMentions', label: 'Team mentions' },
                        ].map((item) => (
                          <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={pushNotifications[item.key as keyof typeof pushNotifications]}
                              onChange={(e) =>
                                setPushNotifications({
                                  ...pushNotifications,
                                  [item.key]: e.target.checked,
                                })
                              }
                              className="w-4 h-4 accent-[--ev-primary-container]"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* In-App Notifications */}
                    <div>
                      <h3 className="font-semibold mb-4">In-App Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'all', label: 'All activity' },
                          { value: 'mentions', label: 'Mentions only' },
                          { value: 'none', label: 'None' },
                        ].map((item) => (
                          <label key={item.value} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="inApp"
                              checked={inAppNotifications === item.value}
                              onChange={() => setInAppNotifications(item.value as any)}
                              className="w-4 h-4 accent-[--ev-primary-container]"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button>Save Preferences</Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'api' && (
                <div className="space-y-6">
                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>API Access</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium">Current Tier</label>
                          <Badge className="bg-[--ev-primary-container] text-[--ev-bg]">Pro</Badge>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">API Key</label>
                        <div className="flex gap-2">
                          <Input
                            type={apiKeyVisible ? 'text' : 'password'}
                            value=""
                            readOnly
                          />
                          <Button
                            variant="outline"
                            onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          >
                            {apiKeyVisible ? 'Hide' : 'Show'}
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline">Regenerate Key</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Usage Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[--ev-surface-high] rounded-lg">
                          <div className="text-2xl font-bold text-[--ev-primary]">1,247</div>
                          <div className="text-sm text-[--ev-on-surface-variant]">Requests Today</div>
                        </div>
                        <div className="p-4 bg-[--ev-surface-high] rounded-lg">
                          <div className="text-2xl font-bold text-[--ev-primary]">24,891</div>
                          <div className="text-sm text-[--ev-on-surface-variant]">Requests This Month</div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Rate Limits</h4>
                        <div className="text-sm text-[--ev-on-surface-variant] space-y-1">
                          <p>Pro Plan: 10,000 requests per day</p>
                          <p>Current usage: 12.47% of daily limit</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'dictionary' && (
                <Card className="bg-[--ev-surface] border-[--ev-outline]">
                  <CardHeader>
                    <CardTitle>Pronunciation Dictionary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--ev-on-surface-variant]" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search entries..."
                          className="pl-10"
                        />
                      </div>
                      <Button onClick={addDictionaryEntry}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Entry
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[--ev-outline]">
                            <th className="text-left py-3 px-4 font-medium">Word</th>
                            <th className="text-left py-3 px-4 font-medium">Phonetic</th>
                            <th className="text-left py-3 px-4 font-medium">Language</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredEntries.map((entry) => (
                            <tr key={entry.id} className="border-b border-[--ev-outline]">
                              <td className="py-3 px-4">{entry.word}</td>
                              <td className="py-3 px-4 text-[--ev-on-surface-variant]">
                                {entry.phonetic}
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline">{entry.language}</Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button className="p-1 hover:bg-[--ev-surface-high] rounded">
                                    <Edit2 className="w-4 h-4 text-[--ev-primary]" />
                                  </button>
                                  <button
                                    onClick={() => deleteDictionaryEntry(entry.id)}
                                    className="p-1 hover:bg-[--ev-surface-high] rounded"
                                  >
                                    <Trash2 className="w-4 h-4 text-[--ev-error]" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Current Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-2xl font-bold">Pro Plan</h3>
                            <Badge className="bg-[--ev-primary-container] text-[--ev-bg]">Active</Badge>
                          </div>
                          <p className="text-3xl font-bold text-[--ev-primary] mb-1">
                            $29<span className="text-base text-[--ev-on-surface-variant]">/month</span>
                          </p>
                          <p className="text-sm text-[--ev-on-surface-variant]">
                            Renews on July 1, 2024
                          </p>
                        </div>
                        <Button variant="outline">Change Plan</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[--ev-surface-high] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-[--ev-primary-container] rounded flex items-center justify-center font-bold text-[--ev-bg]">
                            VISA
                          </div>
                          <div>
                            <p className="font-medium">Visa ending in 4242</p>
                            <p className="text-sm text-[--ev-on-surface-variant]">Expires 12/25</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Update
                        </Button>
                      </div>
                      <Button variant="outline">Update Payment Method</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-[--ev-outline]">
                    <CardHeader>
                      <CardTitle>Invoice History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[--ev-outline]">
                              <th className="text-left py-3 px-4 font-medium">Date</th>
                              <th className="text-left py-3 px-4 font-medium">Amount</th>
                              <th className="text-left py-3 px-4 font-medium">Status</th>
                              <th className="text-left py-3 px-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {invoices.map((invoice) => (
                              <tr key={invoice.id} className="border-b border-[--ev-outline]">
                                <td className="py-3 px-4">{invoice.date}</td>
                                <td className="py-3 px-4 font-medium">{invoice.amount}</td>
                                <td className="py-3 px-4">
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                    Paid
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <button className="flex items-center gap-2 text-[--ev-primary] hover:underline">
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[--ev-surface] border-2 border-[--ev-error]">
                    <CardHeader>
                      <CardTitle className="text-[--ev-error]">Cancel Subscription</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[--ev-on-surface-variant]">
                        Canceling your subscription will downgrade your account to the free plan at the end of your billing cycle.
                      </p>
                      <Button variant="outline" className="border-[--ev-error] text-[--ev-error] hover:bg-[--ev-error] hover:text-white">
                        Cancel Subscription
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
