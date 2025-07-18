import { StyleSheet, Text, TouchableOpacity, View,ScrollView,Alert, Modal } from 'react-native'
import React, {useState} from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SettingsOption from '../../components/SettingsOption';
import CustomButton from '../../components/CustomButton'
import PrivacyScreen from '../PrivacyScreen';
import ReportBugScreen from '../ReportBug';
import LogoutConfirmation from '../../components/LogoutConfirmation'
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import ConfirmDeleteModal from '../../modals/ConfirmDeleteModal';

const SettingsScreen = ({ navigation }) => {
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

 const handleLogoutPress = () => {
    setLogoutModalVisible(true); 
  };

  const handleCancelLogout = () => {
    setLogoutModalVisible(false);
  };

  const handleConfirmLogout = () => {
    setLogoutModalVisible(false); 
    Alert.alert('Logged Out', 'You have been logged out.'); 
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen' }],
    });
    };


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action is permanent.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => setShowDeleteModal(true),
          style: 'destructive',
        },
      ]
    );
  };

  const handleConfirmDelete = async (password) => {
    setIsDeleting(true);
    
    try {
      // Replace with your actual API call
      const success = await deleteAccountAPI(password);
      
      if (success) {
        Alert.alert(
          'Account Deleted',
          'Your account has been permanently removed.',
          [
            { 
              text: 'OK', 
              onPress: () => navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }]
              })
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Invalid password or deletion failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during deletion');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Mock API function - replace with real implementation
  const deleteAccountAPI = async (password) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(password.length > 5); // Simple mock validation
      }, 1500);
    });
  };
  return (
    <View style={styles.mainContainer}>
     <View intensity={100} tint="light" style={styles.headerContainer}>  
        <Text style={styles.settingsText}>Settings</Text>
     </View>

  <ScrollView contentContainerStyle={styles.scrollContent}>
     <Text style ={styles.sectionName}>GENERAL</Text>
         <SettingsOption iconName="person-outline" label="Account" onPress={() => navigation.navigate('EditProfileScreen')} />  
         <SettingsOption iconName="lock-closed-outline" label="Privacy" onPress={() => navigation.navigate('PrivacyScreen')} />
             <SettingsOption iconName="options-outline" label="Preferences" onPress={() => navigation.navigate('PreferencesScreen')}  />
         <SettingsOption iconName="information-circle-outline" label="About Us" onPress={() => navigation.navigate('AboutUsScreen')}  />
         <SettingsOption iconName="trash-outline" label="Delete Account" onPress={handleDeletePress} />
   
    <Text style ={styles.sectionName}>FEEDBACK</Text>
        <SettingsOption iconName="warning-outline" label="Report a bug" onPress={() => navigation.navigate('ReportBugScreen')} />
        <SettingsOption iconName="share-outline" label="Send Feedback" onPress={() => {}}/>
        
        
       <TouchableOpacity 
               style={styles.logoutContainer} 
               activeOpacity={0.7}
               onPress={handleLogoutPress} 
             >
               <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      </ScrollView>

      <LogoutConfirmation
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
         onConfirm={handleConfirmLogout} 
      />

      <ConfirmDeleteModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </View>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        width:'100%',
        backgroundColor:'white'
    },
    headerContainer: {
      height: '15%',
      backgroundColor: '#Add8e6',
      borderRadius:20,
      elevation:5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
      
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
    },
    logoutContainer:{
      width:'90%',
      height: '7%',
      borderWidth:1,
      borderRadius:10,
      borderColor:'red',
      alignItems:'center',
      justifyContent:'center',
      fontFamily:'Montserrat-Regular',
      backgroundColor:'white',
      alignSelf:'center',
       position:'absolute',
        bottom:60
      
    },
    logoutText:{
      fontSize:18,
        fontFamily:'Montserrat-Regular',
        color:'red',
       
    },
    scrollContent:{
      height:'100%'
    },
     modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
  }
})