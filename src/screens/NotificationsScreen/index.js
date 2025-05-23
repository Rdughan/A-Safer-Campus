import { StyleSheet, Text, View, TouchableOpacity,FlatList,Image } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationItem from '../../components/NotificationItem';
import {NotificationData} from '../../components/Data/NotificationData.js'

const NotificationsScreen = () => {
  return (
    <View style={styles.mainContainer}>
     <View style ={styles.headerContainer}>

        <Image 
                        source={require('./media/abstract.png')} 
                        style={styles.abstractImage}
                      />
                <TouchableOpacity>
                     <Ionicons name="arrow-back" size={20} color="black" style ={styles.backArrow} />
                 </TouchableOpacity>
                 <View style={{flexDirection:'row' , gap:7, alignItems:'center', justifyContent:'c'}}>
                   <Ionicons name="notifications-outline" size={34} color="black" style={styles.notifIcon} />
                  <Text style={styles.notificationsText}>Notifications</Text>
                  </View>
          </View >

        <FlatList
            data={NotificationData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NotificationItem item={item} />}
            contentContainerStyle={{ paddingBottom: 30 }}
        />
    </View>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        backgroundColor:'white',
        width:'100%',
    },
     headerContainer:{
        backgroundColor:'#Add8e6',
        height:'17%', 
        overflow: 'hidden'
    },
    backArrow:{
       fontSize:25,
         color:'black',
         left:20,
         top:50,
    },
    notifIcon:{
      left:20,
      top:70,
      // Optional shadow to "bolden" icon appearance
      textShadowColor: '#000',
      textShadowOffset: { width: 0.5, height: 0.5 },
      textShadowRadius: 1,
        },
        notificationsText:{ 
          fontSize:30,
          fontFamily:'Montserrat-Bold',
          left:20,
          top:70,
        },
     abstractImage:{
        height:350,
        width:350,
        position:'absolute',
        resizeMode: 'contain',
     },
   
   
  

    
})