import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../src/screens/SplashScreen';
import OnboardingScreen1 from '../src/screens/OnboardingScreen1';
import OnboardingScreen2 from '../src/screens/OnboardingScreen2';
import LoginScreen from '../src/screens/LoginScreen';
import TabNavigator from './TabNavigator';
import HomeScreen from '../src/screens/HomeScreen';
import SignUpScreen from '../src/screens/SignUpScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsSplashVisible(false);
    }, 2000); // show splash for 2 seconds
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isSplashVisible ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : (
        <>
          <Stack.Screen name="OnboardingScreen1" component={OnboardingScreen1} />
          <Stack.Screen name="OnboardingScreen2" component={OnboardingScreen2} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
           <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
        </>
      )}
      
    </Stack.Navigator>
  );
}
