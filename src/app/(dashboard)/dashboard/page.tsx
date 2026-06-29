'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Activity, Zap, HardDrive, Sparkles,
  ArrowRight, Mic, Headphones, BookOpen, Library,
  Video, Film, Clock, Play, Plus, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { projectService, usageService } from '@/lib/supabase';
import type { Project } from '@/types';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { icon: Mic, label: 'New Voice', href: '/voice-studio', color: 'text-cyan-400' },
  { icon: Headphones, label: 'New Podcast', href: '/podcast-studio', color: 'text-purple-400' },
  { icon: BookOpen, label: 'New Story', href: '/story-studio', color: 'text-teal-400' },
  { icon: Library, label: 'Audiobook', href: '/audiobook-studio', color: 'text-blue-400' },
  { icon: Video, label: 'Video', href: '/video-studio', color: 'text-green-400' },
  { icon: Film, label: 'Reel', href: '/reels-generator', color: 'text-pink-400' },
];

const PROJECT_TYPE_ICON: Record<string, any> = {
  voice: Mic, podcast: Headphones, audiobook: Library,
  story: BookOpen, video: Video, reel: Film,
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [projectData, usageData] = await Promise.all([
        projectService.getProjects(user.id),
        usageService.getUsageSummary(user.id, 7),
      ]);
      setProjects(projectData);
      setUsageLogs(usageData);

      // Build 7-day chart from usage logs
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const now = new Date();
      const chart = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dayStr = days[d.getDay()];
        const dayLogs = usageData.filter(log => {
          const logDate = new Date(log.created_at);
          return logDate.toDateString() === d.toDateString();
        });
        const synthesis = dayLogs.filter(l => l.type === 'tts_generation').reduce((s, l) => s + l.units, 0);
        const cloning = dayLogs.filter(l => l.type === 'voice_clone').reduce((s, l) => s + l.units, 0);
        return { day: dayStr, synthesis, cloning };
      });
      setChartData(chart);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalMinutes = usageLogs.reduce((sum, log) => sum + (log.units || 0), 0);
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const recentProjects = projects.slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-ev-primary border-t-transparent animate-spin" />
          <p className="text-ev-on-surface-variant text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ev-on-surface">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Creator'} 👋
          </h1>
          <p className="text-ev-on-surface-variant text-sm mt-1">
            Here's what's happening with your voice content today.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Minutes Generated',
            value: totalMinutes.toLocaleString(),
            icon: Activity,
            trend: '+12%',
            up: true,
            color: 'text-cyan-400',
          },
          {
            label: 'Total Projects',
            value: projects.length.toString(),
            icon: HardDrive,
            trend: completedProjects + ' completed',
            up: true,
            color: 'text-purple-400',
          },
          {
            label: 'This Week',
            value: usageLogs.length.toString() + ' ops',
            icon: Zap,
            trend: 'Last 7 days',
            up: true,
            color: 'text-green-400',
          },
          {
            label: 'Plan',
            value: user?.subscription_tier?.toUpperCase() || 'FREE',
            icon: Sparkles,
            trend: 'Upgrade for more',
            up: false,
            color: 'text-amber-400',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-ev-surface border-ev-outline/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-2 rounded-lg bg-ev-surface-container', stat.color)}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <span className={cn('text-xs font-medium', stat.up ? 'text-green-400' : 'text-ev-on-surface-variant')}>
                    {stat.up && <TrendingUp className="w-3 h-3 inline mr-1" />}
                    {stat.trend}
                  </span>
                </div>
                <div className="text-2xl font-bold text-ev-on-surface">{stat.value}</div>
                <div className="text-xs text-ev-on-surface-variant mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-ev-surface border-ev-outline/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Generation Activity (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some(d => d.synthesis > 0 || d.cloning > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="synthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cloneGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fill: '#859398', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#859398', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#131c1f', border: '1px solid #3c494d', borderRadius: 8 }}
                  labelStyle={{ color: '#dde4e6' }}
                />
                <Area type="monotone" dataKey="synthesis" stroke="#06b6d4" fill="url(#synthGrad)" strokeWidth={2} name="Synthesis" />
                <Area type="monotone" dataKey="cloning" stroke="#a855f7" fill="url(#cloneGrad)" strokeWidth={2} name="Cloning" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-ev-on-surface-variant">
              <Activity className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">No activity yet. Start generating to see your usage chart.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-ev-on-surface mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="bg-ev-surface border-ev-outline/30 hover:border-ev-primary/50 transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <div className={cn('p-2.5 rounded-xl bg-ev-surface-container transition-colors group-hover:bg-ev-surface-high', action.color)}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-ev-on-surface-variant group-hover:text-ev-on-surface text-center">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-ev-on-surface">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="text-ev-primary">
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <Card className="bg-ev-surface border-ev-outline/30 border-dashed">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-ev-surface-container flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-ev-on-surface-variant" />
              </div>
              <h3 className="font-semibold text-ev-on-surface mb-2">No projects yet</h3>
              <p className="text-ev-on-surface-variant text-sm mb-4">
                Start creating your first voice content project.
              </p>
              <Link href="/voice-studio">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project, i) => {
              const Icon = PROJECT_TYPE_ICON[project.type] || Mic;
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-ev-surface border-ev-outline/30 hover:border-ev-primary/40 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-ev-surface-container text-ev-primary shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-ev-on-surface truncate group-hover:text-ev-primary transition-colors">
                            {project.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              project.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                              project.status === 'generating' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-ev-surface-container text-ev-on-surface-variant'
                            )}>
                              {project.status}
                            </span>
                            <span className="text-xs text-ev-on-surface-variant flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {project.duration ? `${Math.round(project.duration)}s` : '—'}
                            </span>
                          </div>
                          {project.status === 'generating' && (
                            <div className="mt-2 w-full bg-ev-surface-container rounded-full h-1">
                              <div
                                className="h-1 rounded-full bg-ev-primary-container transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                        {project.file_url && (
                          <button className="text-ev-on-surface-variant hover:text-ev-primary transition-colors">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
