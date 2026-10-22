import React from 'react';
import { Plus, Edit3, Trash2, Folder, Calendar, Users, ShieldCheck } from 'lucide-react';
import { formatDate } from '../../lib/dates';

export default function ProjectHeader({
  project,
  isOwner,
  onAddTask,
  onEditProject,
  onDeleteProject,
}) {
  return (
    <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
        {/* Project Branding & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center flex-shrink-0 shadow-md">
            <Folder className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {project.name}
              </h1>
              {isOwner ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>مالك المشروع</span>
                </span>
              ) : (
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-50 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                  عضو مساهم
                </span>
              )}
            </div>

            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-3xl pt-1">
              {project.description || 'لا يوجد وصف مضاف لهذا المشروع.'}
            </p>

            {/* Quick Metadata */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 pt-2 flex-wrap">
              {project.createdAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>تم الإنشاء: {formatDate(project.createdAt)}</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                <span>{project.memberIds?.length || 1} أعضاء في الفريق</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold rounded-2xl transition-all shadow active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مهمة جديدة</span>
          </button>

          {isOwner && (
            <>
              <button
                onClick={onEditProject}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-2xl border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
                title="تعديل المشروع"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>تعديل</span>
              </button>
              <button
                onClick={onDeleteProject}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-medium rounded-2xl border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                title="حذف المشروع نهائياً"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
