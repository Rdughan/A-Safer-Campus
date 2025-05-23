import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../src/screens/HomeScreen'
import SettingsScreen from '../src/screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationsScreen from '../src/screens/NotificationsScreen';
const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
        fontFamily: 'Montserrat-Regular', 
        fontSize: 11,
      },

      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
