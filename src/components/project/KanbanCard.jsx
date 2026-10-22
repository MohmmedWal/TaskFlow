import React from 'react';
import {
  Calendar,
  User,
  Pencil,
  Trash2,
  AlertCircle,
  Circle,
  Clock,
  CheckCircle2,
  GripVertical,
  FolderKanban,
} from 'lucide-react';
import { isOverdue, formatDate } from '../../lib/dates';
import { PRIORITY_LABELS } from '../../lib/constants';
import CustomSelect from '../common/CustomSelect';

export default function KanbanCard({
  task,
  projectName,
  members = [],
  onStatusChange,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) {
  const overdue = isOverdue(task);

  const priorityConfig = {
    high: {
      label: PRIORITY_LABELS.high,
      className:
        'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900',
      dot: 'bg-rose-500',
    },
    medium: {
      label: PRIORITY_LABELS.medium,
      className:
        'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
      dot: 'bg-amber-500',
    },
    low: {
      label: PRIORITY_LABELS.low,
      className:
        'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      dot: 'bg-zinc-400',
    },
  };

  const statusOptions = [
    {
      value: 'todo',
      label: 'To Do',
      icon: <Circle className="w-3 h-3 text-zinc-500" />,
      buttonClass:
        'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 font-medium',
    },
    {
      value: 'in_progress',
      label: 'In Progress',
      icon: <Clock className="w-3 h-3 text-blue-500" />,
      buttonClass:
        'bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900 font-medium',
    },
    {
      value: 'done',
      label: 'Done',
      icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" />,
      buttonClass:
        'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900 font-medium',
    },
  ];

  const pConfig = priorityConfig[task.priority] || priorityConfig.medium;
  const assignee = members.find((m) => (m.uid || m.id) === task.assigneeId);

  return (
    <div
      draggable={canChangeStatus}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`p-4 rounded-2xl border transition-all duration-200 space-y-3 shadow-2xs group relative select-none ${
        canChangeStatus ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5' : 'cursor-default'
      } ${
        isDragging
          ? 'opacity-40 scale-95 border-dashed border-zinc-400 dark:border-zinc-500 shadow-none'
          : overdue
          ? 'bg-rose-50/30 dark:bg-rose-950/15 border-rose-200/80 dark:border-rose-900/40 hover:border-rose-300'
          : 'bg-white dark:bg-zinc-900 border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm'
      }`}
    >
      {/* Top Header: Drag Handle + Priority Badge + Overdue Alert + Quick Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {canChangeStatus && (
            <span
              className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400 dark:group-hover:text-zinc-400 transition-colors"
              title="اسحب لتغيير الحالة (Drag & Drop)"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${pConfig.className}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
            <span>{pConfig.label}</span>
          </span>

          {overdue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-3 h-3" />
              <span>متأخرة</span>
            </span>
          )}
        </div>

        {/* Edit / Delete Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="تعديل المهمة"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.projectId, task.id)}
              className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="حذف المهمة"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Title & Description */}
      <div className="space-y-1">
        {projectName && (
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
            <FolderKanban className="w-2.5 h-2.5 text-zinc-400" />
            <span className="truncate max-w-[150px]">{projectName}</span>
          </div>
        )}
        <h4
          className={`text-xs sm:text-sm font-bold leading-snug line-clamp-2 ${
            task.status === 'done'
              ? 'line-through text-zinc-400 dark:text-zinc-500'
              : 'text-zinc-900 dark:text-zinc-100'
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Card Footer: Due Date & Assignee & Status Change */}
      <div className="pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2 flex-wrap">
          {task.dueDate && (
            <span
              className={`inline-flex items-center gap-1 ${
                overdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
          )}

          {assignee && (
            <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 font-medium">
              <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-700 text-[9px] flex items-center justify-center font-bold">
                {assignee.displayName?.[0]?.toUpperCase() || 'U'}
              </span>
              <span className="truncate max-w-[70px]">{assignee.displayName}</span>
            </span>
          )}
        </div>

        {/* Change status menu */}
        <CustomSelect
          value={task.status}
          onChange={(newStatus) => onStatusChange(task.projectId, task.id, newStatus)}
          options={statusOptions}
          size="sm"
          disabled={!canChangeStatus}
        />
      </div>
    </div>
  );
}
