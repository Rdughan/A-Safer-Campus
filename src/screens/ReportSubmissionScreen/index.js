import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';

const INCIDENT_TYPES = [
  'Fire',
  'Medical',
  'Suspicious Activity',
  'Harassment',
  'Other',
];

const ReportSubmissionScreen = () => {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoading(true);
    setError('');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    } catch (err) {
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!type || !description || !location) {
      setError('Please fill all fields and allow location access.');
      return;
    }
    // Placeholder for backend submission
    Alert.alert('Report Submitted', 'Your report has been submitted (mock).');
    setType(INCIDENT_TYPES[0]);
    setDescription('');
    fetchLocation();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit a Report</Text>
      <Text style={styles.label}>Type of Incident</Text>
      <View style={styles.dropdownContainer}>
        {INCIDENT_TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.dropdownItem, type === t && styles.selectedDropdownItem]}
            onPress={() => setType(t)}
          >
            <Text style={type === t ? styles.selectedDropdownText : styles.dropdownText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the incident..."
        multiline
      />
      <Text style={styles.label}>Location</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#239DD6" />
      ) : location ? (
        <Text style={styles.locationText}>
          Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
        </Text>
      ) : (
        <Text style={styles.locationText}>Location not available</Text>
      )}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchLocation}>
        <Text style={styles.refreshButtonText}>Refresh Location</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>Submit Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FB',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#239DD6',
    marginBottom: 24,
    alignSelf: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  dropdownContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
    gap: 8,
  },
  dropdownItem: {
    backgroundColor: '#e0eafc',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedDropdownItem: {
    backgroundColor: '#239DD6',
  },
  dropdownText: {
    color: '#333',
    fontSize: 15,
  },
  selectedDropdownText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 60,
    fontSize: 16,
    color: '#333',
  },
  locationText: {
    fontSize: 15,
    color: '#239DD6',
    marginTop: 8,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#239DD6',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#239DD6',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReportSubmissionScreen; 