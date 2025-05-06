import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import useLoadFonts from './src/hooks/useLoadFonts';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import SettingsScreen from './src/screens/SettingsScreen';

export default function App() {
  const fontsLoaded = useLoadFonts();
  if (!fontsLoaded) {
    return null; // Prevents rendering until fonts load
  }
  return (
    <View style={styles.container}>
     <SettingsScreen/>
      <StatusBar style="auto" />
    </View>
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
