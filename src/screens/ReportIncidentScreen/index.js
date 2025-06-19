import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch,TouchableWithoutFeedback,
  StyleSheet, Image, ScrollView, Platform, Animated
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';


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
    alert('Incident Report Submitted!');
  };

  return (
    <View style={styles.mainContainer}>
      <BlurView intensity={100} tint="light" style={styles.headerContainer}>
            <LinearGradient
              colors={[ '#70C8E6', 'white']} 
              start={{ x: 0.5, y: 0 }}       
              end={{ x: 0.5, y: 1 }}         
               style={StyleSheet.absoluteFillObject}
            />
        <Text style={styles.headerTitle}>Report Incident</Text>
      </BlurView>
      

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
      <TextInput
        style={styles.input}
        placeholder="Location on Campus"
        value={location}
        onChangeText={setLocation}
      />

      <Text style={styles.label}>Select Incident Type</Text>
      <View style={styles.typesContainer}>
        {INCIDENT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              incidentType === type && styles.typeButtonSelected
            ]}
            onPress={() => setIncidentType(type)}
          >
            <Text
              style={[
                styles.typeText,
                incidentType === type && styles.typeTextSelected
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {incidentType === 'Other' && (
        <TextInput
          style={styles.input}
          placeholder="Describe the incident"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />
      )}

      <View style={styles.toggleRow}>
        <Text style={styles.label}>Send to Authorities</Text>
        <Switch value={sendToAuthorities} onValueChange={setSendToAuthorities} />
      </View>

      <Animated.View style={{ transform: [{ scale: showSubmitAnimation }] }}>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}><Ionicons name="send-outline" size={18} /> Submit Report</Text>
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
    height: '18%',
     position: 'absolute',
     zIndex: 100,
     width:'100%'
 
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
   
});

