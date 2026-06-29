'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface PieChartCardProps {
  title: string;
  data: DataPoint[];
  centerLabel?: string;
  className?: string;
}

const DEFAULT_COLORS = [
  'rgba(174, 236, 255, 1)', // cyan
  'rgba(138, 119, 255, 1)', // purple
  'rgba(255, 119, 168, 1)', // pink
  'rgba(119, 255, 189, 1)', // green
  'rgba(255, 189, 119, 1)', // orange
  'rgba(189, 119, 255, 1)', // violet
];

export function PieChartCard({
  title,
  data,
  centerLabel,
  className,
}: PieChartCardProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-ev-surface-container border border-ev-outline/30 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-ev-on-surface font-body mb-1">{payload[0].name}</p>
          <p className="text-lg font-semibold text-ev-primary-container font-display">
            {payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-ev-on-surface-variant font-body">
            {((payload[0].value / data.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(
              1
            )}
            %
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-ev-on-surface font-body">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card variant="glass" className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
            {centerLabel && (
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-ev-on-surface font-display text-lg font-semibold"
              >
                {centerLabel}
              </text>
            )}
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
