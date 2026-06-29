'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface BarChartCardProps {
  title: string;
  data: DataPoint[];
  dataKey?: string;
  xAxisKey?: string;
  className?: string;
}

export function BarChartCard({
  title,
  data,
  dataKey = 'value',
  xAxisKey = 'name',
  className,
}: BarChartCardProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ev-surface-container border border-ev-outline/30 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-ev-on-surface font-body mb-1">{label}</p>
          <p className="text-lg font-semibold text-ev-primary-container font-display">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(174, 236, 255, 1)" />
                <stop offset="100%" stopColor="rgba(138, 119, 255, 0.8)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey={xAxisKey}
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-body)' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              style={{ fontSize: '12px', fontFamily: 'var(--font-body)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={dataKey}
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
