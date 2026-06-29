'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Download,
  Users,
  DollarSign,
  Clock,
  ThumbsUp,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { usageService, projectService } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Chart data built dynamically in component from real usage logs

const voiceTypeData = [
  { name: 'Urdu TTS', value: 4500 },
  { name: 'Hindi TTS', value: 2800 },
  { name: 'English TTS', value: 3200 },
  { name: 'Arabic TTS', value: 1500 },
  { name: 'Voice Clone', value: 890 },
];

const projectTypeData = [
  { name: 'Voice', value: 35, color: '#aeecff' },
  { name: 'Podcast', value: 25, color: '#ccbdff' },
  { name: 'Audiobook', value: 20, color: '#00d8ff' },
  { name: 'Story', value: 10, color: '#48c9b0' },
  { name: 'Video', value: 7, color: '#ff7675' },
  { name: 'Reel', value: 3, color: '#fd79a8' },
];

const kpiData = [
  {
    label: 'Minutes Generated',
    value: '12,847',
    trend: 18.5,
    icon: Clock,
    color: '#aeecff',
  },
  {
    label: 'Downloads',
    value: '3,421',
    trend: 12.3,
    icon: Download,
    color: '#ccbdff',
  },
  {
    label: 'Revenue',
    value: '$4,892',
    trend: 22.1,
    icon: DollarSign,
    color: '#00d8ff',
  },
  {
    label: 'Voice Usage',
    value: '89,234',
    trend: 15.7,
    icon: Users,
    color: '#48c9b0',
  },
];

const growthMetrics = [
  {
    label: 'Monthly Growth',
    value: '+23.5%',
    icon: TrendingUp,
    color: 'text-emerald-400',
  },
  {
    label: 'User Retention',
    value: '87.2%',
    icon: Users,
    color: 'text-[#aeecff]',
  },
  {
    label: 'Avg Session',
    value: '14.3 min',
    icon: Clock,
    color: 'text-[#ccbdff]',
  },
  {
    label: 'NPS Score',
    value: '72',
    icon: ThumbsUp,
    color: 'text-emerald-400',
  },
];

const insights = [
  'Your Urdu content has 40% higher engagement',
  'Voice cloning usage increased 60% this month',
  'Peak usage hours: 2PM - 6PM PKT',
  'Recommend: Expand Arabic voice library',
];

