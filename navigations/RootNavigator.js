import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../src/screens/SplashScreen';
import OnboardingScreen1 from '../src/screens/OnboardingScreen1';
import OnboardingScreen2 from '../src/screens/OnboardingScreen2';
import LoginScreen from '../src/screens/LoginScreen';
import TabNavigator from './TabNavigator';
import SignUpScreen from '../src/screens/SignUpScreen';
import EditProfileScreen from '../src/screens/EditProfileScreen';
import PreferencesScreen from '../src/screens/PreferencesScreen'
import PrivacyScreen from '../src/screens/PrivacyScreen';
import AboutUsScreen from '../src/screens/AboutUsScreen';
import ReportBugScreen from '../src/screens/ReportBug';
import SafetyMapScreen from '../src/screens/SafetyMapScreen';



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
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
          <Stack.Screen name="PreferencesScreen" component={PreferencesScreen} />
          <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
          <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
          <Stack.Screen name="ReportBugScreen" component={ReportBugScreen} />
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="SafetyMap" component={SafetyMapScreen} />
        </>
      )}
      
    </Stack.Navigator>
  );
}
