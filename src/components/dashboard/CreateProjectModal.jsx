import React, { useState, useEffect } from 'react';
import { X, AlertCircle, FolderPlus } from 'lucide-react';
import { validateProject, hasErrors } from '../../lib/validation';
import { LIMITS } from '../../lib/constants';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title,
}) {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const modalTitle = title || (initialData ? t('editProjectTitle') : t('createProjectTitle'));

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const errors = validateProject({ name, description });
    if (hasErrors(errors)) {
      setErrorMessage(Object.values(errors)[0]);
      return;
    }

    setIsSaving(true);
    try {
      await onSubmit({ name, description });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      setErrorMessage(error.message || 'حدث خطأ أثناء حفظ المشروع.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-start transition-all transform scale-100">
        <div className="flex justify-between items-center pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
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
          <div>
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
              <label>{t('projectNameLabel')}</label>
              <span className="text-[10px] text-zinc-400">
                {name.length} / {LIMITS.projectName.max}
              </span>
            </div>
            <input
              type="text"
              required
              placeholder={t('projectNamePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={LIMITS.projectName.max}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 mb-1.5 font-medium">
              <label>{t('projectDescLabel')}</label>
              <span className="text-[10px] text-zinc-400">
                {description.length} / {LIMITS.description.max}
              </span>
            </div>
            <textarea
              rows="3"
              placeholder={t('projectDescPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={LIMITS.description.max}
              disabled={isSaving}
              className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 resize-none transition-colors"
            />
          </div>

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
