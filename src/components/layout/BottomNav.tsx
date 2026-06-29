'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Mic,
  BarChart3,
  Menu,
  X,
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
  Key,
  CreditCard,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: FolderOpen, label: 'Projects', href: '/projects' },
  { icon: Mic, label: 'Voice', href: '/voice-studio' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: Menu, label: 'More', href: '#more' },
];

const moreNavItems = [
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
  { icon: Key, label: 'API Access', href: '/api-access' },
  { icon: CreditCard, label: 'Pricing', href: '/pricing' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export default function BottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const pathname = usePathname();

  const handleNavClick = (href: string) => {
    if (href === '#more') {
      setIsMoreOpen(!isMoreOpen);
    } else {
      setIsMoreOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '#more') {
      return moreNavItems.some((item) => pathname === item.href);
    }
    return pathname === href;
  };

  return (
    <>
      {/* More Menu Sheet */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMoreOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-ev-surface border-t border-ev-outline/30 rounded-t-3xl z-50 md:hidden max-h-[80vh] overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-display font-semibold text-ev-on-surface">
                    More Options
                  </h3>
                  <button
                    onClick={() => setIsMoreOpen(false)}
                    className="p-2 rounded-lg hover:bg-ev-surface-high transition-colors"
                  >
                    <X className="w-5 h-5 text-ev-on-surface" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 overflow-y-auto max-h-[60vh] pb-4">
                  {moreNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMoreOpen(false)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                          active
                            ? 'bg-ev-surface-container text-ev-primary'
                            : 'text-ev-on-surface-variant hover:bg-ev-surface-high'
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-ev-surface/80 backdrop-blur-xl border-t border-ev-outline/30 z-30 md:hidden">
        <div className="h-full flex items-center justify-around px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href === '#more' ? '#' : item.href}
                onClick={() => handleNavClick(item.href)}
                className="flex flex-col items-center justify-center gap-1 flex-1 relative py-2"
              >
                {/* Active indicator dot */}
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute top-0 w-1.5 h-1.5 rounded-full bg-cyan-400"
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  />
                )}
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors',
                    active ? 'text-cyan-400' : 'text-ev-on-surface-variant'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    active ? 'text-cyan-400' : 'text-ev-on-surface-variant'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
