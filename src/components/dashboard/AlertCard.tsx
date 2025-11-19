import React from 'react';

interface AlertCardProps {
  title: string;
  description: string;
  type: 'warning' | 'error' | 'info' | 'success';
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

const typeStyles = {
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    iconBg: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    iconBg: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    iconBg: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
  }
};

export default function AlertCard({
  title,
  description,
  type,
  action,
  icon
}: AlertCardProps) {
  const styles = typeStyles[type];

  return (
    <div className={`rounded-lg border p-4 ${styles.bg} ${styles.border}`}>
      <div className="flex gap-3">
        {icon && (
          <div className={`flex-shrink-0 p-2 rounded-lg ${styles.iconBg}`}>
            {icon}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-semibold ${styles.text}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${styles.text} opacity-80`}>
            {description}
          </p>

          {action && (
            <button
              onClick={action.onClick}
              className={`mt-3 text-sm font-medium underline ${styles.text} hover:opacity-80`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
