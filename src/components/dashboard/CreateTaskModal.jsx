import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckSquare, Circle, Clock, CheckCircle2, Flag } from 'lucide-react';
import { validateTask, hasErrors } from '../../lib/validation';
import { LIMITS } from '../../lib/constants';
import { timestampToIsoDate } from '../../lib/dates';
import CustomSelect from '../common/CustomSelect';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  selectedProjectId = '',
  members = [],
  initialData = null,
  title,
}) {
  const { t } = useLanguage();
  const [taskTitle, setTaskTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const modalTitle = title || (initialData ? t('editTaskTitle') : t('createTaskTitle'));

  useEffect(() => {
    if (initialData) {
      setTaskTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setPriority(initialData.priority || 'medium');
      setStatus(initialData.status || 'todo');
      setProjectId(initialData.projectId || selectedProjectId || '');
      setAssigneeId(initialData.assigneeId || '');
      setDueDate(timestampToIsoDate(initialData.dueDate) || '');
    } else {
      setTaskTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('todo');
      setProjectId(selectedProjectId || projects[0]?.id || '');
      setAssigneeId('');
      setDueDate('');
    }
    setErrorMessage('');
  }, [initialData, selectedProjectId, projects, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const targetProjectId = projectId || selectedProjectId;
    if (!targetProjectId) {
      setErrorMessage('يرجى اختيار مشروع تابع لهذه المهمة.');
      return;
    }

    const taskInput = {
      title: taskTitle,
      description,
      priority,
      status,
      projectId: targetProjectId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    };

    const errors = validateTask(taskInput);
    if (hasErrors(errors)) {
      setErrorMessage(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit(taskInput);
      onClose();
    } catch (error) {
      setErrorMessage(error.message || 'حدث خطأ أثناء حفظ المهمة.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-start max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{modalTitle}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Select project if not predetermined */}
          {!selectedProjectId && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                المشروع التابع له
              </label>
              <CustomSelect
                value={projectId}
                onChange={setProjectId}
                disabled={isSaving || !!initialData}
                placeholder="-- اختر مشروعاً --"
                className="w-full"
                buttonClassName="w-full justify-between py-2.5 px-3.5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                options={projects.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
              <label>عنوان المهمة</label>
              <span className="text-[10px] text-zinc-400">
                {taskTitle.length} / {LIMITS.taskTitle.max}
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="مثال: إعداد واجهة تسجيل الدخول"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              maxLength={LIMITS.taskTitle.max}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
              <label>الوصف (اختياري)</label>
              <span className="text-[10px] text-zinc-400">
                {description.length} / {LIMITS.description.max}
              </span>
            </div>
            <textarea
              rows="2"
              placeholder="تفاصيل إضافية لتوضيح متطلبات المهمة..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={LIMITS.description.max}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                الحالة
              </label>
              <CustomSelect
                value={status}
                onChange={setStatus}
                disabled={isSaving}
                className="w-full"
                buttonClassName="w-full justify-between py-2 px-3 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                options={[
                  { value: 'todo', label: 'To Do', icon: <Circle className="w-3 h-3 text-zinc-500" /> },
                  { value: 'in_progress', label: 'In Progress', icon: <Clock className="w-3 h-3 text-blue-500" /> },
                  { value: 'done', label: 'Done', icon: <CheckCircle2 className="w-3 h-3 text-emerald-500" /> },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                الأولوية
              </label>
              <CustomSelect
                value={priority}
                onChange={setPriority}
                disabled={isSaving}
                className="w-full"
                buttonClassName="w-full justify-between py-2 px-3 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                options={[
                  { value: 'low', label: 'منخفضة (Low)', icon: <Flag className="w-3 h-3 text-zinc-400" /> },
                  { value: 'medium', label: 'متوسطة (Medium)', icon: <Flag className="w-3 h-3 text-amber-500" /> },
                  { value: 'high', label: 'عالية (High)', icon: <Flag className="w-3 h-3 text-rose-500" /> },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                تاريخ الاستحقاق
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isSaving}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
              />
            </div>
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                إسناد المهمة إلى عضو
              </label>
              <CustomSelect
                value={assigneeId}
                onChange={setAssigneeId}
                disabled={isSaving}
                className="w-full"
                buttonClassName="w-full justify-between py-2.5 px-3.5 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                options={[
                  { value: '', label: 'غير مسندة (Unassigned)' },
                  ...members.map((m) => ({
                    value: m.uid || m.id,
                    label: `${m.displayName} (${m.email})`,
                  })),
                ]}
              />
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
