import React, { useState, useContext, useEffect } from 'react';
import {
  Settings,
  User,
  Sun,
  Moon,
  Globe,
  Bell,
  Check,
  CheckCircle2,
  Palette,
  Type,
  Volume2,
  Maximize2,
  Save,
  Loader2,
} from 'lucide-react';
import AuthContext from '../../context/AuthContext/AuthContext';
import { useTheme } from '../../context/ThemeContext/ThemeContext';
import { useLanguage } from '../../context/LanguageContext/LanguageContext';
import { playAppSound } from '../../lib/audio';

export default function SettingsView({ currentUser }) {
  const { updateUserProfile } = useContext(AuthContext);
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
  } = useTheme();
  const { language, setLanguage, toggleLanguage, t, isRTL } = useLanguage();

  const [displayNameInput, setDisplayNameInput] = useState(currentUser?.displayName || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Persistent workflow preferences
  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_user_prefs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      soundEffects: true,
      compactMode: false,
    };
  });

  // Apply compact mode to document root
  useEffect(() => {
    document.documentElement.dataset.compact = prefs.compactMode ? 'true' : 'false';
  }, [prefs.compactMode]);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayNameInput(currentUser.displayName);
    }
  }, [currentUser?.displayName]);

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    if (!displayNameInput.trim()) {
      triggerToast(t('nameRequired'));
      return;
    }
    setIsSavingName(true);
    try {
      if (updateUserProfile) {
        await updateUserProfile({ displayName: displayNameInput.trim() });
      }
      playAppSound('success');
      triggerToast(t('profileUpdatedSuccess'));
    } catch (err) {
      console.error('Failed to update profile name:', err);
      triggerToast(err.message || 'Error updating profile');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    playAppSound('action');
    const langName = newLang === 'ar' ? 'العربية' : 'English';
    triggerToast(t('langSwitchedSuccess', { lang: langName }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    playAppSound('action');
    triggerToast(t('themeSwitchedSuccess'));
  };

  const handleAccentChange = (colorKey) => {
    setAccentColor(colorKey);
    playAppSound('action');
    triggerToast('تم تحديث ثيم اللون بنجاح!');
  };

  const handleFontChange = (fontKey) => {
    setFontFamily(fontKey);
    playAppSound('action');
    triggerToast('تم تطبيق نوع الخط المفضل بنجاح!');
  };

  const handleSizeChange = (sizeKey) => {
    setFontSize(sizeKey);
    playAppSound('action');
    triggerToast('تم تعديل حجم الخط العام!');
  };

  const handleTogglePref = (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      localStorage.setItem('taskflow_user_prefs', JSON.stringify(updated));
    } catch {}
    if (key === 'soundEffects' && updated.soundEffects) {
      playAppSound('success');
    } else {
      playAppSound('action');
    }
    triggerToast(t('prefsUpdatedSuccess'));
  };

  const userInitial =
    currentUser?.displayName?.[0]?.toUpperCase() ||
    currentUser?.email?.[0]?.toUpperCase() ||
    'U';

  // Accent color themes configuration
  const colorThemes = [
    { id: 'zinc', name: t('accentZinc'), color: '#18181b', ring: 'ring-zinc-900 dark:ring-zinc-100' },
    { id: 'blue', name: t('accentBlue'), color: '#2563eb', ring: 'ring-blue-600' },
    { id: 'emerald', name: t('accentEmerald'), color: '#059669', ring: 'ring-emerald-600' },
    { id: 'violet', name: t('accentViolet'), color: '#7c3aed', ring: 'ring-violet-600' },
    { id: 'amber', name: t('accentAmber'), color: '#d97706', ring: 'ring-amber-600' },
    { id: 'rose', name: t('accentRose'), color: '#e11d48', ring: 'ring-rose-600' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16 animate-in fade-in-50 duration-200">
      {/* Toast Notification Floating Banner */}
      {showToast && (
        <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xl border border-zinc-700 dark:border-zinc-300 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
              <Settings className="w-4 h-4" />
            </div>
            <span>{t('settingsTitle')}</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t('settingsSubtitle')}
          </p>
        </div>

        {/* Quick Language shortcut pill */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs font-semibold cursor-pointer shadow-2xs"
            title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-zinc-400" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* 1. APPEARANCE & THEMES (FRONT & CENTER AT THE TOP) */}
      <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t('sectionAppearance')}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('sectionAppearanceDesc')}
          </p>
        </div>

        {/* Light / Dark Mode Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Light Theme Card */}
          <div
            onClick={() => handleThemeChange('light')}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              theme === 'light'
                ? 'bg-zinc-50 border-zinc-900 ring-2 ring-zinc-900/20 shadow-sm'
                : 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('themeLight')}
                </span>
                {theme === 'light' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-900 bg-zinc-200 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-zinc-900" />
                    <span>{t('activeBadge')}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {t('themeLightDesc')}
              </p>
            </div>
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => handleThemeChange('dark')}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              theme === 'dark'
                ? 'bg-zinc-950 border-zinc-100 ring-2 ring-zinc-100/30 shadow-sm'
                : 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-950/60 text-indigo-400 border border-indigo-900 flex items-center justify-center flex-shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('themeDark')}
                </span>
                {theme === 'dark' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-zinc-100" />
                    <span>{t('activeBadge')}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {t('themeDarkDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Color Themes (6 Distinct Color Palettes) */}
        <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {t('sectionColors')}
            </h4>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            {t('sectionColorsDesc')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
            {colorThemes.map((item) => {
              const isSelected = accentColor === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAccentChange(item.id)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center cursor-pointer select-none ${
                    isSelected
                      ? `bg-zinc-50 dark:bg-zinc-800/80 border-zinc-900 dark:border-zinc-100 ring-2 ${item.ring} shadow-xs`
                      : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs transition-transform hover:scale-105"
                    style={{ backgroundColor: item.color }}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Typography: Font Family & Font Size */}
        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-zinc-500" />
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {t('sectionTypography')}
            </h4>
          </div>

          {/* Font Family Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
              {t('fontFamilyLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'tajawal', name: 'تجوال (Tajawal)', sample: 'تصميم أنيق ومرن للمهام' },
                { id: 'cairo', name: 'كايرو (Cairo)', sample: 'خط عريض وواضح جداً' },
                { id: 'inter', name: 'إنتر (Inter / System)', sample: 'Clean modern system UI' },
              ].map((font) => {
                const isSelected = fontFamily === font.id;
                return (
                  <div
                    key={font.id}
                    onClick={() => handleFontChange(font.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1 select-none ${
                      isSelected
                        ? 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20 dark:ring-zinc-100/20 shadow-xs'
                        : 'bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                        {font.name}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
                    </div>
                    <span className="text-[11px] text-zinc-400 mt-1">{font.sample}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Font Size Scale */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
              {t('fontSizeLabel')}
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              {[
                { id: 'sm', label: t('sizeSm') },
                { id: 'md', label: t('sizeMd') },
                { id: 'lg', label: t('sizeLg') },
              ].map((size) => {
                const isSelected = fontSize === size.id;
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => handleSizeChange(size.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs'
                        : 'bg-white dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    {size.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. LANGUAGE SELECTION */}
      <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t('sectionLanguage')}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('sectionLanguageDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div
            onClick={() => handleLanguageChange('ar')}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              language === 'ar'
                ? 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20 dark:ring-zinc-100/20 shadow-sm'
                : 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center flex-shrink-0 border border-emerald-200 dark:border-emerald-800">
              ض
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('arabicLang')}
                </span>
                {language === 'ar' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('activeBadge')}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {t('arabicLangDesc')}
              </p>
            </div>
          </div>

          <div
            onClick={() => handleLanguageChange('en')}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              language === 'en'
                ? 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900/20 dark:ring-zinc-100/20 shadow-sm'
                : 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-blue-200 dark:border-blue-800">
              EN
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t('englishLang')}
                </span>
                {language === 'en' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{t('activeBadge')}</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {t('englishLangDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PREFERENCES */}
      <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t('sectionPreferences')}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            تفضيلات التفاعل الصوتي ووضع العرض
          </p>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {/* Sound / UI Effects Toggle */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  {t('soundEffectsTitle')}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  تشغيل رنين تفاعلي خفيف عند إتمام المهام والإجراءات
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTogglePref('soundEffects')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                prefs.soundEffects ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  prefs.soundEffects ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Compact Density Toggle */}
          <div className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <Maximize2 className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  {t('compactModeTitle')}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  تقليص هوامش البطاقات والصفوف لعرض أكبر قدر من المعلومات
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTogglePref('compactMode')}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer flex-shrink-0 ${
                prefs.compactMode ? 'bg-zinc-900 dark:bg-zinc-100' : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-900 transition-transform ${
                  prefs.compactMode ? (isRTL ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* 4. USER PROFILE DETAILS */}
      <section className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {t('sectionProfile')}
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {t('sectionProfileDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/70 dark:border-zinc-800/80">
          <div className="w-11 h-11 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {currentUser?.displayName || 'مستخدم مسجل'}
            </p>
            <p className="text-[11px] text-zinc-400 font-mono truncate">
              {currentUser?.email}
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
          <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
            {t('editProfileTitle')}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 max-w-xl">
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              placeholder={t('displayNamePlaceholder')}
              className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:border-zinc-500 dark:focus:border-zinc-500 transition-all font-medium"
            />
            <button
              type="submit"
              disabled={isSavingName}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSavingName ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t('savingChanges')}</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{t('saveChanges')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
