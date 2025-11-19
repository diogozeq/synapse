import React from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  label,
  showPercentage = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />

        {/* Percentage text */}
        {showPercentage && (
          <text
            x="50%"
            y="50%"
            dy=".3em"
            textAnchor="middle"
            className="text-2xl font-bold fill-gray-900 dark:fill-white transform rotate-90"
            style={{ transformOrigin: 'center' }}
          >
            {Math.round(progress)}%
          </text>
        )}
      </svg>

      {label && (
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      )}
    </div>
  );
}
