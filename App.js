import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import useLoadFonts from './src/hooks/useLoadFonts';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './navigations/RootNavigator';
import LogoutConfirmation from './src/components/LogoutConfirmation';
import PreferencesScreen from './src/screens/PreferencesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import FailedScreen from './src/screens/FailedScreen';
import ReportIncidentScreen from './src/screens/ReportIncidentScreen';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import React, { useContext } from 'react';

const AppContent = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <NavigationContainer>
      <RootNavigator />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </NavigationContainer>
  );
};

export default function App() {
  const fontsLoaded = useLoadFonts();
  if (!fontsLoaded) {
    return null; // Prevents rendering until fonts load
  }
  return (
    <AuthProvider>
      <ThemeProvider> 
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
});
