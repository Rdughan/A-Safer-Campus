import { StyleSheet, Text, View, TouchableOpacity, FlatList, Image } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationItem from '../../components/NotificationItem';
import { NotificationData } from '../../components/Data/NotificationData.js';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const NotificationsScreen = ({ navigation }) => {
  return (
    <View style={styles.mainContainer}>
      <View intensity={100} tint="light" style={styles.headerContainer}>
        <View style={{ flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.notificationsText}>Notifications</Text>
        </View>
      </View>
      <FlatList
        data={NotificationData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={{ paddingBottom: 30, marginTop: 20 }}
      />
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  headerContainer: {
    backgroundColor: '#Add8e6',
    height: '15%',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  backArrow: {
    fontSize: 25,
    color: 'black',
    left: 20,
    top: 50,
  },
  notificationsText: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    left: 20,
    top: 70,
  },
  abstractImage: {
    height: 350,
    width: 350,
    position: 'absolute',
    resizeMode: 'contain',
  },
});