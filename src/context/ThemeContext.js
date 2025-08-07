// context/ThemeContext.js
import React, { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

// Create context with default values to prevent undefined errors
export const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
  isAutoMode: true,
  setIsAutoMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  // Default to system preference, but allow manual override
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const initialTheme = Appearance.getColorScheme();
    console.log('Initial system theme:', initialTheme);
    return initialTheme === 'dark';
  });
    const [isAutoMode, setIsAutoMode] = useState(true); // Track if using system theme

  // Log initialization
  console.log('ThemeProvider initializing with isDarkMode:', isDarkMode);

  // Update theme when system preference changes (only in auto mode)
  useEffect(() => {
    if (!isAutoMode) return; // Skip if manual mode
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('System theme changed to:', colorScheme);
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, [isAutoMode]);

  // Manual toggle
  const toggleTheme = (manualValue) => {
    console.log('Toggling theme to:', manualValue ?? !isDarkMode);
    setIsAutoMode(false); // Disable auto mode
    setIsDarkMode(manualValue ?? !isDarkMode); // Accepts explicit boolean
  };

  // Ensure context value is always defined
  const contextValue = {
    isDarkMode,
    toggleTheme,
    isAutoMode,
    setIsAutoMode,
  };

  console.log('ThemeProvider rendering with contextValue:', contextValue);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};