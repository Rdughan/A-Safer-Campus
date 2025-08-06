import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, TouchableWithoutFeedback,
  StyleSheet, Image, ScrollView, Platform, Animated, Alert, Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomButton from '../../components/CustomButton';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../styles/themes';

const INCIDENT_TYPES = [
  'Snake Bite', 'Armed Robbery', 'Fire Attack',
  'Pickpocketing', 'Other'
];

export default function ReportIncidentScreen() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sendToAuthorities, setSendToAuthorities] = useState(true);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(() => new Date());
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState(null);
  const [showSubmitAnimation] = useState(new Animated.Value(1));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const colors = isDarkMode ? darkTheme : lightTheme;

 const handleTimeChange = (event, selectedTime) => {
    
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      setTime(new Date(selectedTime));
    }
  };

  const handleOutsideTap = () => {
    if (Platform.OS === 'ios' && showTimePicker) {
      setShowTimePicker(false);
    }
  };

  const formatTime = (date) => {
    if (!date || !(date instanceof Date)) {
      date = new Date();
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Camera result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          fileName: result.assets[0].fileName,
        });
        setShowMediaOptions(false);
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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      console.log('Gallery result:', result);
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMedia({
          uri: result.assets[0].uri,
          type: result.assets[0].type,
          fileName: result.assets[0].fileName,
        });
        setShowMediaOptions(false);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const showMediaOptionsModal = () => {
    console.log('Opening media options modal');
    setShowMediaOptions(true);
  };

  const removeMedia = () => {
    Alert.alert(
      'Remove Media',
      'Are you sure you want to remove this photo/video?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => setMedia(null) }
      ]
    );
  };

  const handleSubmit = () => {
    Animated.sequence([
      Animated.timing(showSubmitAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(showSubmitAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

          const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const data = {
      isAnonymous,
      sendToAuthorities,
      incidentType,
      description,
      time: timeString,
      location,
      media
    };

    console.log("Submitted data: ", data);
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmationModal(false);
    // Here you can add any additional logic after confirmation
    // For example, navigate to a success screen or show a success message
  };

  const handleCancelSubmit = () => {
    setShowConfirmationModal(false);
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}> 
      <View style={[styles.headerContainer, { backgroundColor: colors.primary }]}> 
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report Incident</Text>
      </View>
      <ScrollView style={[styles.scrollContainer, { backgroundColor: colors.background }]}> 
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: colors.text }]}>Report Anonymously</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
        </View>
        <View style={styles.mediaContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Add Photo/Video Evidence</Text>
          <TouchableOpacity style={[styles.mediaBox, { backgroundColor: isDarkMode ? colors.card : '#E0F2FE', borderColor: isDarkMode ? colors.border : '#E0F2FE' }]} onPress={showMediaOptionsModal}>
            {media ? (
              <View style={styles.mediaPreviewContainer}>
                <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
                <TouchableOpacity style={[styles.removeButton, { backgroundColor: colors.background }]} onPress={removeMedia}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Ionicons name="camera-outline" size={40} color={colors.primary} />
                <Text style={[styles.mediaText, { color: colors.text }]}>Tap to add photo/video</Text>
                <Text style={[styles.mediaSubtext, { color: colors.primary }]}>Take a photo or choose from gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.label, { color: colors.text }]}>Time of Incident</Text>
        <TouchableOpacity 
          style={[styles.timePickerButton, { borderColor: colors.border }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={[styles.timePickerText, { color: colors.text }]}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Ionicons name="time-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

       {showTimePicker && (
  <View style={styles.timePickerContainer}>
    <DateTimePicker
      value={time}
      mode="time"
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      onChange={handleTimeChange}
      themeVariant="light"
      accentColor="#70C8E6"
    />
    {Platform.OS === 'ios' && (
      <TouchableOpacity 
        style={styles.doneButton}
        onPress={() => setShowTimePicker(false)}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    )}
  </View>
)}
      <TextInput
        style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
        placeholder="Location on Campus"
        value={location}
        onChangeText={setLocation}
        placeholderTextColor={colors.placeholderText}
      />

      <Text style={[styles.label, { color: colors.text }]}>Select Incident Type</Text>
      <View style={styles.typesContainer}>
        {INCIDENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              incidentType === type && styles.typeButtonSelected,
              { backgroundColor: isDarkMode ? colors.card : '#E2E8F0', borderColor: isDarkMode ? colors.border : '#E2E8F0' }
            ]}
            onPress={() => setIncidentType(type)}
          >
            <Text
              style={[
                styles.typeText,
                incidentType === type && styles.typeTextSelected,
                { color: isDarkMode ? colors.text : '#334155' }
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {incidentType === 'Other' && (
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}
          placeholder="Describe the incident"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={colors.placeholderText}
        />
      )}

      <View style={styles.toggleRow}>
        <Text style={[styles.label, { color: colors.text }]}>Send to Authorities</Text>
        <Switch value={sendToAuthorities} onValueChange={setSendToAuthorities} />
      </View>

      <Animated.View style={{ transform: [{ scale: showSubmitAnimation }] }}>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleSubmit}>
          <Text style={[styles.submitText, { color: colors.text }]}><Ionicons name="send-outline" size={18} /> Submit Report</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>

    {/* Media Options Modal */}
    <Modal
      visible={showMediaOptions}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowMediaOptions(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowMediaOptions(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Photo/Video</Text>
              
                             <TouchableOpacity style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={() => {
                 console.log('Take photo pressed');
                 openCamera();
               }}>
                 <Ionicons name="camera" size={24} color={colors.primary} />
                 <Text style={[styles.modalOptionText, { color: colors.text }]}>Take Photo</Text>
               </TouchableOpacity>
               
               <TouchableOpacity style={[styles.modalOption, { borderBottomColor: colors.border }]} onPress={() => {
                 console.log('Choose from gallery pressed');
                 openGallery();
               }}>
                 <Ionicons name="images" size={24} color={colors.primary} />
                 <Text style={[styles.modalOptionText, { color: colors.text }]}>Choose from Gallery</Text>
               </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalCancelButton, { backgroundColor: colors.inputBackground }]} 
                onPress={() => setShowMediaOptions(false)}
              >
                <Text style={[styles.modalCancelText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    {/* Confirmation Modal */}
    <Modal transparent visible={showConfirmationModal} animationType="fade" onRequestClose={handleCancelSubmit}>
      <View style={[styles.confirmationContainer, { backgroundColor: colors.background, opacity: 0.9 }]}>
        <View style={[styles.confirmationMainContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="checkmark-circle" size={120} color={colors.primary} style={styles.confirmationIcon} />
          <Text style={[styles.confirmationQuestion, { color: colors.text }]}>Incident Report Submitted!</Text>
          <Text style={[styles.confirmationSubQuestion, { color: colors.text }]}>
            Your incident report has been successfully submitted. Thank you for helping keep our campus safe.
          </Text>
          
          <CustomButton
            buttonText="OK"
            backgroundColor={colors.primary} 
            borderWidth={1}
            borderColor={colors.primary}
            onPress={handleConfirmSubmit}
          />
         
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    padding: 20,
    marginTop: 150,
    paddingBottom:40
    
  },
   mainContainer: {
    flex: 1,
    width: '100%',
    
  },
   
  headerContainer: {
    height: '15%',
     position: 'absolute',
     zIndex: 100,
     width:'100%',
     borderRadius:20,
      elevation:5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3.84,
 
  },
  backArrow: {
    fontSize: 25,
    color: 'black',
    left: 20,
    top: 50,
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Montserrat-Bold',
    left: 20,
    top: 70,
   
  },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontFamily:'Montserrat-Bold',
    marginTop:10
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    fontSize: 15,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    fontFamily:'Montserrat-Regular',
  },
  mediaContainer: {
    marginVertical: 10,
  },
  mediaBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    borderStyle: 'dashed',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  mediaText: {
    color: '#0C4A6E',
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginTop: 10,
    textAlign: 'center',
  },
  mediaSubtext: {
    color: '#70C8E6',
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    marginTop: 5,
    textAlign: 'center',
  },
  mediaPreviewContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  mediaPreview: {
    width: 150,
    height: 150,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  typeButton: {
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeButtonSelected: {
    backgroundColor: '#239DD6',
  },
  typeText: {
    color: '#334155',
    fontFamily:'Montserrat-Regular',
  },
  typeTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily:'Montserrat-Regular',
  },
  submitButton: {
    backgroundColor: '#239DD6',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily:'Montserrat-Bold',
  },
    timePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginTop:10
  },
  timePickerText: {
    fontSize: 16,
    color: '#333',
    fontFamily:'Montserrat-Regular',
  },
  timePickerContainer: {
  position: 'relative',
  marginBottom: 20,
},
doneButton: {
  position: 'absolute',
  right: 10,
  bottom: 10,
  backgroundColor: '#239DD6',
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 16,
  zIndex: 100,
},
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  modalButton: {
    marginBottom: 15,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalOptionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    marginLeft: 15,
    color: '#333',
  },
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: '#6B7280',
  },
  confirmationContainer:{
    flex:1,
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:'gray',
    opacity:0.9,
    zIndex:10
  },
  confirmationMainContainer:{
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
  confirmationSubQuestion:{
    color:'black',
    fontFamily:'Montserrat-Regular',
    fontSize:14,
    textAlign:'center',
    padding:10
  }
});

