import { createContext, useContext } from 'react';

export const LanguageContext = createContext({
  language: 'ar',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isRTL: true,
  dir: 'rtl',
  t: (key) => key,
});

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;

