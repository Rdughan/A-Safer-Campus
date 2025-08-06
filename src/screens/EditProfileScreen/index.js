import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Alert, TouchableWithoutFeedback, Platform } from 'react-native'
import React, { useState, useContext } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import InputField from '../../components/TextInput';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';

const EditProfileScreen = ({navigation}) => {

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [Phone, setPhone] = useState('');
    const [profilePicture, setProfilePicture] = useState(require('./media/pfp.png'));
    const [showFullScreenImage, setShowFullScreenImage] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const { isDarkMode } = useContext(ThemeContext);
    const colors = isDarkMode ? darkTheme : lightTheme;

    // Request camera permission
    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
    };

    // Request media library permission
    const requestMediaLibraryPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
    };

    const openCamera = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfilePicture({ uri: result.assets[0].uri });
                setShowImageOptions(false);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to open camera. Please try again.');
        }
    };

    const openGallery = async () => {
        const hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Media library permission is required to access photos.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setProfilePicture({ uri: result.assets[0].uri });
                setShowImageOptions(false);
            }
        } catch (error) {
            console.error('Gallery error:', error);
            Alert.alert('Error', 'Failed to open gallery. Please try again.');
        }
    };

    const showImageOptionsModal = () => {
        setShowImageOptions(true);
    };

    const handleViewProfilePicture = () => {
        setShowImageOptions(false);
        setShowFullScreenImage(true);
    };

    const handleGoBack = () => {
        setShowImageOptions(false);
        navigation.goBack();
    };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
         <TouchableOpacity style ={styles.arrow} onPress={() => navigation.goBack()}>    
            <Ionicons name="arrow-back" size={24} color={colors.text} />     
         </TouchableOpacity>

        <Text style={[styles.editProfileText, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity style={styles.checkmark} onPress={() => navigation.goBack()}>
            <Ionicons name="checkmark" size={30} color="#32CD32"  />   
        </TouchableOpacity>

      </View>

    <TouchableOpacity style={{height:100, width:100, alignSelf:'center' }} onPress={showImageOptionsModal}>
      <Image 
             source={profilePicture} 
             style={styles.pfp}   
        />
        <TouchableOpacity style={[styles.cameraIconContainer, { backgroundColor: colors.card }]} onPress={showImageOptionsModal}>
          <Ionicons name="camera" size={20} color={colors.text} />
        </TouchableOpacity>
    </TouchableOpacity>    
       

        <View style={styles.inputView}>
          <Text style={[styles.inputTitle, { color: colors.text }]}>Name</Text>
                <InputField placeholder="John Doe" iconName="email-outline" value={name} onChangeText={setName} style={styles.inputOverride}/>            
              <Text style={[styles.inputTitle, { color: colors.text }]}>Email Address</Text>
                <InputField placeholder="johndoe@gmail.com" iconName="email-outline" value={email} onChangeText={setEmail} style={styles.inputOverride}/>
                 <Text style={[styles.inputTitle, { color: colors.text }]}>Password</Text>
                <InputField placeholder="Password" iconName="key-outline" value={password} secureTextEntry={true} onChangeText={setPassword} style={styles.inputOverride} />
                  <Text style={[styles.inputTitle, { color: colors.text }]}>Phone Number</Text>
                 <InputField placeholder="0202222233" iconName="phone-outline" value={Phone} onChangeText={setPhone} style={styles.inputOverride} />
              </View>  

      {/* Image Options Modal */}
      <Modal transparent visible={showImageOptions} animationType="fade" onRequestClose={() => setShowImageOptions(false)}>
        <View style={[styles.confirmationContainer, { backgroundColor: colors.background, opacity: 0.9 }]}>
          <View style={[styles.confirmationMainContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="person-circle" size={120} color="#239DD6" style={styles.confirmationIcon} />
            <Text style={[styles.confirmationQuestion, { color: colors.text }]}>Profile Picture Options</Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleViewProfilePicture}>
              <Ionicons name="eye" size={24} color="#239DD6" />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>View Profile Picture</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={openCamera}>
              <Ionicons name="camera" size={24} color="#239DD6" />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={openGallery}>
              <Ionicons name="images" size={24} color="#239DD6" />
              <Text style={[styles.modalOptionText, { color: colors.text }]}>Choose from Gallery</Text>
            </TouchableOpacity>
           
            <TouchableOpacity 
              style={[styles.modalCancelButton, { backgroundColor: colors.card }]} 
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.goBackButton} 
              onPress={handleGoBack}
            >
              <Ionicons name="arrow-back" size={20} color="#6B7280" />
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full Screen Image Modal */}
      <Modal
        visible={showFullScreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullScreenImage(false)}
      >
        <View style={[styles.fullScreenContainer, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[styles.fullScreenBackButton, { backgroundColor: colors.card }]}
            onPress={() => setShowFullScreenImage(false)}
          >
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>
          
          <TouchableWithoutFeedback onPress={() => setShowFullScreenImage(false)}>
            <Image 
              source={profilePicture} 
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableWithoutFeedback>
        </View>
      </Modal>

    </View>
  )
}

export default EditProfileScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
    },
    headerContainer:{
        height:'14%',
        flexDirection:'row',  
        alignItems:'center',
        borderRadius:20,
        width:'100%',
        zIndex:100,
        marginBottom:25,
        paddingTop:20
      
    },
    arrow:{
    left:20,
    top:15, 
      
    },
    editProfileText:{
      left:'30%',
      top:15,
      textAlign:'center',
      position:'relative',
      fontSize:25,
      fontFamily:'Montserrat-Bold',
    },
    checkmark:{
        right:30,
        top:70,
        position:'absolute'
    },
    pfp:{
      height:100,
      width:100,
      borderRadius:50,
    },
    inputView:{
      gap:20,
      alignSelf:'center',
      marginTop:40
    },
    inputTitle:{
       fontSize:22,
      fontFamily:'Montserrat-Bold',
    },
     cameraIconContainer: {
    position: 'absolute',
    width:40,
    height:40,
    alignItems:'center',
    justifyContent:'center',
    borderRadius: 20,
    padding: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    right:0,
    bottom:0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  modalOptionText: {
    marginLeft: 10,
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    color: '#333',
  },
  modalCancelButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  modalCancelText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenBackButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    borderRadius: 25,
    padding: 10,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  goBackText: {
    marginLeft: 5,
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
    color: '#6B7280',
  },
  confirmationContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    zIndex:10
  },
  confirmationMainContainer:{
    backgroundColor:'white',
    height:'60%',
    width:'80%',
    alignSelf:'center',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:20,
    padding:20,
    gap:5
  },
  confirmationQuestion:{
    color:'black',
    fontFamily:'Montserrat-Bold',
    fontSize:20,
    textAlign:'center',
  },
  confirmationIcon:{
    width:120,
    height:120,
    resizeMode:'contain',
  },
})