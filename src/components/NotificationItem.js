import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationItem = ({ item, backgroundColor, borderColor, textColor, timeColor }) => {  // <-- Added closing '}) => {'

  return (
    <TouchableOpacity>
      <View style={[
        styles.notifContainer, 
        { 
          backgroundColor,
          borderBottomColor: borderColor || 'transparent'
        }
      ]}>
        <Image 
          source={item.image} 
          style={styles.fireIcon}
        />
        <View style={styles.details}>
          <Text style={[styles.heading, { color: textColor }]}>{item.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -5 }}>
            <Ionicons 
              name="location-outline" 
              size={17} 
              color={textColor} 
            />
            <Text style={[styles.location, { color: textColor }]}>
              {item.location}
            </Text>
          </View>
          <Text style={[styles.status, { color: textColor }]}>
            {item.status}
          </Text>
        </View>
        <Text style={[styles.time, { color: timeColor }]}>
          {item.time}
        </Text>
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
    backgroundColor: 'white',
    padding: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  fireIcon: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  details: {
    gap: 4,
    alignItems: 'flex-start',
  },
  heading: {
    fontFamily: 'Montserrat-Bold',
    fontSize: 12,
  },
  location: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
  status: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
  time: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
    alignSelf: 'center',
    position: 'absolute',
    right: 15,
  },
});
