import { StyleSheet, Text, TouchableOpacity, View,ScrollView } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsOption from '../../components/SettingsOption';
import CustomButton from '../../components/CustomButton'
import PrivacyScreen from '../PrivacyScreen';
import ReportBugScreen from '../ReportBug';
import { useAuth } from '../../context/AuthContext';
import LoginScreen from '../LoginScreen';

const SettingsScreen = ({navigation}) => {
  return (
    <View style={styles.mainContainer}>
     <View style ={styles.headerContainer}>
           <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="black" style ={styles.backArrow} />
            </TouchableOpacity>
            <Text style={styles.settingsText}>Settings</Text>
     </View >

  <ScrollView contentContainerStyle={styles.scrollContent}>
     <Text style ={styles.sectionName}>GENERAL</Text>
         <SettingsOption iconName="person-outline" label="Account" onPress={() => navigation.navigate('EditProfileScreen')} />  
        {/* <SettingsOption iconName="lock-closed-outline" label="Privacy" onPress={() => {}} />  */}
         <SettingsOption iconName="lock-closed-outline" label="Privacy" onPress={() => navigation.navigate('PrivacyScreen')} />
             <SettingsOption iconName="options-outline" label="Preferences" onPress={() => navigation.navigate('PreferencesScreen')}  />
         <SettingsOption iconName="information-circle-outline" label="About Us" onPress={() => navigation.navigate('AboutUsScreen')}  />
         <SettingsOption iconName="trash-outline" label="Delete Account" onPress={() => {}} />
   
    <Text style ={styles.sectionName}>FEEDBACK</Text>
        <SettingsOption iconName="warning-outline" label="Report a bug" onPress={() => navigation.navigate('ReportBugScreen')} />
        <SettingsOption iconName="share-outline" label="Send Feedback" onPress={() => {}}/>
        
        
        <CustomButton 
        buttonText="Logout"
        backgroundColor="transparent" 
        textColor = 'red'
        borderWidth={2}
        borderColor={'red'} 
        bottom={-50}
        fontFamily={'Montserrat-Bold'}
        onPress={handleLogout}
      />
      
      </ScrollView>
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
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