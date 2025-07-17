
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../src/screens/HomeScreen'
import SettingsScreen from '../src/screens/SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationsScreen from '../src/screens/NotificationsScreen';
import ReportHistoryScreen from '../src/screens/ReportHistoryScreen';
import ReportStackNavigator from './ReportStackNavigator';
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
          else if (route.name === 'Reports') iconName = 'list-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#239DD6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarLabelStyle: {
        fontFamily: 'Montserrat-Regular', 
        fontSize: 11,
      },

      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Reports" component={ReportStackNavigator} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
