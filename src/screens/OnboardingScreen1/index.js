 import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React from 'react';

const OnboardingScreen1 = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.logoName}>SaferCampus</Text>
        <Text style={styles.slogan}>Making campus safe for all</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.circle}></View>
        <Image
          source={require('./media/handImage.png')}
          style={styles.handimage}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.info}>
          All official danger alerts on campus are coming directly to you
        </Text>

        <TouchableOpacity
          style={styles.nextContainer}
          activeOpacity={0.7}
          onPress={() => {
            // Navigate to the next onboarding screen
            navigation.navigate('Onboarding2'); // This should match your screen name in App.js
          }}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen1;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFDFF',
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  logoName: {
    fontSize: 20,
    color: '#239DD6',
    fontFamily: 'Montserrat-Regular',
  },
  headerContainer: {
    flex: 1,
    alignItems: 'center',
    top: '7%',
  },
  slogan: {
    fontFamily: 'Montserrat-Variable',
    color: 'black',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    top: -200,
  },
  circle: {
    width: 700,
    height: 700,
    backgroundColor: '#239DD6',
    borderRadius: 700,
    position: 'relative',
    right: '-60%',
    top: '-24%',
  },
  handimage: {
    width: '110%',
    height: '110%',
    position: 'absolute',
    top: -85,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: 'white',
    height: '27%',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    padding: 15,
  },
  nextContainer: {
    backgroundColor: '#239DD6',
    color: 'white',
    width: '60%',
    height: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    bottom: 40,
    position: 'absolute',
  },
  nextText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
  },
  info: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 24,
    textAlign: 'center',
    top: '10%',
  },
});
