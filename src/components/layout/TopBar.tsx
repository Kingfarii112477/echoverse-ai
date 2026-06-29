'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopBarProps {
  onMenuClick?: () => void;
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/voice-studio': 'Voice Studio',
  '/ssml-studio': 'SSML Studio',
  '/story-studio': 'Story Studio',
  '/podcast-studio': 'Podcast Studio',
  '/audiobook-studio': 'Audiobook Studio',
  '/video-studio': 'Video Studio',
  '/reels-generator': 'Reels Generator',
  '/emotion-engine': 'Emotion Engine',
  '/voice-brand-kits': 'Voice Brand Kits',
  '/voice-cloning': 'Voice Cloning',
  '/templates': 'Templates',
  '/team': 'Team',
  '/analytics': 'Analytics',
  '/api-access': 'API Access',
  '/pricing': 'Pricing',
  '/settings': 'Settings',
};

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pageTitle = pageTitles[pathname] || 'EchoVerse AI';

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'EV';

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    router.push('/auth');
  };

  return (
    <header className="h-16 bg-ev-surface/50 backdrop-blur-xl border-b border-ev-outline/30 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-ev-surface-high transition-colors"
        >
          <Menu className="w-6 h-6 text-ev-on-surface" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg md:text-xl font-display font-semibold text-ev-on-surface">
          {pageTitle}
        </h1>
      </div>

      {/* Center Section - Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ev-on-surface-variant" />
          <input
            type="text"
            placeholder="Search projects, voices, templates..."
            className="w-full pl-10 pr-4 py-2 bg-ev-surface-container/50 backdrop-blur-sm border border-ev-outline/30 rounded-lg text-sm text-ev-on-surface placeholder:text-ev-on-surface-variant focus:outline-none focus:ring-2 focus:ring-ev-primary/50 focus:border-ev-primary transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        <button className="md:hidden p-2 rounded-lg hover:bg-ev-surface-high transition-colors">
          <Search className="w-5 h-5 text-ev-on-surface-variant" />
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg hover:bg-ev-surface-high transition-colors">
          <Bell className="w-5 h-5 text-ev-on-surface-variant" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full border border-ev-surface" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pr-3 rounded-lg hover:bg-ev-surface-high transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {initials}
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-ev-on-surface-variant transition-transform hidden md:block',
                isUserMenuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsUserMenuOpen(false)}
                />

                {/* Menu */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-ev-surface border border-ev-outline/30 rounded-lg shadow-xl overflow-hidden z-40"
                >
                  <div className="p-3 border-b border-ev-outline/30">
                    <div className="font-medium text-sm text-ev-on-surface">{user?.full_name || "User"}</div>
                    <div className="text-xs text-ev-on-surface-variant">{user?.email}</div>
                    <div className="mt-2 inline-block text-xs bg-ev-primary-container text-ev-primary px-2 py-1 rounded-full font-medium capitalize">
                      {user?.subscription_tier || "free"}
                    </div>
                  </div>

                  <div className="p-1">
                    <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ev-surface-high transition-colors text-left">
                      <User className="w-4 h-4 text-ev-on-surface-variant" />
                      <span className="text-sm text-ev-on-surface">Profile</span>
                    </Link>
                    <Link href="/settings" onClick={() => setIsUserMenuOpen(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ev-surface-high transition-colors text-left">
                      <Settings className="w-4 h-4 text-ev-on-surface-variant" />
                      <span className="text-sm text-ev-on-surface">Settings</span>
                    </Link>
                  </div>

                  <div className="p-1 border-t border-ev-outline/30">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-ev-surface-high transition-colors text-left text-ev-error">
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
