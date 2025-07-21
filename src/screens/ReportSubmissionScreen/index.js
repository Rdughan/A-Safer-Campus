import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Switch } from 'react-native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const INCIDENT_TYPES = [
  'Robbery',
  'Assault',
  'Dangerous Animal',
  'Altercation',
  'Fire',
  'Medical',
  'Suspicious Activity',
  'Harassment',
  'Other',
];

const SEVERITY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];

const ReportSubmissionScreen = () => {
  const [type, setType] = useState(INCIDENT_TYPES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incidentDate, setIncidentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [severity, setSeverity] = useState(SEVERITY_LEVELS[1]); // Default to MEDIUM

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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setIncidentDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!type || !description || !location || !incidentDate || !severity) {
      setError('Please fill all fields and allow location access.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to submit a report.');
        setLoading(false);
        return;
      }
      // Generate a summary (first 100 chars of description)
      const summary = description.length > 100 ? description.substring(0, 100) + '...' : description;
      // Compose location string
      const locationString = location ? `Lat: ${location.latitude}, Lng: ${location.longitude}` : '';
      // Prepare payload
      const payload = {
        summary,
        type,
        location: locationString,
        severity,
        original: description,
        timestamp: incidentDate,
        coords: location ? { lat: location.latitude, lng: location.longitude } : undefined,
        anonymous: isAnonymous,
      };
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert('Report Submitted', 'Your report has been submitted successfully.');
        setType(INCIDENT_TYPES[0]);
        setDescription('');
        setIncidentDate(new Date());
        setIsAnonymous(false);
        setSeverity(SEVERITY_LEVELS[1]);
        fetchLocation();
      } else {
        throw new Error(data.error || data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.label}>Time of Incident</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: '#333', fontSize: 16 }}>
          {incidentDate ? incidentDate.toLocaleString() : 'Select date and time'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={incidentDate}
          mode="datetime"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.label}>Severity</Text>
      <View style={styles.dropdownContainer}>
        {SEVERITY_LEVELS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.dropdownItem, severity === level && styles.selectedDropdownItem]}
            onPress={() => setSeverity(level)}
          >
            <Text style={severity === level ? styles.selectedDropdownText : styles.dropdownText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Text style={{ fontSize: 16, color: '#333', marginRight: 10 }}>Report Anonymously</Text>
        <Switch
          value={isAnonymous}
          onValueChange={setIsAnonymous}
          thumbColor={isAnonymous ? '#239DD6' : '#ccc'}
          trackColor={{ false: '#e0eafc', true: '#91D8F7' }}
        />
      </View>
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