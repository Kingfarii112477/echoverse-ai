'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Globe, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authService } from '@/lib/supabase';

type TabType = 'signin' | 'signup' | 'forgot';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (activeTab === 'signup' && !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (activeTab !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      if (activeTab === 'signin') {
        await authService.signIn(formData.email, formData.password);
        router.push('/dashboard');
      } else if (activeTab === 'signup') {
        const data = await authService.signUp(formData.email, formData.password, formData.fullName);
        if (data.user && !data.session) {
          // Email confirmation required
          setSuccessMessage('Account created! Check your email to confirm before signing in.');
          setActiveTab('signin');
        } else {
          router.push('/dashboard');
        }
      } else if (activeTab === 'forgot') {
        await authService.resetPassword(formData.email);
        setSuccessMessage('Password reset link sent! Check your email.');
      }
    } catch (error: any) {
      const msg = error?.message || 'An error occurred. Please try again.';
      if (msg.includes('Invalid login credentials')) {
        setServerError('Incorrect email or password.');
      } else if (msg.includes('User already registered')) {
        setServerError('An account with this email already exists. Sign in instead.');
      } else if (msg.includes('Email not confirmed')) {
        setServerError('Please confirm your email before signing in.');
      } else {
        setServerError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
      // Redirect handled by OAuth callback
    } catch (error: any) {
      setServerError(error?.message || 'Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-ev-primary/10"
            style={{
              width: `${300 + i * 200}px`,
              height: `${300 + i * 200}px`,
              top: '50%',
              left: '50%',
            }}
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear', delay: i * 2 }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[rgba(17,17,17,0.85)] backdrop-blur-[24px] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <svg width="56" height="56" viewBox="0 0 60 60" fill="none">
              <defs>
                <linearGradient id="authGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path d="M15 30 Q22.5 15, 30 30 T45 30 Q52.5 45, 45 30 T30 30 Q22.5 15, 15 30 Z"
                stroke="url(#authGrad)" strokeWidth="2.5" fill="none" />
              <path d="M18 30 Q21 25.5, 24 30 T30 30" stroke="url(#authGrad)" strokeWidth="2" fill="none" opacity="0.6" />
              <path d="M30 30 Q33 34.5, 36 30 T42 30" stroke="url(#authGrad)" strokeWidth="2" fill="none" opacity="0.6" />
            </svg>
          </div>
          <h1 className="text-center text-xl font-bold text-ev-on-surface mb-1">EchoVerse AI</h1>
          <p className="text-center text-sm text-ev-on-surface-variant mb-7">Every Voice Has An Echo.</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-ev-surface-container rounded-lg">
            {(['signin', 'signup'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setServerError(''); setSuccessMessage(''); }}
                className={cn(
                  'flex-1 py-2.5 rounded-md font-medium text-sm transition-all',
                  activeTab === tab
                    ? 'bg-ev-surface-high text-ev-on-surface shadow-sm'
                    : 'text-ev-on-surface-variant hover:text-ev-on-surface'
                )}
              >
                {tab === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Server feedback */}
          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-4 p-3 bg-ev-error/10 border border-ev-error/30 rounded-lg text-ev-error text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {serverError}
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                {successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {activeTab === 'signup' && (
                <motion.div
                  key="fullName"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium text-ev-on-surface-variant mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-on-surface-variant" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      className={cn(
                        'w-full pl-10 pr-4 py-3 bg-ev-surface-container border rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 transition-all text-sm',
                        errors.fullName ? 'border-ev-error focus:ring-ev-error/50' : 'border-ev-outline focus:ring-ev-primary/50 focus:border-ev-primary'
                      )}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-ev-error mt-1">{errors.fullName}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-ev-on-surface-variant mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-on-surface-variant" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={cn(
                    'w-full pl-10 pr-4 py-3 bg-ev-surface-container border rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 transition-all text-sm',
                    errors.email ? 'border-ev-error focus:ring-ev-error/50' : 'border-ev-outline focus:ring-ev-primary/50 focus:border-ev-primary'
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-ev-error mt-1">{errors.email}</p>}
            </div>

            {activeTab !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-medium text-ev-on-surface-variant">Password</label>
                  {activeTab === 'signin' && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setServerError(''); }}
                      className="text-xs text-ev-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ev-on-surface-variant" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••"
                    autoComplete={activeTab === 'signup' ? 'new-password' : 'current-password'}
                    className={cn(
                      'w-full pl-10 pr-4 py-3 bg-ev-surface-container border rounded-lg text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 transition-all text-sm',
                      errors.password ? 'border-ev-error focus:ring-ev-error/50' : 'border-ev-outline focus:ring-ev-primary/50 focus:border-ev-primary'
                    )}
                  />
                </div>
                {errors.password && <p className="text-xs text-ev-error mt-1">{errors.password}</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-ev-primary-container text-ev-bg font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {activeTab === 'signin' ? 'Sign In' : activeTab === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>

            {activeTab === 'forgot' && (
              <button
                type="button"
                onClick={() => { setActiveTab('signin'); setServerError(''); setSuccessMessage(''); }}
                className="w-full text-sm text-ev-on-surface-variant hover:text-ev-on-surface transition-colors"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {activeTab !== 'forgot' && (
            <>
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-ev-outline/30" />
                <span className="text-xs text-ev-on-surface-variant">or continue with</span>
                <div className="flex-1 h-px bg-ev-outline/30" />
              </div>

              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-3 bg-transparent border border-ev-outline rounded-lg text-ev-on-surface hover:bg-ev-surface-high transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Globe className="w-4 h-4" />
                Continue with Google
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
