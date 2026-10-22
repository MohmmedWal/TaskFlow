import React, { useState, useEffect } from 'react';
import ThemeContext from './ThemeContext';

export function ThemeProvider({ children }) {
  // 1. Dark / Light Theme
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('taskflow_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'dark';
    }
  });

  // 2. Accent Color Theme: 'zinc' | 'blue' | 'emerald' | 'violet' | 'amber' | 'rose'
  const [accentColor, setAccentColor] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_accent_color');
      if (['zinc', 'blue', 'emerald', 'violet', 'amber', 'rose'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'zinc';
  });

  // 3. Font Family: 'tajawal' | 'cairo' | 'inter'
  const [fontFamily, setFontFamily] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_font_family');
      if (['tajawal', 'cairo', 'inter'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'tajawal';
  });

  // 4. Font Size: 'sm' | 'md' | 'lg'
  const [fontSize, setFontSize] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow_font_size');
      if (['sm', 'md', 'lg'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'md';
  });

  // Apply Theme & Classes to Root Document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('taskflow_theme', theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage', e);
    }
  }, [theme]);

  // Apply Accent Color to Root Document
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accent = accentColor;
    try {
      localStorage.setItem('taskflow_accent_color', accentColor);
    } catch (e) {
      console.warn('Unable to persist accent color to localStorage', e);
    }
  }, [accentColor]);

  // Apply Font Family to Root Document
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.font = fontFamily;
    try {
      localStorage.setItem('taskflow_font_family', fontFamily);
    } catch (e) {
      console.warn('Unable to persist font family to localStorage', e);
    }
  }, [fontFamily]);

  // Apply Font Size to Root Document
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.size = fontSize;
    try {
      localStorage.setItem('taskflow_font_size', fontSize);
    } catch (e) {
      console.warn('Unable to persist font size to localStorage', e);
    }
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
        fontFamily,
        setFontFamily,
        fontSize,
        setFontSize,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
