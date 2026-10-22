import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Bell,
  Check,
  X,
  FolderKanban,
  Loader2,
  Sparkles,
  Inbox,
  UserCheck,
  Calendar,
} from 'lucide-react';
import DataContext from '../../context/DataContext/DataContext';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function NotificationsBell() {
  const { invitations = [], acceptInvitation, declineInvitation } = useContext(DataContext);
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const popoverRef = useRef(null);
  const triggerRef = useRef(null);

  const pendingCount = invitations.length;

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAccept = async (invitation) => {
    setProcessingId(invitation.id);
    setActionType('accept');
    try {
      await acceptInvitation(invitation);
      setFeedbackMsg({ type: 'success', text: t('inviteAcceptedSuccess') });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'فشل قبول الدعوة' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  const handleDecline = async (invitation) => {
    setProcessingId(invitation.id);
    setActionType('decline');
    try {
      await declineInvitation(invitation);
      setFeedbackMsg({ type: 'info', text: t('inviteDeclinedSuccess') });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'فشل رفض الدعوة' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    } finally {
      setProcessingId(null);
      setActionType(null);
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-9 h-9 rounded-2xl border transition-all cursor-pointer relative flex items-center justify-center ${
          isOpen
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-sm'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
        }`}
        title={t('notificationsTitle')}
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white dark:ring-zinc-950 shadow-sm animate-pulse">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {/* Modern Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute top-full mt-3 w-84 sm:w-96 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${
            isRTL ? 'start-0 sm:start-auto sm:end-0' : 'end-0 sm:end-auto sm:start-0'
          }`}
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/30">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                  {t('notificationsTitle')}
                </h3>
                <span className="text-[10px] text-zinc-400">
                  {pendingCount > 0 ? `${pendingCount} دعوة بانتظار ردك` : 'محدث الآن'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div
              className={`px-4 py-2.5 text-xs text-center font-medium border-b flex items-center justify-center gap-1.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900'
                  : feedbackMsg.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
              }`}
            >
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Notifications Items */}
          <div className="max-h-84 overflow-y-auto p-3 space-y-2.5">
            {pendingCount > 0 ? (
              invitations.map((inv) => {
                const isItemProcessing = processingId === inv.id;

                return (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80 space-y-3 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FolderKanban className="w-4 h-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {inv.projectName}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex-shrink-0">
                            دعوة انضمام
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                          دعاك{' '}
                          <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                            {inv.ownerName || inv.ownerEmail}
                          </strong>{' '}
                          للانضمام إلى هذا المشروع كعضو ومساهمة في تنفيذ المهام.
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/60 dark:border-zinc-800/60">
                      <button
                        type="button"
                        disabled={isItemProcessing}
                        onClick={() => handleAccept(inv)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {isItemProcessing && actionType === 'accept' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('accepting')}</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{t('acceptInvite')}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isItemProcessing}
                        onClick={() => handleDecline(inv)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-200/80 hover:bg-rose-50 hover:text-rose-700 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                      >
                        {isItemProcessing && actionType === 'decline' ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>{t('declining')}</span>
                          </>
                        ) : (
                          <>
                            <X className="w-3.5 h-3.5" />
                            <span>{t('declineInvite')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 text-center space-y-2 text-zinc-400">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 text-zinc-400 mx-auto flex items-center justify-center">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {t('noNotifications')}
                </p>
                <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                  ستظهر هنا فوراً كافة دعوات المشاريع والتنبيهات الموجهة إليك.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
