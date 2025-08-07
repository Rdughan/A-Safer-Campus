// hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/themes';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  // Provide fallback values if context is not available
  const isDarkMode = context?.isDarkMode ?? false;
  const toggleTheme = context?.toggleTheme ?? (() => {
    console.warn('ThemeContext not available, toggleTheme called');
  });
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Log if context is not available
  if (!context) {
    console.warn('useTheme: ThemeContext is not available, using fallback values');
  }
  
  return { theme, isDarkMode, toggleTheme };
};