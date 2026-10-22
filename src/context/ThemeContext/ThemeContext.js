import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
  accentColor: 'zinc',
  setAccentColor: () => {},
  fontFamily: 'tajawal',
  setFontFamily: () => {},
  fontSize: 'md',
  setFontSize: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
