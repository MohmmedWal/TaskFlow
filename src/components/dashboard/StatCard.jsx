import React from 'react';
import { FolderKanban, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StatCard({ title, value, type = 'projects', highlight = false }) {
  const iconMap = {
    projects: FolderKanban,
    active: Clock,
    completed: CheckCircle2,
    overdue: AlertCircle,
  };

  const Icon = iconMap[type] || FolderKanban;

  const typeStyles = {
    projects: {
      iconBg: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    },
    active: {
      iconBg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    completed: {
      iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    overdue: {
      iconBg: highlight
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    },
  };

  const currentStyle = typeStyles[type] || typeStyles.projects;

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-zinc-900/60 shadow-sm ${
        highlight && type === 'overdue' && value > 0
          ? 'border-rose-300/80 dark:border-rose-900/60 ring-1 ring-rose-500/20'
          : 'border-zinc-200 dark:border-zinc-800/80'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{title}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentStyle.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </span>
      </div>
    </div>
  );
}
