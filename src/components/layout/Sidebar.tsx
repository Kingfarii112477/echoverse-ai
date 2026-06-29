'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Mic,
  Code,
  BookOpen,
  Headphones,
  Library,
  Video,
  Film,
  Heart,
  Palette,
  Copy,
  LayoutTemplate,
  Users,
  BarChart3,
  Key,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
  { icon: Mic, label: 'Voice Studio', href: '/voice-studio' },
  { icon: Code, label: 'SSML Studio', href: '/ssml-studio' },
  { icon: BookOpen, label: 'Story Studio', href: '/story-studio' },
  { icon: Headphones, label: 'Podcast Studio', href: '/podcast-studio' },
  { icon: Library, label: 'Audiobook Studio', href: '/audiobook-studio' },
  { icon: Video, label: 'Video Studio', href: '/video-studio' },
  { icon: Film, label: 'Reels Generator', href: '/reels-generator' },
  { icon: Heart, label: 'Emotion Engine', href: '/emotion-engine' },
  { icon: Palette, label: 'Voice Brand Kits', href: '/voice-brand-kits' },
  { icon: Copy, label: 'Voice Cloning', href: '/voice-cloning' },
  { icon: LayoutTemplate, label: 'Templates', href: '/templates' },
  { icon: Users, label: 'Team', href: '/team' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Key, label: 'API Access', href: '/api-access' },
  { icon: CreditCard, label: 'Pricing', href: '/pricing' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();
  const initials = user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'EV';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-ev-surface border-r border-ev-outline/30 flex flex-col"
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b border-ev-outline/30">
        <div className="flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            {/* Infinity symbol with waveform */}
            <path
              d="M10 20 Q15 10, 20 20 T30 20 Q35 30, 30 20 T20 20 Q15 10, 10 20 Z"
              stroke="url(#logoGradient)"
              strokeWidth="2"
              fill="none"
            />
            {/* Waveform lines inside */}
            <path
              d="M12 20 Q14 17, 16 20 T20 20"
              stroke="url(#logoGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M20 20 Q22 23, 24 20 T28 20"
              stroke="url(#logoGradient)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
          </svg>
          <motion.span
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="font-display text-xl font-bold text-ev-primary overflow-hidden whitespace-nowrap"
          >
            EchoVerse AI
          </motion.span>
        </div>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-ev-outline/50">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group',
                  isActive
                    ? 'bg-ev-surface-container text-ev-primary'
                    : 'text-ev-on-surface-variant hover:bg-ev-surface-high hover:text-ev-on-surface'
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r" />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                <motion.span
                  initial={false}
                  animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-medium overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-ev-surface-high border border-ev-outline/30 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Section */}
      <div className="border-t border-ev-outline/30 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-semibold">
            JD
          </div>
          <motion.div
            initial={false}
            animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="text-sm font-medium text-ev-on-surface">{user?.full_name || "User"}</div>
            <div className="text-xs text-ev-on-surface-variant bg-ev-primary-container px-2 py-0.5 rounded-full inline-block">
              Pro Plan
            </div>
          </motion.div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-ev-surface-high hover:bg-ev-surface-container transition-colors text-ev-on-surface"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
