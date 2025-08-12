import { StyleSheet, Text, View, TouchableOpacity,FlatList,Image } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationItem from '../../components/NotificationItem';
import {NotificationData} from '../../components/Data/NotificationData.js'
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';

const NotificationsScreen = ({navigation}) => {
  const { theme, isDarkMode } = useTheme();
  
  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <View intensity={100} tint="light" style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#239DD6' : '#Add8e6' }]}>
            

                
                 <View style={{flexDirection:'row' , gap:7, alignItems:'center', justifyContent:'c'}}>
                 
                  <Text style={[styles.notificationsText, { color: theme.text }]}>Notifications</Text>
                  </View>
          </View>

        <FlatList
            data={NotificationData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NotificationItem item={item} />}
            contentContainerStyle={{ paddingBottom: 30, marginTop:20}}
        />
    </View>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        width:'100%',
    },
     headerContainer:{
        height:'15%', 
        borderRadius:20,
         elevation:5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        
    },
    backArrow:{
       fontSize:25,
         left:20,
         top:50,
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