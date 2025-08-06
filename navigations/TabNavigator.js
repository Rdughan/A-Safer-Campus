import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../src/screens/HomeScreen'
import SettingsScreen from '../src/screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationsScreen from '../src/screens/NotificationsScreen';
import ReportIncidentScreen from '../src/screens/ReportIncidentScreen';
import { ThemeContext } from '../src/context/ThemeContext'

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'Notifications') iconName = 'notifications-outline';
          else if (route.name === 'ReportIncident') iconName = 'megaphone-outline';
          else if (route.name === 'Settings') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#239DD6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
        fontFamily: 'Montserrat-Regular', 
        fontSize: 11,
      },
      tabBarStyle: {
        backgroundColor: isDarkMode ? '#1a1a1a' : 'white',
        borderTopColor: isDarkMode ? '#333' : '#f0f0f0',
      },


      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="ReportIncident" component={ReportIncidentScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
