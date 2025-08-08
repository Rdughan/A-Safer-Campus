import { StyleSheet, Text, View, FlatList } from 'react-native';
import React, { useContext } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationItem from '../../components/NotificationItem';
import { NotificationData } from '../../components/Data/NotificationData.js';
import { BlurView } from 'expo-blur';
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes.js';

const NotificationsScreen = ({ navigation }) => {
  const themeContext = useContext(ThemeContext);
  
  // Handle case where context isn't available
  if (!themeContext) {
    console.error("ThemeContext is not available");
    return (
      <View style={styles.fallbackContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const { isDarkMode } = themeContext;
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#239DD6' : '#ADD8E6' }]}>
        <Text style={[styles.notificationsText, { color: theme.text }]}>
          Notifications
        </Text>
      </View>

      <FlatList
        data={NotificationData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            backgroundColor={isDarkMode ? '#2a2a2a' : '#E6E7E8'}
            textColor={theme.text}
            timeColor={isDarkMode ? '#fff' : theme.secondaryText}
          />
        )}
        contentContainerStyle={{ 
          paddingBottom: 30, 
          marginTop: 140,
          backgroundColor: theme.background 
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    height: '15%',
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    marginBottom:'20%'
  },
  notificationsText: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    left: 20,
    top: 70,
  },
});

export default NotificationsScreen;