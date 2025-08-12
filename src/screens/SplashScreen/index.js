import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {Image} from 'react-native'
import { useTheme } from '../../hooks/useTheme';

const SplashScreen = () => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
          <Image 
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }} 
        style={styles.logo} 
      />
      <Text style={[styles.logoName, { color: theme.primary }]}>SaferCampus</Text>
      <Text style={[styles.waitText, { color: theme.text }]}>Please wait...</Text>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        width:'100%',
        alignItems:'center',
        justifyContent:'center'
    },
    logoName:{
        fontSize:20,
        fontFamily:'Montserrat-Bold',
        
        
    },
    logo: {
        width: 150,  
        height: 150, 
      },
      waitText:{
        position:'absolute',
        bottom:'10%'
      }

})