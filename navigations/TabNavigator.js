import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../src/screens/HomeScreen'
import SettingsScreen from '../src/screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationsScreen from '../src/screens/NotificationsScreen';
import ReportIncidentScreen from '../src/screens/ReportIncidentScreen';
import RoleBasedDashboard from '../src/screens/RoleBasedDashboard';
import { useTheme } from '../src/hooks/useTheme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Dashboard') iconName = 'grid-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else if (route.name === 'ReportIncident') iconName = 'megaphone-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: isDarkMode ? '#888' : '#666',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Montserrat-Regular', 
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Dashboard" component={RoleBasedDashboard} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="ReportIncident" component={ReportIncidentScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
