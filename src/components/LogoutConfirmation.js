import { StyleSheet, Text, View, Image, Modal } from 'react-native';
import React, {useState} from 'react';
import CustomButton from './CustomButton';

const LogoutConfirmation = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <Image source={require('./logoutMedia/logoutIcon.png')} style={styles.logoutIcon} />
          <Text style={styles.question}>Are You Sure You Want To Logout?</Text>
          <Text style={styles.subQuestion}>
            You can log in to your account anytime. Do you still want to logout?
          </Text>
          
          <CustomButton
            buttonText="Logout"
            backgroundColor="transparent"
            textColor="black"
            borderWidth={1}
            borderColor={'#239DD6'}
            onPress={onConfirm}
          />
          <CustomButton buttonText="Cancel" backgroundColor="#239DD6" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
};


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