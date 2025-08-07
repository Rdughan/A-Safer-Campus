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
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';
import React, { useContext } from 'react';
import themes from './src/styles/themes';

const AppContent = ({ isLoggedIn }) => {
  const themeContext = useContext(ThemeContext);
  
  // Handle case where context isn't available
  if (!themeContext) {
    console.error("ThemeContext is not available in AppContent");
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  const { isDarkMode } = themeContext;
  
  console.log('ThemeContext is working, isDarkMode:', isDarkMode);
  
  return (
    <NavigationContainer>
      <RootNavigator isLoggedIn={isLoggedIn} />
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </NavigationContainer>
  );
};

export default function App() {
  const fontsLoaded = useLoadFonts();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false); // Example state for login

  if (!fontsLoaded) {
    return null; // Prevents rendering until fonts load
  }

  // If the user is logged in, apply the theme provider
  return (
    <>
      {isLoggedIn ? (
        <ThemeProvider> {/* Only wrap the main screens with ThemeProvider */}
          <AppContent isLoggedIn={isLoggedIn} />
        </ThemeProvider>
      ) : (
        <AppContent isLoggedIn={isLoggedIn} /> // Onboarding and Login screens without theme context
      )}
    </>
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
