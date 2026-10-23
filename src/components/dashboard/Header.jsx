import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Sun, Moon, Globe, ArrowLeftRight, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext/ThemeContext';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';
import AuthContext from '../../context/AuthContext/AuthContext';
import NotificationsBell from '../common/NotificationsBell';
import AccountSwitcherModal from '../auth/AccountSwitcherModal';

export default function Header({
  title,
  onNewProjectClick,
  searchTerm,
  setSearchTerm,
  onToggleMobileMenu,
}) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const { user, savedAccounts = [], switchAccount, removeSavedAccount, logout } = useContext(AuthContext);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      <div className="flex items-center gap-2.5">
        {/* Mobile Menu Toggle Button */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            title="القائمة الجانبية"
            aria-label="Toggle Mobile Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <h1 className="text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate max-w-[150px] sm:max-w-none">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Search Input */}
        {setSearchTerm && (
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-zinc-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-36 md:w-56 ps-9 pe-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition-all"
            />
          </div>
        )}

        {/* Switch Account Quick Action Button */}
        <button
          type="button"
          onClick={() => setIsAccountModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
          title="تبديل الحساب (Switch Account)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden lg:inline text-[11px] font-bold">تبديل الحساب</span>
          {savedAccounts.length > 1 && (
            <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold flex items-center justify-center">
              {savedAccounts.length}
            </span>
          )}
        </button>

        {/* Language Switcher */}
        <button
          onClick={toggleLanguage}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
          title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          aria-label="Toggle Language"
        >
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[11px] font-bold hidden sm:inline">
            {language === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>

        {/* Notifications Bell */}
        <NotificationsBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          title={theme === 'dark' ? t('themeToggleLight') : t('themeToggleDark')}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* New Project Action Button */}
        {onNewProjectClick && (
          <button
            onClick={onNewProjectClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('newProject')}</span>
          </button>
        )}
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={user}
        savedAccounts={savedAccounts}
        onSwitchAccount={async (account) => {
          try {
            const res = await switchAccount(account);
            if (res?.redirect) {
              navigate(`/login?email=${encodeURIComponent(res.email)}`);
            } else {
              navigate('/dashboard');
            }
          } catch (err) {
            console.error('Account switch failed:', err);
          }
        }}
        onRemoveAccount={removeSavedAccount}
        onAddNewAccount={() => {
          setIsAccountModalOpen(false);
          logout();
          navigate('/login');
        }}
      />
    </header>
  );
}
