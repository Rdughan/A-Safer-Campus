import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
// import Voice from "@react-native-voice/voice";
// import * as Speech from "expo-speech";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAuth } from "../../context/AuthContext";
import { storage } from "../../utils/storage";
import * as Location from "expo-location";
import { Switch } from "react-native";
import { Audio } from 'expo-av';

const VoiceReport = ({ onReportGenerated, navigation }) => {
  // Commented out voice-to-text state
  // const [isRecording, setIsRecording] = useState(false);
  // const [transcript, setTranscript] = useState("");
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [anonymous, setAnonymous] = useState(false);

  //Add State for location
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Audio recording state
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { logout } = useAuth();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    })();
  }, []);

  // Audio recording handlers
  const startRecording = async () => {
    try {
      setIsProcessing(true);
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Audio recording permission is required');
        setIsProcessing(false);
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = async () => {
    setIsProcessing(true);
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
      setIsRecording(false);
      Alert.alert('Recording saved', 'Your audio report has been saved locally.');
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recording]}
        onPress={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
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
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      {latitude && longitude ? (
        <Text style={{ marginTop: 10, color: "#666", fontSize: 12 }}>
          Location: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </Text>
      ) : null}

      {audioUri ? (
        <Text style={styles.transcriptText}>Audio saved: {audioUri.split('/').pop()}</Text>
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
