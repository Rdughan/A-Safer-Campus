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
      <BlurView 
        intensity={100} 
        tint={isDarkMode ? 'dark' : 'light'} 
        style={[
          styles.headerContainer, 
          { 
            backgroundColor: isDarkMode ? '#1a1a1a' : '#ADD8E6',
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.notificationsText, { color: theme.text }]}>
            Notifications
          </Text>
        </View>
      </BlurView>

      <FlatList
        data={NotificationData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            backgroundColor={theme.cardBackground}
            textColor={theme.text}
            timeColor={theme.secondaryText}
          />
        )}
        contentContainerStyle={{ 
          paddingBottom: 30, 
          marginTop: 20,
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
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingLeft: 20,
    overflow: 'hidden', // Important for BlurView on Android
  },
  headerContent: {
    flexDirection: 'row', 
    gap: 7, 
    alignItems: 'center', 
    
  },
  notificationsText: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
});

export default NotificationsScreen;