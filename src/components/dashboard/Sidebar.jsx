import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Settings,
  LogOut,
  Layers,
  User as UserIcon,
  ArrowLeftRight,
  ChevronUp,
  MoreVertical,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';
import AuthContext from '../../context/AuthContext/AuthContext';
import AccountSwitcherModal from '../auth/AccountSwitcherModal';

export default function Sidebar({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { savedAccounts = [], switchAccount, removeSavedAccount } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  const navItems = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'projects', label: t('navProjects'), icon: FolderKanban },
    { id: 'tasks', label: t('navTasks'), icon: CheckSquare },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const userInitial =
    currentUser?.displayName?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    'U';

  const userDisplayName = currentUser?.displayName || t('registeredUser');

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      const timer = setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isMenuOpen]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-white dark:bg-zinc-950 border-inline-end border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-4 transition-all duration-300 select-none flex-shrink-0 z-50 md:z-30 ${
          isMobileOpen
            ? 'start-0 shadow-2xl translate-x-0'
            : '-translate-x-full rtl:translate-x-full md:translate-x-0 rtl:md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-sm flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  {t('appName')}
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t('appTagline')}
                </p>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title="إغلاق القائمة"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white dark:text-zinc-950'
                        : 'text-zinc-400 dark:text-zinc-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

      {/* User Profile & Settings Dropdown Footer */}
      <div className="relative pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        {/* Floating Dropdown Menu (Pops Upwards) */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-full mb-3 inset-x-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md"
          >
            {/* User Info Header inside Dropdown */}
            <div className="px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {userDisplayName}
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate font-mono">
                    {currentUser?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-zinc-200/50 dark:border-zinc-700/50 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('activeNow')}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1 space-y-0.5">
              {/* Settings Option */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('settings');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-start"
              >
                <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>{t('navSettings')}</span>
              </button>

              {/* Switch Account Option */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsAccountModalOpen(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-start"
              >
                <ArrowLeftRight className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span>{t('switchAccount')}</span>
              </button>
            </div>

            <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-1" />

            {/* Logout Option */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-start"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        )}

        {/* User / Settings Circle Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          className={`w-full flex items-center gap-3 p-2 rounded-2xl transition-all cursor-pointer border text-start ${
            isMenuOpen
              ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 shadow-sm'
              : 'border-transparent hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60'
          }`}
          title={t('accountMenu')}
          aria-expanded={isMenuOpen}
        >
          {/* Settings Circle & Avatar combined */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold flex items-center justify-center text-xs shadow-2xs">
              {userInitial}
            </div>
            {/* Small circular settings badge attached */}
            <span
              className={`absolute -bottom-0.5 -end-0.5 w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-zinc-950 transition-colors ${
                isMenuOpen
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Settings className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {userDisplayName}
            </p>
            <p className="text-[11px] text-zinc-400 truncate font-mono">
              {currentUser?.email}
            </p>
          </div>

          {/* Upward Chevron Indicator */}
          <ChevronUp
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
              isMenuOpen ? 'rotate-180 text-zinc-700 dark:text-zinc-200' : ''
            }`}
          />
        </button>
      </div>

      {/* Account Switcher Modal */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        currentUser={currentUser}
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
          onLogout();
          navigate('/login');
        }}
      />
    </aside>
    </>
  );
}
