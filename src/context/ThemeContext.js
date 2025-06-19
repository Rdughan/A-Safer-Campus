// context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Default to system preference, but allow manual override
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [isAutoMode, setIsAutoMode] = useState(true); // Track if using system theme

  // Update theme when system preference changes (only in auto mode)
  useEffect(() => {
    if (!isAutoMode) return; // Skip if manual mode
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, [isAutoMode]);

  // Manual toggle
  const toggleTheme = (manualValue) => {
    setIsAutoMode(false); // Disable auto mode
    setIsDarkMode(manualValue ?? !isDarkMode); // Accepts explicit boolean
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isAutoMode, setIsAutoMode }}>
      {children}
    </ThemeContext.Provider>
  );
};