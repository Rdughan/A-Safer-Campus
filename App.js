/*import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator} from '@react-navigation/stack';


import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import useLoadFonts from './src/hooks/useLoadFonts';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import SettingsScreen from './src/screens/SettingsScreen';


const Stack = createStackNavigator();


export default function App() {
  const fontsLoaded = useLoadFonts();
  if (!fontsLoaded) {
    return null; // Prevents rendering until fonts load
  }
  /*return (
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
  
});*/


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import useLoadFonts from './src/hooks/useLoadFonts';
import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen1 from './src/screens/OnboardingScreen1';
import OnboardingScreen2 from './src/screens/OnboardingScreen2';
import SettingsScreen from './src/screens/SettingsScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import SafetyTipsScreen from './src/screens/SafetyTipsScreen';

const Stack = createStackNavigator();

export default function App() {
  const fontsLoaded = useLoadFonts();
  
  if (!fontsLoaded) {
    return null; // Prevents rendering until fonts load
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding1" component={OnboardingScreen1} />
        <Stack.Screen name="Onboarding2" component={OnboardingScreen2} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen 
          name="Emergency" 
          component={EmergencyScreen} 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#d32f2f' },
            headerTintColor: '#fff'
          }}
        />
        <Stack.Screen 
          name="SafetyTips" 
          component={SafetyTipsScreen} 
          options={{ 
            headerShown: true,
            headerStyle: { backgroundColor: '#2e7d32' },
            headerTintColor: '#fff'
          }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
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