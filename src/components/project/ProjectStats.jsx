import React from 'react';
import { Circle, Clock, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from 'lucide-react';
import { isOverdue } from '../../lib/dates';

export default function ProjectStats({ projectTasks = [] }) {
  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = projectTasks.filter((t) => t.status === 'done');
  const overdueCount = projectTasks.filter((t) => isOverdue(t)).length;

  const total = projectTasks.length;
  const progressPercentage = total
    ? Math.round((completedTasks.length / total) * 100)
    : 0;

  // SVG Circular Gauge calculation
  const radius = 34;
  const circumference = 2 * Math.PI * radius; // ~213.6
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
      {/* Top Section: Circular Donut Gauge + Progress Summary */}
      <div className="flex items-center gap-5">
        {/* Circular Gauge */}
        <div className="relative w-22 h-22 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 80 80">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              className="text-zinc-100 dark:text-zinc-800"
              fill="transparent"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="currentColor"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-emerald-500 transition-all duration-700 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-none">
              {progressPercentage}%
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold mt-1">
              مكتمل
            </span>
          </div>
        </div>

        {/* Text & Multi-Segment Progress Bar */}
        <div className="flex-1 space-y-2 min-w-0">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>معدل إنجاز المهام</span>
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {completedTasks.length} من {total} مكتملة
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {total > 0 ? (
              <>
                {completedTasks.length > 0 && (
                  <div
                    style={{ width: `${(completedTasks.length / total) * 100}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    title={`المكتملة: ${completedTasks.length}`}
                  />
                )}
                {inProgressTasks.length > 0 && (
                  <div
                    style={{ width: `${(inProgressTasks.length / total) * 100}%` }}
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    title={`قيد التنفيذ: ${inProgressTasks.length}`}
                  />
                )}
                {todoTasks.length > 0 && (
                  <div
                    style={{ width: `${(todoTasks.length / total) * 100}%` }}
                    className="bg-zinc-300 dark:bg-zinc-600 h-full rounded-full transition-all duration-500"
                    title={`قيد الانتظار: ${todoTasks.length}`}
                  />
                )}
              </>
            ) : (
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-full rounded-full" />
            )}
          </div>

          {/* Micro legend */}
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>مكتمل ({completedTasks.length})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>تنفيذ ({inProgressTasks.length})</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
              <span>انتظار ({todoTasks.length})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: 4 Stat Cards in 2x2 Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
        {/* To Do (First!) */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 flex-shrink-0">
              <Circle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block truncate">
                To Do
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">قيد الانتظار</span>
            </div>
          </div>
          <span className="text-base font-black text-zinc-900 dark:text-zinc-100 mr-1">
            {todoTasks.length}
          </span>
        </div>

        {/* In Progress (Second!) */}
        <div className="p-3 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block truncate">
                In Progress
              </span>
              <span className="text-[10px] text-blue-500/80 dark:text-blue-400/70 block truncate">قيد التنفيذ</span>
            </div>
          </div>
          <span className="text-base font-black text-blue-700 dark:text-blue-300 mr-1">
            {inProgressTasks.length}
          </span>
        </div>

        {/* Done */}
        <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block truncate">
                Done
              </span>
              <span className="text-[10px] text-emerald-500/80 dark:text-emerald-400/70 block truncate">المكتملة</span>
            </div>
          </div>
          <span className="text-base font-black text-emerald-700 dark:text-emerald-300 mr-1">
            {completedTasks.length}
          </span>
        </div>

        {/* Overdue */}
        <div className="p-3 bg-rose-50/40 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 block truncate">
                متأخرة
              </span>
              <span className="text-[10px] text-rose-500/80 dark:text-rose-400/70 block truncate">تجاوزت الموعد</span>
            </div>
          </div>
          <span className="text-base font-black text-rose-700 dark:text-rose-300 mr-1">
            {overdueCount}
          </span>
        </div>
      </div>
    </div>
  );
}
