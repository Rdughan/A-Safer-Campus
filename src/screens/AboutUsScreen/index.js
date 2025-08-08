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
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';

const AboutUsScreen = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const colors = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
     
      <View style={[styles.headerContainer,{ backgroundColor: isDarkMode ? '#239DD6' : '#ADD8E6' }
]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} style={[styles.backIcon, { color: colors.text }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Us</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image / Logo */}
        <Image
          source={require('./media/illustration.png')} 
          style={styles.image}
          resizeMode="contain"
        />

        {/* Description */}
        <Text style={[styles.title, { color: colors.text }]}>Campus Safety First</Text>
        <Text style={[styles.description, { color: colors.text }]}>
          Our app is designed to help students stay safe by identifying crime hotspots on campus in real-time.
          Users can report incidents, view risky areas, and receive alerts about nearby danger zones.
        </Text>

        <Text style={[styles.description, { color: colors.text }]}>
          Whether you're walking to class, heading home at night, or exploring campus, we're here to help you stay informed and safe.
        </Text>

        <Text style={[styles.description, { color: colors.text }]}>
          Built by students, for students — because safety shouldn't be a guessing game.
        </Text>

        {/* Optional Additional Info */}
        <Text style={[styles.subheading, { color: colors.text }]}>Features:</Text>
        <View style={styles.bulletContainer}>
          <Text style={[styles.bullet, { color: colors.text }]}>• Real-time crime reports from students</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Highlighted danger zones on campus</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Custom alerts and preferences</Text>
          <Text style={[styles.bullet, { color: colors.text }]}>• Easy reporting and anonymous tips</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 60,
   
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      borderRadius:20,
      height:'15%'
  },
  backIcon: {
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
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
  },
  description: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 20,
    marginBottom: 10,
  },
  bulletContainer: {
    paddingLeft: 10,
  },
  bullet: {
    fontSize: 15,
    fontFamily: 'Montserrat-Regular',
    marginBottom: 6,
  },
});

export default AboutUsScreen;
