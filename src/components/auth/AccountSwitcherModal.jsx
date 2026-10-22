import React from 'react';
import { ArrowLeftRight, UserCheck, Plus, Trash2, X, Check, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';

export default function AccountSwitcherModal({
  isOpen,
  onClose,
  currentUser,
  savedAccounts = [],
  onSwitchAccount,
  onRemoveAccount,
  onAddNewAccount,
}) {
  const { t, isRTL } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-sm">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                تبديل الحساب (Switch Account)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                الحسابات المحفوظة على هذا المتصفح ({savedAccounts.length})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            {savedAccounts.length > 1
              ? 'اختر الحساب الذي تريد التبديل إليه فوراً دون الحاجة لإعادة إدخال كلمة المرور:'
              : 'الحساب النشط حالياً على هذا المتصفح:'}
          </p>

          <div className="space-y-2.5">
            {savedAccounts.map((account) => {
              const isCurrent = account.uid === currentUser?.uid;
              const initial =
                account.displayName?.[0]?.toUpperCase() ||
                account.email?.[0]?.toUpperCase() ||
                'U';

              const isGoogle =
                account.provider?.includes('google') || account.email?.toLowerCase().includes('gmail');
              const isFacebook =
                account.provider?.includes('facebook') || account.email?.toLowerCase().includes('facebook');

              return (
                <div
                  key={account.uid}
                  onClick={() => {
                    if (!isCurrent) {
                      onSwitchAccount(account);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-2xs'
                      : 'bg-zinc-50/70 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-white dark:hover:bg-zinc-900 cursor-pointer shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl text-xs font-black flex items-center justify-center flex-shrink-0 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {initial}
                    </div>

                    <div className="leading-tight min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {account.displayName || account.email.split('@')[0]}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <Check className="w-3 h-3" />
                            <span>نشط الآن</span>
                          </span>
                        )}
                        {isGoogle && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                            Google
                          </span>
                        )}
                        {isFacebook && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900">
                            Facebook
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-400 font-mono block truncate mt-0.5">
                        {account.email}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this account */}
                  <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!isCurrent && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchAccount(account);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
                          title="التبديل إلى هذا الحساب فوراً"
                        >
                          <ArrowLeftRight className="w-3 h-3" />
                          <span>تبديل</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onRemoveAccount(account.uid)}
                          className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="حذف الحساب من هذا الجهاز"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Another Account Prompt */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddNewAccount();
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 text-xs font-bold transition-all cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل الدخول بحساب جديد لإضافته لهذا الجهاز</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <span>جلسات آمنة ومحفوظة محلياً</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
