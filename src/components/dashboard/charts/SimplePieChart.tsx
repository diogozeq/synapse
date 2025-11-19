import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
}

interface SimplePieChartProps {
  data: DataPoint[];
  colors?: string[];
  height?: number;
}

const DEFAULT_COLORS = [
  '#10b981', // green
  '#3b82f6', // blue
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6'  // purple
];

export default function SimplePieChart({
  data,
  colors = DEFAULT_COLORS,
  height = 300
}: SimplePieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || colors[index % colors.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
