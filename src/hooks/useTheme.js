// hooks/useTheme.js
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../styles/themes';

export const useTheme = () => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  return { theme, isDarkMode, toggleTheme };
};