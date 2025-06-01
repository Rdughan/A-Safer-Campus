import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AboutUsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Us</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image / Logo */}
        <Image
          source={require('./media/illustration.png')} // Use your own image here
          style={styles.image}
          resizeMode="contain"
        />

        {/* Description */}
        <Text style={styles.title}>Campus Safety First</Text>
        <Text style={styles.description}>
          Our app is designed to help students stay safe by identifying crime hotspots on campus in real-time.
          Users can report incidents, view risky areas, and receive alerts about nearby danger zones.
        </Text>

        <Text style={styles.description}>
          Whether you're walking to class, heading home at night, or exploring campus, we're here to help you stay informed and safe.
        </Text>

        <Text style={styles.description}>
          Built by students, for students — because safety shouldn't be a guessing game.
        </Text>

        {/* Optional Additional Info */}
        <Text style={styles.subheading}>Features:</Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.bullet}>• Real-time crime reports from students</Text>
          <Text style={styles.bullet}>• Highlighted danger zones on campus</Text>
          <Text style={styles.bullet}>• Custom alerts and preferences</Text>
          <Text style={styles.bullet}>• Easy reporting and anonymous tips</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    backgroundColor: '#ADD8E6',
    paddingTop: 90,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 10,
    color: 'black',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: 'black',
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
    color: '#000',
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 12,
    color: '#555',
  },
  subheading: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  bulletContainer: {
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 6,
    color: '#444',
  },
});

export default AboutUsScreen;
