import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'
import CustomButton from './CustomButton'

const LogoutConfirmation = () => {
  return (
    <View style ={styles.container}>
    <View style={styles.mainContainer}>
       <Image 
                source={require('./logoutMedia/logoutIcon.png')} 
                style={styles.logoutIcon}
        />
      <Text style ={styles.question}>Are You Sure You Want To Logout?</Text>
      <Text style ={styles.subQuestion}>You can log in to your account anytime. Do you still want to logout?</Text>
      <CustomButton 
        buttonText="Cancel"
        backgroundColor="#239DD6" 
      />
      <CustomButton 
        buttonText="Logout"
        backgroundColor="transparent" 
        textColor = 'black'
        borderWidth={1}
        borderColor={'#239DD6'}
      />
    </View>
    </View>
  )
}

export default LogoutConfirmation

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'gray',
    opacity:0.9,
    zIndex:10
  },
  mainContainer:{
    backgroundColor:'white',
    height:'50%',
    width:'80%',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:20,
    padding:20,
    gap:5
  },
  question:{
    color:'black',
    fontFamily:'Montserrat-Bold',
    fontSize:20,
    textAlign:'center',
  },
  logoutIcon:{
      width:120,
      height:120,
      resizeMode:'contain',

    },
    subQuestion:{
      color:'black',
      fontFamily:'Montserrat-Regular',
      fontSize:14,
      textAlign:'center',
      padding:10

    }
})