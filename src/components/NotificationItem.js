import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';

const NotificationItem = ({ item }) => {
  const { theme, isDarkMode } = useTheme();
  
  // Enhanced color scheme for better contrast
  const getStatusColor = (status) => {
    if (!status || typeof status !== 'string') {
      return isDarkMode ? '#239DD6' : '#239DD6'; // Default blue for invalid status
    }
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('fire') || statusLower.includes('outbreak')) {
      return isDarkMode ? '#FF6B6B' : '#FF4444'; // Red for fire/emergency
    } else if (statusLower.includes('arrested') || statusLower.includes('failed')) {
      return isDarkMode ? '#4ECDC4' : '#00C851'; // Green for resolved/safe
    } else if (statusLower.includes('missing') || statusLower.includes('alert')) {
      return isDarkMode ? '#FFD93D' : '#FF9800'; // Orange/Yellow for alerts
    } else {
      return isDarkMode ? '#239DD6' : '#239DD6'; // Default blue
    }
  };
  
  // Get priority color based on priority level
  const getPriorityColor = (priority) => {
    if (!priority || typeof priority !== 'string') {
      return isDarkMode ? '#239DD6' : '#239DD6'; // Default blue for invalid priority
    }
    
    switch (priority.toLowerCase()) {
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
        { backgroundColor: getPriorityColor(item.priority) }
      ]} />
      
      <Image 
        source={item.image || require('./notifScreenMedia/fire.png')} 
        style={styles.fireIcon}
      />
      <View style={styles.details}>
        <View style={styles.headerRow}>
          <Text style={[styles.heading, { color: theme.text }]} numberOfLines={2}>
            {item.title || 'Unknown Notification'}
          </Text>
          <Text style={[styles.time, { color: isDarkMode ? '#888' : '#666' }]}>{item.time || 'Unknown Time'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -5 }}>
          <Ionicons 
            name="location-outline" 
            size={17} 
            color={isDarkMode ? '#239DD6' : '#239DD6'} 
          />
          <Text style={[styles.location, { color: isDarkMode ? '#CCCCCC' : '#666666' }]}>{item.location || 'Unknown Location'}</Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status || 'Unknown Status'}</Text>
      </View>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  heading: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginRight: 8,
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
    marginLeft: 8,
    opacity: 0.8,
  },
});
