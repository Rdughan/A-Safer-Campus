import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,TouchableWithoutFeedback,
  StyleSheet, Image, ScrollView, Platform, Animated, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import { incidentService } from '../../services/incidentService';
import { INCIDENT_TYPES } from '../../config/supabase';
import { AuthContext } from '../../context/AuthContext';

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sendToAuthorities, setSendToAuthorities] = useState(true);
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(() => new Date());
  const [location, setLocation] = useState('');
  const [media, setMedia] = useState(null);
  const [showSubmitAnimation] = useState(new Animated.Value(1));
  const [showTimePicker, setShowTimePicker] = useState(false);
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

      // Get address from coordinates and populate location field
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
          
          if (addressString) {
            setLocation(addressString);
            console.log('Location automatically populated:', addressString);
          }
        }
      } catch (addressError) {
        console.log('Could not get address:', addressError);
        // If we can't get the address, use coordinates as fallback
        const coordString = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
        setLocation(coordString);
        console.log('Using coordinates as location:', coordString);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please enter the location manually.',
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

  const pickMedia = () => {
    ImagePicker.launchImageLibrary(
      { mediaType: 'mixed' },
      (response) => {
        if (response.assets && response.assets.length > 0) {
          setMedia(response.assets[0]);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!incidentType) {
      Alert.alert('Error', 'Please select an incident type');
      return;
    }

    if (!description && incidentType !== INCIDENT_TYPES.OTHER) {
      Alert.alert('Error', 'Please provide a description of the incident');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Please provide the location of the incident');
      return;
    }

    setSubmitting(true);

    try {
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

      const incidentData = {
        user_id: user?.id,
        title: `${incidentType.replace('_', ' ').toUpperCase()} - ${location}`,
        description: description || `Incident reported at ${location}`,
        incident_type: incidentType,
        location_description: location,
        latitude: currentLocation?.latitude || 5.6064, // Fallback to campus coordinates
        longitude: currentLocation?.longitude || -0.2000, // Fallback to campus coordinates
        reported_at: time.toISOString(),
        evidence_files: media ? [media.uri] : [],
        witnesses: [],
        status: 'reported'
      };

      console.log('Submitting incident data:', incidentData);

      const result = await incidentService.createIncident(incidentData);

      console.log('Incident creation result:', result);

      if (result.error) {
        console.error('Incident creation error:', result.error);
        Alert.alert('Error', 'Failed to submit incident report. Please try again.');
        return;
      }

      console.log('Incident created successfully:', result.data);

      Alert.alert(
        'Success', 
        'Incident report submitted successfully! The appropriate authorities have been notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home')
          }
        ]
      );

    } catch (error) {
      console.error('Error submitting incident:', error);
      Alert.alert('Error', 'Failed to submit incident report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View intensity={100} tint="light" style={styles.headerContainer}>
          
        <Text style={styles.headerTitle}>Report Incident</Text>
      </View>
      

    <ScrollView style={styles.scrollContainer}> 
      <View style={styles.toggleRow}>
        <Text style={styles.label}>Report Anonymously</Text>
        <Switch value={isAnonymous} onValueChange={setIsAnonymous} />
      </View>

      <TouchableOpacity style={styles.mediaBox} onPress={pickMedia}>
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.mediaPreview} />
        ) : (
          <Text style={styles.mediaText}><Ionicons name="camera-outline" size={20} /> Add Picture/Video</Text>
        )}
      </TouchableOpacity>

      
        <Text style={styles.label }>Time of Incident</Text>
        <TouchableOpacity 
          style={styles.timePickerButton}
          onPress={() => setShowTimePicker(true)}
        >
        
          <Text style={styles.timePickerText}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Ionicons name="time-outline" size={20} color="#70C8E6" />
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
      <View style={styles.locationInputContainer}>
        <Ionicons 
          name={locationLoading ? "location-outline" : "location"} 
          size={20} 
          color={locationLoading ? "#666" : "#239DD6"} 
          style={styles.locationIcon}
        />
        <TextInput
          style={styles.locationInput}
          placeholder={locationLoading ? "Getting your location..." : "Location on Campus"}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      {/* Location Status */}
      <View style={styles.locationStatus}>
        {locationLoading ? (
          <Text style={styles.locationStatusText}>
            <Ionicons name="location-outline" size={16} color="#666" /> Getting your location...
          </Text>
        ) : currentLocation ? (
          <Text style={styles.locationStatusText}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" /> Location captured and populated
          </Text>
        ) : (
          <View>
            <Text style={styles.locationStatusText}>
              <Ionicons name="warning" size={16} color="#FF9800" /> Using campus coordinates
            </Text>
            <TouchableOpacity onPress={getCurrentLocation} style={styles.locationButton}>
              <Text style={styles.locationButtonText}>
                <Ionicons name="location-outline" size={16} /> Get Current Location
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.label}>Select Incident Type</Text>
      <View style={styles.typesContainer}>
        {INCIDENT_TYPE_OPTIONS.map((type) => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.typeButton,
              incidentType === type.value && styles.typeButtonSelected
            ]}
            onPress={() => setIncidentType(type.value)}
          >
            <Text
              style={[
                styles.typeText,
                incidentType === type.value && styles.typeTextSelected
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Describe the incident in detail"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.toggleRow}>
        <Text style={styles.label}>Send to Authorities</Text>
        <Switch value={sendToAuthorities} onValueChange={setSendToAuthorities} />
      </View>

      <Animated.View style={{ transform: [{ scale: showSubmitAnimation }] }}>
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            <Ionicons name="send-outline" size={18} /> 
            {submitting ? ' Submitting...' : ' Submit Report'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    marginTop: 150,
    paddingBottom:40
    
  },
   mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor:'white',
    
  },
   
  headerContainer: {
    backgroundColor: '#Add8e6',
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
    color: '#333',
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
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 14,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily:'Montserrat-Regular',
  },
  mediaBox: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 10,
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
});

