import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LanguageContext from './LanguageContext';
import { translations } from '../../lib/translations';

const STORAGE_KEY = 'taskflow_language';

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'ar') return saved;
    } catch {
      // Fallback
    }
    return 'ar';
  });

  const isRTL = language === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  // Keep DOM dir and lang attributes in sync
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language to localStorage:', e);
    }
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const setLanguage = useCallback((lang) => {
    if (lang === 'ar' || lang === 'en') {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const t = useCallback(
    (key, params = {}) => {
      const langDict = translations[language] || translations.ar;
      let text = langDict[key] ?? translations.ar[key] ?? key;

      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([pKey, pVal]) => {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal));
        });
      }
      return text;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      isRTL,
      dir,
      t,
    }),
    [language, setLanguage, toggleLanguage, isRTL, dir, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;

