import React from 'react';
import { Folder, Users, CheckCircle2, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function ProjectCard({ project, tasks = [], isOwner = false, onClick }) {
  const { t, isRTL } = useLanguage();
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const todoTasks = projectTasks.filter((t) => t.status === 'todo');
  const inProgressTasks = projectTasks.filter((t) => t.status === 'in_progress');
  const completedTasks = projectTasks.filter((t) => t.status === 'done');
  const progress = projectTasks.length
    ? Math.round((completedTasks.length / projectTasks.length) * 100)
    : 0;

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-sm group flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start mb-2.5 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center flex-shrink-0 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-900 transition-colors">
              <Folder className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {project.name}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isOwner && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                {t('ownerBadge')}
              </span>
            )}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
              {t('tasksCount', { count: projectTasks.length })}
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3 min-h-[2rem] leading-relaxed">
          {project.description || t('noDescription')}
        </p>

        {/* Task status badges: To Do first, then In Progress, then Done */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          {todoTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/80">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>To Do: {todoTasks.length}</span>
            </span>
          )}
          {inProgressTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>In Progress: {inProgressTasks.length}</span>
            </span>
          )}
          {completedTasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Done: {completedTasks.length}</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress & Members Footer */}
      <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
        <div className="flex justify-between text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
          <span>{t('progress')} ({completedTasks.length}/{projectTasks.length})</span>
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{progress}%</span>
        </div>

        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-zinc-900 dark:bg-zinc-100 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-zinc-400 dark:text-zinc-500 pt-1">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{t('membersCount', { count: project.memberIds?.length || 1 })}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
            <span>{t('openProject')}</span>
            <ChevronLeft
              className={`w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-all ${
                isRTL
                  ? 'group-hover:-translate-x-1'
                  : 'rotate-180 group-hover:translate-x-1'
              }`}
            />
          </span>
        </div>
      </div>
    </div>
  );
}
