import { StyleSheet, Text, View } from 'react-native'
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
        backgroundColor:'white',
        flex:1,
        width:'100%',
        alignItems:'center',
        justifyContent:'center'
    },
    logoName:{
        color:'#239DD6',
        fontSize:20,
        fontFamily:'Montserrat-Bold',
        
        
    },
    logo: {
        width: 150,  
        height: 150, 
      },
      waitText:{
        color:'black',
        position:'absolute',
        bottom:'10%'
      }

})