import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';

const NotificationItem = ({ item }) => {
  const { theme, isDarkMode } = useTheme();
  
  // Enhanced color scheme for better contrast
  const getStatusColor = (status) => {
    if (status.toLowerCase().includes('fire') || status.toLowerCase().includes('outbreak')) {
      return isDarkMode ? '#FF6B6B' : '#FF4444'; // Red for fire/emergency
    } else if (status.toLowerCase().includes('arrested') || status.toLowerCase().includes('failed')) {
      return isDarkMode ? '#4ECDC4' : '#00C851'; // Green for resolved/safe
    } else if (status.toLowerCase().includes('missing') || status.toLowerCase().includes('alert')) {
      return isDarkMode ? '#FFD93D' : '#FF9800'; // Orange/Yellow for alerts
    } else {
      return isDarkMode ? '#239DD6' : '#239DD6'; // Default blue
    }
  };
  
  // Get priority color based on title content
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff0000'; // High priority - red
      case 'medium':
        return '#ff6600'; // Medium priority - orange
      case 'low':
        return isDarkMode ? '#239DD6' : '#239DD6'; // Low priority - blue
      default:
        return isDarkMode ? '#239DD6' : '#239DD6'; // Default blue
    }
  };
  
  return (
    <TouchableOpacity activeOpacity={0.8}>
    <View style={[
      styles.notifContainer, 
      { 
        backgroundColor: isDarkMode ? '#2A2A2A' : 'white',
        shadowColor: isDarkMode ? '#000' : '#000',
        borderColor: theme.border,
        borderWidth: isDarkMode ? 1 : 0,
      }
    ]}>
      {/* Priority indicator line */}
      <View style={[
        styles.priorityIndicator,
        { backgroundColor: getPriorityColor(item.title) }
      ]} />
      
      <Image 
        source={item.image} 
        style={styles.fireIcon}
      />
      <View style={styles.details}>
        <Text style={[styles.heading, { color: theme.text }]}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -5 }}>
          <Ionicons 
            name="location-outline" 
            size={17} 
            color={isDarkMode ? '#239DD6' : '#239DD6'} 
          />
          <Text style={[styles.location, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>{item.location}</Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
      </View>
      <Text style={[styles.time, { color: isDarkMode ? '#888' : '#666' }]}>{item.time}</Text>
    </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

const styles = StyleSheet.create({
  notifContainer: {
    marginHorizontal: 10,
    borderRadius: 15,
    marginVertical: 10,
    padding: 15,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    position: 'relative',
  },
  priorityIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  fireIcon: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
    marginLeft: 8,
  },
  details: {
    gap: 6,
    alignItems: 'flex-start',
    flex: 1,
    marginLeft: 10,
  },
  heading: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    lineHeight: 18,
  },
  location: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  status: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  time: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 11,
    alignSelf: 'flex-start',
    position: 'absolute',
    right: 15,
    top: 15,
    opacity: 0.8,
  },
});
