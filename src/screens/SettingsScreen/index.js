import { StyleSheet, Text, TouchableOpacity, View,ScrollView } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsOption from '../../components/SettingsOption';
import CustomButton from '../../components/CustomButton';

const SettingsScreen = () => {
  return (
    <View style={styles.mainContainer}>
     <View style ={styles.headerContainer}>
           <TouchableOpacity>
                <Ionicons name="arrow-back" size={20} color="black" style ={styles.backArrow} />
            </TouchableOpacity>
            <Text style={styles.settingsText}>Settings</Text>
     </View >

  <ScrollView contentContainerStyle={styles.scrollContent}>
     <Text style ={styles.sectionName}>GENERAL</Text>
         <SettingsOption iconName="person-outline" label="Account" onPress={() => {}} />  
        {/* <SettingsOption iconName="lock-closed-outline" label="Privacy" onPress={() => {}} />  */}
         <SettingsOption iconName="lock-closed-outline" label="Privacy" onPress={() => {}} />
         <SettingsOption iconName="notifications-outline" label="Notifications" onPress={() => {}}  />
             <SettingsOption iconName="options-outline" label="Preferences" onPress={() => {}}  />
         <SettingsOption iconName="information-circle-outline" label="About Us" onPress={() => {}} />
         <SettingsOption iconName="trash-outline" label="Delete Account" onPress={() => {}} />
   
    <Text style ={styles.sectionName}>FEEDBACK</Text>
        <SettingsOption iconName="warning-outline" label="Report a bug" onPress={() => {}} />
        <SettingsOption iconName="share-outline" label="Send Feedback" onPress={() => {}}/>
        
        <CustomButton 
        buttonText="Logout"
        backgroundColor="transparent" 
        textColor = 'red'
        borderWidth={2}
        borderColor={'red'} 
        bottom={-50}
        fontFamily={'Montserrat-Bold'}
      />
      </ScrollView>
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        backgroundColor:'white',
        width:'100%'
    },
    headerContainer:{
        backgroundColor:'#Add8e6',
        height:'17%', 
    },
    backArrow:{
       fontSize:25,
         color:'black',
         left:20,
         top:50,
    },
    settingsText:{ 
      fontSize:30,
      fontFamily:'Montserrat-Bold',
      left:20,
      top:70,
    },
    sectionName:{
        fontFamily:'Montserrat-Regular',
        marginVertical:20,
        left: 20,
        fontSize:17,
        fontVariant:'200'
    },
    optionsView:{
        flexDirection:'row',
        alignItems:'center',
        left:40,
        gap:15,
        width:'80%',
         borderBottomWidth:0.6,
         paddingVertical: 16,
        
    },
    optionsName:{
        fontSize:18,
        fontFamily:'Montserrat-Regular',
        color:'#888'
    },
    optionsArrow:{
        marginLeft:'60%',  
    }
})