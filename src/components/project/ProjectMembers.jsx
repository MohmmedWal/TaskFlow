import React, { useState } from 'react';
import { Users, UserPlus, X, Shield, Mail, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function ProjectMembers({
  members = [],
  pendingInvitations = [],
  ownerId,
  isOwner = false,
  membersLoading = false,
  onSendInvitation,
  onCancelInvitation,
  onRemoveMember,
}) {
  const { t } = useLanguage();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (!newMemberEmail.trim()) return;

    setActionLoading(true);
    try {
      if (onSendInvitation) {
        await onSendInvitation(newMemberEmail.trim());
      }
      setSuccessMessage(t('inviteSentSuccess'));
      setNewMemberEmail('');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'فشل إرسال الدعوة.');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (memberUid) => {
    if (!window.confirm(t('removeMemberConfirm'))) return;
    setErrorMessage('');
    setActionLoading(true);
    try {
      await onRemoveMember(memberUid);
    } catch (err) {
      setErrorMessage(err.message || 'فشلت إزالة العضو.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelInvite = async (invitationId) => {
    if (!window.confirm('هل أنت متأكد من إلغاء هذه الدعوة؟')) return;
    setErrorMessage('');
    setActionLoading(true);
    try {
      if (onCancelInvitation) {
        await onCancelInvitation(invitationId);
      }
      setSuccessMessage(t('inviteCancelledSuccess'));
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'فشل إلغاء الدعوة.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t('teamMembers')} ({members.length})
            </h3>
            <p className="text-[11px] text-zinc-400">
              {t('teamMembersSubtitle')}
            </p>
          </div>
        </div>
        {membersLoading && (
          <span className="text-[10px] text-zinc-400 animate-pulse">جاري التحديث...</span>
        )}
      </div>

      {/* Add member / Send Invitation Form (Owner only) */}
      {isOwner && (
        <form onSubmit={handleFormSubmit} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="w-3.5 h-3.5 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                placeholder={t('inviteMemberPlaceholder')}
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                disabled={actionLoading}
                className="w-full pr-9 pl-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold rounded-2xl transition-all disabled:opacity-50 cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{actionLoading ? t('inviting') : t('inviteMemberBtn')}</span>
            </button>
          </div>

          {/* Messages */}
          {errorMessage && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </p>
          )}

          {successMessage && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium px-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{successMessage}</span>
            </p>
          )}
        </form>
      )}

      {/* Active Members list */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
          الأعضاء الفعليين في المشروع ({members.length})
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const isMemberOwner = m.uid === ownerId;
            const initial = m.displayName?.[0]?.toUpperCase() || m.email?.[0]?.toUpperCase() || 'U';

            return (
              <div
                key={m.uid || m.id}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-[11px] flex items-center justify-center font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
                  {initial}
                </div>

                <div className="leading-tight min-w-0">
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold block truncate max-w-[130px]">
                    {m.displayName || m.email}
                  </span>
                  <span className="text-[10px] text-zinc-400 block truncate max-w-[130px]">
                    {isMemberOwner ? t('projectOwner') : m.email}
                  </span>
                </div>

                {isOwner && !isMemberOwner && (
                  <button
                    type="button"
                    onClick={() => handleRemove(m.uid)}
                    disabled={actionLoading}
                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 mr-0.5 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={t('removeMemberConfirm')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section (Owner only or if any pending) */}
      {pendingInvitations.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{t('pendingInvitationsTitle')} ({pendingInvitations.length})</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {pendingInvitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl text-xs"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-[10px] flex items-center justify-center font-bold text-amber-800 dark:text-amber-300">
                  {inv.targetName?.[0]?.toUpperCase() || inv.targetEmail?.[0]?.toUpperCase() || '?'}
                </div>

                <div className="leading-tight min-w-0">
                  <span className="text-zinc-900 dark:text-zinc-100 font-medium block truncate max-w-[120px]">
                    {inv.targetName || inv.targetEmail}
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <span>{t('pendingStatusBadge')}</span>
                  </span>
                </div>

                {isOwner && (
                  <button
                    type="button"
                    onClick={() => handleCancelInvite(inv.id)}
                    disabled={actionLoading}
                    className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 mr-0.5 p-1 rounded-lg hover:bg-rose-100/50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title={t('cancelInviteBtn')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
