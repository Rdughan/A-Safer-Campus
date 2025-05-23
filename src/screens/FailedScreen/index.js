import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const FailedScreen = () => {
  return (
    <View style ={styles.mainContainer}>
              <Image 
                       source={require('./media/failImage.png')} 
                       style={styles.image}
                     />
                  <Text style={styles.text}>Failed!</Text>
        </View>
  )
}

export default FailedScreen

const styles = StyleSheet.create({
    mainContainer:{
        backgroundColor:'white',
        flex:1,
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
    },
     image: {
        width: 170,  
        height: 170, 
        resizeMode:'contain'      
      },
       text:{
        color:'#239DD6',
        fontSize:30,
        fontFamily:'Montserrat-Bold',    
    },
})