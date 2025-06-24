import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../utils/storage";
import * as Location from 'expo-location';

const VoiceReport = ({ onReportGenerated, navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  //Add State for location
  const [latitude,setLatitude] = useState(null);
  const [longitude, setLongitude]= useState(null);


  const { logout } = useAuth();

  useEffect(() => {
    (async()=>{
      let {status}=await Location.requestForegroundPermissionsAsync();
      if(status!=='granted'){
        Alert.alert('Permission denied','Location permission is required');
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e) => {
    setTranscript(e.value[0]);
  };

  const startRecording = async () => {
    try {
      await Voice.start("en-US");
      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setIsRecording(false);
      processReport();
    } catch (error) {
      console.error(error);
    }
  };

  /*const processReport = async () => {
    setIsProcessing(true);

    try {
      const token = await storage.getToken();

      // 1. Send transcript to backend for summarization
      const summaryResponse = await fetch(
        "http://192.168.53.95:5000/api/nlp/summarize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            transcript,
            type,
            location,
            severity,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      const reportPayload = await summaryResponse.json();
      const reportResponse = await fetch(
        "http://192.168.53.95:5000/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reportPayload),
        }
      );

      if (summaryResponse.status === 401) {
        logout();
        if (navigation) navigation.replace("Login");
        else Alert.alert("Session expired", "Please log in again.");
        setIsProcessing(false);
        return;
      }

      if (!summaryResponse.ok) {
        const errorData = await summaryResponse.json();
        Alert.alert("Error", errorData.message || "Failed to summarize report");
        setIsProcessing(false);
        return;
      }

      const { summary } = await summaryResponse.json();

      // 2. Submit the summarized report to backend
      const reportPayload = {
        summary,
        original: transcript,
        // Add other required fields here if needed (type, location, severity, etc.)
      };

      const reportResponse = await fetch(
        "http://192.168.53.95:5000/api/reports",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reportPayload),
        }
      );

      if (reportResponse.status === 401) {
        logout();
        if (navigation) navigation.replace("Login");
        else Alert.alert("Session expired", "Please log in again.");
        setIsProcessing(false);
        return;
      }

      if (reportResponse.ok) {
        Alert.alert("Success", "Report submitted successfully");
        setTranscript("");
        if (onReportGenerated) onReportGenerated(reportPayload);
      } else {
        const errorData = await reportResponse.json();
        Alert.alert("Error", errorData.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Processing error:", error);
      Alert.alert(
        "Processing Error",
        "Failed to process or submit your report. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };*/

const processReport = async () => {
  setIsProcessing(true);

  try {
    const token = await storage.getToken();

    // 1. Send transcript to backend for summarization
    const summaryResponse = await fetch('http://192.168.53.95:5000/api/nlp/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        transcript,
        type,      // Make sure these are defined in your component!
        location,
        severity,
        timestamp: new Date().toISOString(),
      }),
    });

    if (summaryResponse.status === 401) {
      logout();
      if (navigation) navigation.replace('Login');
      else Alert.alert('Session expired', 'Please log in again.');
      setIsProcessing(false);
      return;
    }

    if (!summaryResponse.ok) {
      const errorData = await summaryResponse.json();
      Alert.alert('Error', errorData.message || 'Failed to summarize report');
      setIsProcessing(false);
      return;
    }

    // Parse the summarization response ONCE
    /*const reportPayload = await summaryResponse.json();*/

    const reportPayload = {
  summary,
  type,        // Make sure these are defined in your component!
  location,
  severity,
  original: transcript,
  timestamp: new Date().toISOString(),
  coords: { lat: latitude, lng: longitude } // Get these from device/location picker
};


    // 2. Submit the summarized report to backend
    const reportResponse = await fetch('http://192.168.53.95:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reportPayload),
    });

    if (reportResponse.status === 401) {
      logout();
      if (navigation) navigation.replace('Login');
      else Alert.alert('Session expired', 'Please log in again.');
      setIsProcessing(false);
      return;
    }

    if (reportResponse.ok) {
      Alert.alert('Success', 'Report submitted successfully');
      setTranscript('');
      if (onReportGenerated) onReportGenerated(reportPayload);
    } else {
      const errorData = await reportResponse.json();
      Alert.alert('Error', errorData.message || 'Failed to submit report');
    }
  } catch (error) {
    console.error('Processing error:', error);
    Alert.alert(
      'Processing Error',
      'Failed to process or submit your report. Please try again.'
    );
  } finally {
    setIsProcessing(false);
  }
};  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Ionicons
          name={isRecording ? "stop-circle" : "mic"}
          size={30}
          color="white"
        />
      </TouchableOpacity>

      {isProcessing && (
        <View style={styles.processingContainer}>
          <ActivityIndicator color="#239DD6" />
          <Text style={styles.processingText}>Processing your report...</Text>
        </View>
      )}

      {latitude && longitude ? (
  <Text style={{ marginTop: 10, color: '#666', fontSize: 12 }}>
    Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
  </Text>
) : null}

      {transcript ? (
        <Text style={styles.transcriptText}>"{transcript}"</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  recordButton: {
    backgroundColor: "#239DD6",
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recording: {
    backgroundColor: "#ff4444",
  },
  processingContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  processingText: {
    marginTop: 10,
    color: "#666",
    fontFamily: "Montserrat-Regular",
  },
  transcriptText: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    fontFamily: "Montserrat-Regular",
    fontSize: 16,
    color: "#333",
  },
});

export default VoiceReport;
