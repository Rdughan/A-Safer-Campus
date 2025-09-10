import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../hooks/useTheme';

const LocationPickerModal = ({ visible, onClose, onLocationSelect, initialLocation = null }) => {
  const { theme, isDarkMode } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 6.6735, // Default to KNUST
    longitude: -1.5718,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const mapRef = useRef(null);

  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to select your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maximumAge: 10000,
        timeout: 15000,
      });

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(currentLocation);
      setMapRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Set as default selected location
      if (!selectedLocation) {
        setSelectedLocation(currentLocation);
      }

    } catch (error) {
      console.error('Error getting location:', error);
      
      // Fallback to KNUST location
      const fallbackLocation = {
        latitude: 6.6735,
        longitude: -1.5718,
      };
      
      setUserLocation(fallbackLocation);
      setMapRegion({
        ...fallbackLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      
      if (!selectedLocation) {
        setSelectedLocation(fallbackLocation);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert('No Location Selected', 'Please tap on the map to select a location.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
      setMapRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Select Location</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            customMapStyle={isDarkMode ? [
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
              { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
            ] : []}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                description="You are here"
                pinColor="#239DD6"
              />
            )}

            {/* Selected Location Marker */}
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Selected Location"
                description="Tap to change"
                pinColor="#ff4444"
              />
            )}
          </MapView>

          {/* Loading Overlay */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>Getting your location...</Text>
            </View>
          )}
        </View>

        {/* Controls */}
        <View style={[styles.controls, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={handleUseCurrentLocation}
            style={[styles.currentLocationButton, { backgroundColor: theme.primary }]}
            disabled={!userLocation}
          >
            <Ionicons name="locate" size={20} color="#fff" />
            <Text style={[styles.currentLocationText, { color: '#fff' }]}>Use Current Location</Text>
          </TouchableOpacity>
          
          <Text style={[styles.instructionText, { color: theme.text }]}>
            Tap anywhere on the map to select the incident location
          </Text>

          <TouchableOpacity 
            onPress={handleConfirm} 
            style={[
              styles.confirmButton, 
              { backgroundColor: selectedLocation ? theme.primary : '#ccc' }
            ]}
            disabled={!selectedLocation}
          >
            <Text style={[styles.confirmButtonText, { color: '#fff' }]}>
              Confirm Location
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Add top padding for status bar
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same width as close button to center title
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  controls: {
    padding: 20,
    paddingBottom: 30, // Add extra bottom padding for safe area
    borderTopWidth: 1,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
  },
  currentLocationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
  },
});

export default LocationPickerModal;
