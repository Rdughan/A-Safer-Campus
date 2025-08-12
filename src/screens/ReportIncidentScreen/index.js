import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,TouchableWithoutFeedback,
  StyleSheet, Image, ScrollView, Platform, Animated, Alert, Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { incidentService } from '../../services/incidentService';
import { INCIDENT_TYPES } from '../../config/supabase';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import CustomButton from '../../components/CustomButton';

const INCIDENT_TYPE_OPTIONS = [
  { label: 'Snake Bite', value: INCIDENT_TYPES.SNAKE_BITE },
  { label: 'Fire Attack', value: INCIDENT_TYPES.FIRE_ATTACK },
  { label: 'Pickpocketing', value: INCIDENT_TYPES.PICKPOCKETING },
  { label: 'Theft', value: INCIDENT_TYPES.THEFT },
  { label: 'Assault', value: INCIDENT_TYPES.ASSAULT },
  { label: 'Harassment', value: INCIDENT_TYPES.HARASSMENT },
  { label: 'Vandalism', value: INCIDENT_TYPES.VANDALISM },
  { label: 'Medical Emergency', value: INCIDENT_TYPES.MEDICAL },
  { label: 'Other', value: INCIDENT_TYPES.OTHER }
];

export default function ReportIncidentScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { theme, isDarkMode } = useTheme();
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
  const [submitting, setSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Get current location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to automatically capture incident location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000, // 10 seconds
        timeout: 15000, // 15 seconds
      });

      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Optionally get address from coordinates
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        
        if (addressResponse.length > 0) {
          const address = addressResponse[0];
          const addressString = [
            address.street,
            address.district,
            address.city,
            address.region
          ].filter(Boolean).join(', ');
          
          if (addressString && !location) {
            setLocation(addressString);
          }
        }
      } catch (addressError) {
        console.log('Could not get address:', addressError);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please enter the location manually.',
        [{ text: 'OK' }]
      );
    } finally {
      setLocationLoading(false);
    }
  };

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
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}> 
      <View style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#239DD6' : '#ADD8E6' }]}> 
        <Text style={[styles.headerTitle, { color: theme.text }]}>Report Incident</Text>
      </View>
      <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]}> 
        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: theme.text }]}>Report Anonymously</Text>
          <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
        </View>

        <View style={styles.mediaContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Add Photo/Video Evidence</Text>
          <TouchableOpacity style={[styles.mediaBox, { backgroundColor: isDarkMode ? theme.card : '#E0F2FE', borderColor: isDarkMode ? theme.border : '#E0F2FE' }]} onPress={showMediaOptionsModal}>
            {media ? (
              <View style={styles.mediaPreviewContainer}>
                <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
                <TouchableOpacity style={[styles.removeButton, { backgroundColor: theme.background }]} onPress={removeMedia}>
                  <Ionicons name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Ionicons name="camera-outline" size={40} color={theme.primary} />
                <Text style={[styles.mediaText, { color: theme.text }]}>Tap to add photo/video</Text>
                <Text style={[styles.mediaSubtext, { color: theme.primary }]}>Take a photo or choose from gallery</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: theme.text }]}>Time of Incident</Text>
        <TouchableOpacity 
          style={[styles.timePickerButton, { borderColor: theme.border }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={[styles.timePickerText, { color: theme.text }]}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Ionicons name="time-outline" size={20} color={isDarkMode ? '#239DD6' : theme.primary} />
        </TouchableOpacity>

        {showTimePicker && (
          <View style={styles.timePickerContainer}>
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant={isDarkMode ? 'dark' : 'light'}
              accentColor={isDarkMode ? "#239DD6" : "#239DD6"}
              textColor={isDarkMode ? "#FFFFFF" : "#000000"}
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
          style={[
            styles.input,
            { backgroundColor: theme.card, borderColor: theme.border },
            isDarkMode && { color: '#fff' }
          ]}
          placeholder="Location on Campus"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
        />

        {locationLoading ? (
          <Text style={[styles.locationStatusText, { color: isDarkMode ? '#FFFFFF' : '#333' }]}>
            <Ionicons name="location-outline" size={16} color={isDarkMode ? '#239DD6' : '#666'} /> Getting your location...
          </Text>
        ) : currentLocation ? (
          <Text style={[styles.locationStatusText, { color: isDarkMode ? '#FFFFFF' : '#333' }]}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" /> Location captured automatically
          </Text>
        ) : null}

        <Text style={[styles.label, { color: theme.text }]}>Select Incident Type</Text>
        <View style={styles.typesContainer}>
          {INCIDENT_TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.typeButton,
                { backgroundColor: isDarkMode ? theme.card : '#E2E8F0', borderColor: isDarkMode ? theme.border : '#E2E8F0' },
                incidentType === option.value && { backgroundColor: '#239DD6', borderColor: '#239DD6' }
              ]}
              onPress={() => setIncidentType(option.value)}
            >
              <Text
                style={[
                  styles.typeText,
                  (isDarkMode || incidentType === option.value) && { color: '#fff', fontWeight: 'bold' }
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {incidentType === INCIDENT_TYPES.OTHER && (
          <TextInput
            style={[
              styles.input,
              { backgroundColor: theme.card, borderColor: theme.border },
              isDarkMode && { color: '#fff' }
            ]}
            placeholder="Describe the incident"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            placeholderTextColor={isDarkMode ? '#ccc' : '#666'}
          />
        )}

        <View style={styles.toggleRow}>
          <Text style={[styles.label, { color: theme.text }]}>Send to Authorities</Text>
          <Switch value={sendToAuthorities} onValueChange={setSendToAuthorities} />
        </View>

        <Animated.View style={{ transform: [{ scale: showSubmitAnimation }] }}>
          <TouchableOpacity style={[styles.submitButton, { backgroundColor: isDarkMode ? '#239DD6' : theme.primary }]} onPress={handleSubmit}>
            <Text style={[styles.submitText, { color: isDarkMode ? theme.text : '#fff' }]}>
              <Ionicons name="send-outline" size={18} /> Submit Report
            </Text>
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
              <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Add Photo/Video</Text>
                
                <TouchableOpacity style={[styles.modalOption, { borderBottomColor: theme.border }]} onPress={() => {
                  console.log('Take photo pressed');
                  openCamera();
                }}>
                  <Ionicons name="camera" size={24} color={theme.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>Take Photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.modalOption, { borderBottomColor: theme.border }]} onPress={() => {
                  console.log('Choose from gallery pressed');
                  openGallery();
                }}>
                  <Ionicons name="images" size={24} color={theme.primary} />
                  <Text style={[styles.modalOptionText, { color: theme.text }]}>Choose from Gallery</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalCancelButton, { backgroundColor: theme.card }]} 
                  onPress={() => setShowMediaOptions(false)}
                >
                  <Text style={[styles.modalCancelText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal */}
      <Modal transparent visible={showConfirmationModal} animationType="fade" onRequestClose={handleCancelSubmit}>
        <View style={[styles.confirmationContainer, { backgroundColor: theme.background, opacity: 0.9 }]}>
          <View style={[styles.confirmationMainContainer, { backgroundColor: theme.background }]}>
            <Ionicons name="checkmark-circle" size={120} color={theme.primary} style={styles.confirmationIcon} />
            <Text style={[styles.confirmationQuestion, { color: theme.text }]}>Incident Report Submitted!</Text>
            <Text style={[styles.confirmationSubQuestion, { color: theme.text }]}>
              Your incident report has been successfully submitted. Thank you for helping keep our campus safe.
            </Text>
            
            <CustomButton
              buttonText="OK"
              backgroundColor={theme.primary} 
              borderWidth={1}
              borderColor={theme.primary}
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
    alignSelf:'c'
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
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    fontFamily:'Montserrat-Regular',
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
  mediaText: {
    color: '#0C4A6E',
    fontSize: 16,
    fontFamily:'Montserrat-Regular',
  },
  mediaPreview: {
    width: 100,
    height: 100,
    borderRadius: 10,
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
  submitButtonDisabled: {
    backgroundColor: '#ccc',
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
  borderRadius: 12,
  padding: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 3,
  elevation: 3,
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
   
  locationStatus: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
  },
  locationStatusText: {
    fontSize: 14,
    color: '#333',
    fontFamily:'Montserrat-Regular',
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#239DD6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  locationButtonText: {
    color: 'white',
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
  },
  mediaContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  mediaPreviewContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    padding: 5,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mediaText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  mediaSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Regular',
    marginLeft: 15,
  },
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 18,
    fontFamily: 'Montserrat-Bold',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationMainContainer: {
    width: '80%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmationIcon: {
    marginBottom: 20,
  },
  confirmationQuestion: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    marginBottom: 10,
  },
  confirmationSubQuestion: {
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
});

