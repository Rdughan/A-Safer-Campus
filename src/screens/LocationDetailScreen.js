import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

const LocationDetailScreen = ({ route }) => {
  const { location } = route.params;
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchIncidents = async () => {
      setLoading(true);
      setError('');
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view incidents.');
          setLoading(false);
          return;
        }
        // Fetch all reports for this location (by coordinates)
        const response = await fetch(`${API_BASE_URL}/api/reports?lat=${location.coords.lat}&lng=${location.coords.lng}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch incidents');
        }
        const data = await response.json();
        setIncidents(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch incidents');
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [location]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incidents at {location.location || `Lat: ${location.coords.lat.toFixed(3)}, Lng: ${location.coords.lng.toFixed(3)}`}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#239DD6" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : incidents.length === 0 ? (
        <Text style={styles.emptyText}>No incidents found for this location.</Text>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item._id || item.id}
          renderItem={({ item }) => (
            <View style={styles.incidentItem}>
              <Text style={styles.type}>{item.type}</Text>
              <Text style={styles.date}>{item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}</Text>
              <Text style={styles.severity}>Severity: {item.severity}</Text>
              <Text style={styles.description}>{item.originalText || item.description}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FB',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#239DD6',
    marginBottom: 16,
    alignSelf: 'center',
    textAlign: 'center',
  },
  incidentItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  type: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  severity: {
    fontSize: 14,
    color: '#FF0000',
    marginTop: 4,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 15,
    color: '#555',
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LocationDetailScreen; 