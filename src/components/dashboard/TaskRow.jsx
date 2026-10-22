import React from 'react';
import { Calendar, User, Pencil, Trash2, AlertCircle, CheckCircle2, Clock, Circle } from 'lucide-react';
import { isOverdue, formatDate } from '../../lib/dates';
import { PRIORITY_LABELS, STATUS_LABELS } from '../../lib/constants';
import CustomSelect from '../common/CustomSelect';

export default function TaskRow({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  members = [],
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
}) {
  const overdue = isOverdue(task);

  const priorityConfig = {
    high: {
      label: PRIORITY_LABELS.high,
      className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/50',
      dot: 'bg-rose-500',
    },
    medium: {
      label: PRIORITY_LABELS.medium,
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
      dot: 'bg-amber-500',
    },
    low: {
      label: PRIORITY_LABELS.low,
      className: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
      dot: 'bg-zinc-400',
    },
  };

  const statusConfig = {
    todo: {
      label: STATUS_LABELS.todo,
      icon: Circle,
      className: 'text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900',
    },
    in_progress: {
      label: STATUS_LABELS.in_progress,
      icon: Clock,
      className: 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30',
    },
    done: {
      label: STATUS_LABELS.done,
      icon: CheckCircle2,
      className: 'text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30',
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
  const sStyle = statusConfig[task.status] || statusConfig.todo;
  const assignee = members.find((m) => (m.uid || m.id) === task.assigneeId);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 gap-3 ${
        overdue
          ? 'bg-rose-50/40 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/40 hover:border-rose-300 dark:hover:border-rose-800'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm'
      }`}
    >
      {/* Right side: Status dropdown + Title + Meta */}
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <CustomSelect
          value={task.status}
          onChange={(newStatus) => onStatusChange(task.projectId, task.id, newStatus)}
          options={statusOptions}
          size="sm"
          disabled={!canChangeStatus}
        />

        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-xs sm:text-sm font-semibold truncate ${
                task.status === 'done'
                  ? 'line-through text-zinc-400 dark:text-zinc-500'
                  : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              {task.title}
            </h4>

            {overdue && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-3 h-3" />
                <span>متأخرة</span>
              </span>
            )}

            {task.projectName && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-medium">
                {task.projectName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400 flex-wrap">
            {task.description && (
              <span className="line-clamp-1 max-w-xs">{task.description}</span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-zinc-400" />
              <span>{formatDate(task.dueDate)}</span>
            </span>
            {assignee ? (
              <span className="flex items-center gap-1 font-medium text-zinc-700 dark:text-zinc-300">
                <User className="w-3 h-3 text-zinc-400" />
                <span>{assignee.displayName}</span>
              </span>
            ) : task.assigneeId ? (
              <span className="text-zinc-400">مسندة</span>
            ) : (
              <span className="text-zinc-400">غير مسندة</span>
            )}
          </div>
        </div>
      </div>

      {/* Left side: Priority pill + Actions */}
      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border ${pConfig.className}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
          {pConfig.label}
        </span>

        {canEdit && onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="تعديل المهمة"
            aria-label="Edit Task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}

        {canDelete && onDelete && (
          <button
            onClick={() => {
              if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
                onDelete(task.projectId, task.id);
              }
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="حذف المهمة"
            aria-label="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