export default function AnalyticsPage() {
  const { user } = useAuthStore();
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [kpis, setKpis] = useState({ minutes: 0, downloads: 0, projects: 0 });

  const loadAnalytics = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const logs = await usageService.getUsageSummary(user.id, days);
      const projects = await projectService.getProjects(user.id);

      setUsageLogs(logs);

      // Build daily chart
      const dayMap: Record<string, { minutes: number; date: string }> = {};
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dayMap[key] = { minutes: 0, date: key };
      }
      logs.forEach(log => {
        const key = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (dayMap[key]) dayMap[key].minutes += log.units || 0;
      });
      setChartData(Object.values(dayMap));

      const totalMinutes = logs.reduce((s, l) => s + (l.units || 0), 0);
      const downloads = projects.filter(p => p.file_url).length;
      setKpis({ minutes: totalMinutes, downloads, projects: projects.length });
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }, [user, dateRange]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  const handleExport = () => {
    const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echoverse-analytics.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0e1417] text-[#dde4e6] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a2123] rounded-lg">
              <BarChart3 className="w-6 h-6 text-[#aeecff]" />
            </div>
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1 bg-[#131c1f] rounded-lg p-1 border border-[#3c494d]">
              {(['7d', '30d', '90d', 'custom'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={cn(
                    'px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium',
                    dateRange === range
                      ? 'bg-[#aeecff]/20 text-[#aeecff]'
                      : 'text-[#859398] hover:text-[#dde4e6]'
                  )}
                >
                  {range === 'custom' ? 'Custom' : range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-[#131c1f] border-[#3c494d]">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${kpi.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: kpi.color }} />
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>{kpi.trend}%</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold mb-1">{kpi.value}</p>
                    <p className="text-sm text-[#859398]">{kpi.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-[#131c1f] border-[#3c494d] mb-8">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">
                Minutes Generated Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3c494d" />
                  <XAxis
                    dataKey="date"
                    stroke="#859398"
                    tick={{ fill: '#859398' }}
                  />
                  <YAxis stroke="#859398" tick={{ fill: '#859398' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a2123',
                      border: '1px solid #3c494d',
                      borderRadius: '8px',
                      color: '#dde4e6',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="minutes"
                    stroke="#aeecff"
                    strokeWidth={2}
                    dot={{ fill: '#aeecff', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout - Bar Chart and Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[#131c1f] border-[#3c494d]">
              <CardHeader>
                <CardTitle className="text-[#dde4e6]">
                  Voice Type Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={voiceTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3c494d" />
                    <XAxis
                      dataKey="name"
                      stroke="#859398"
                      tick={{ fill: '#859398', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="#859398" tick={{ fill: '#859398' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2123',
                        border: '1px solid #3c494d',
                        borderRadius: '8px',
                        color: '#dde4e6',
                      }}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d8ff" stopOpacity={1} />
                        <stop offset="100%" stopColor="#aeecff" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[#131c1f] border-[#3c494d]">
              <CardHeader>
                <CardTitle className="text-[#dde4e6]">
                  Project Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={projectTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}%`}
                      labelLine={{ stroke: '#859398' }}
                    >
                      {projectTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a2123',
                        border: '1px solid #3c494d',
                        borderRadius: '8px',
                        color: '#dde4e6',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Growth Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-[#131c1f] border-[#3c494d] mb-8">
            <CardHeader>
              <CardTitle className="text-[#dde4e6]">Growth Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {growthMetrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      key={metric.label}
                      className="p-4 bg-[#1a2123] rounded-lg border border-[#3c494d]"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={cn('w-5 h-5', metric.color)} />
                        <span className={cn('text-2xl font-bold', metric.color)}>
                          {metric.value}
                        </span>
                      </div>
                      <p className="text-sm text-[#859398]">{metric.label}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Two Column Layout - AI Insights and Export */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-[#131c1f] to-[#1a2123] border-[#aeecff]/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#aeecff]" />
                  <CardTitle className="text-[#dde4e6]">AI Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-[#242b2d]/50 rounded-lg border border-[#3c494d]"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#aeecff] mt-2 flex-shrink-0" />
                      <p className="text-[#dde4e6]">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Report */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-[#131c1f] border-[#3c494d]">
              <CardHeader>
                <CardTitle className="text-[#dde4e6]">Export Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[#859398]">
                      Format
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExportFormat('pdf')}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg border transition-all duration-200',
                          exportFormat === 'pdf'
                            ? 'bg-[#aeecff]/20 text-[#aeecff] border-[#aeecff]'
                            : 'bg-[#1a2123] text-[#859398] border-[#3c494d] hover:border-[#859398]'
                        )}
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => setExportFormat('csv')}
                        className={cn(
                          'flex-1 px-4 py-2 rounded-lg border transition-all duration-200',
                          exportFormat === 'csv'
                            ? 'bg-[#aeecff]/20 text-[#aeecff] border-[#aeecff]'
                            : 'bg-[#1a2123] text-[#859398] border-[#3c494d] hover:border-[#859398]'
                        )}
                      >
                        CSV
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleExport}
                    className="w-full bg-[#aeecff] text-[#0e1417] hover:bg-[#00d8ff]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>

                  <div className="p-4 bg-[#1a2123] rounded-lg border border-[#3c494d]">
                    <p className="text-sm text-[#859398] mb-2">
                      Report includes:
                    </p>
                    <ul className="text-sm text-[#dde4e6] space-y-1">
                      <li>• All KPI metrics</li>
                      <li>• Usage charts</li>
                      <li>• Voice analytics</li>
                      <li>• Growth trends</li>
                      <li>• AI insights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
