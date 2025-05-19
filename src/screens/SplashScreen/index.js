/*import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Image} from 'react-native'

const SplashScreen = () => {
  return (
    <View style={styles.container}>
          <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }} 
        style={styles.logo} 
      />
      <Text style={styles.logoName}>SaferCampus</Text>
      <Text style ={styles.waitText}>Please wait...</Text>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container:{
        backgroundColor:'#239DD6',
        flex:1,
        width:'100%',
        alignItems:'center',
        justifyContent:'center'
    },
    logoName:{
        color:'white',
        fontSize:20,
        fontFamily:'Montserrat-Regular',
        
        
    },
    logo: {
        width: 150,  // Adjust width
        height: 150, // Adjust height
        
      },
      waitText:{
        color:'white',
        position:'absolute',
        bottom:10
      }

})*/

import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect } from 'react';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding1'); // Change to Home if you prefer
    }, 2000); // 2 seconds

    return () => clearTimeout(timer); // Cleanup
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }} 
        style={styles.logo} 
      />
      <Text style={styles.logoName}>SaferCampus</Text>
      <Text style={styles.waitText}>Please wait...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#239DD6',
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoName: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Montserrat-Regular',
  },
  logo: {
    width: 150,
    height: 150,
  },
  waitText: {
    color: 'white',
    position: 'absolute',
    bottom: 10
  }
});
