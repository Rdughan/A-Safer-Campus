import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { incidentService } from '../services/incidentService';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const SafetyHeatmap = forwardRef(({ 
  style, 
  initialRegion = null,
  onIncidentPress = null,
  showHeatmap = true,
  timeFilter = null, // 'today', 'week', 'month', 'all'
  selectedCampus = null,
  userLocation = null
}, ref) => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 6.6720, // Default to KNUST coordinates
      longitude: -1.5723,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }
  );

  // Expose refresh and updateRegion methods to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchIncidents,
    updateRegion: (newRegion) => {
      setRegion(newRegion);
    }
  }));

  // Update region when userLocation or initialRegion changes
  useEffect(() => {
    if (userLocation) {
      setRegion(userLocation);
    } else if (initialRegion) {
      setRegion(initialRegion);
    }
  }, [userLocation, initialRegion]);

  // Fetch incidents from Supabase
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      console.log('Fetching incidents...');
      
      // Try to get all incidents for heatmap display
      let { data, error } = await incidentService.getAllIncidentsForHeatmap();
      
      console.log('Incident service response:', { data, error });
      
      if (error) {
        console.error('Error fetching incidents:', error);
        // If getting all incidents fails, try getting user's own incidents
        if (user?.id) {
          console.log('Trying to get user incidents instead...');
          const userResult = await incidentService.getIncidentsByUser(user.id);
          data = userResult.data;
          error = userResult.error;
        }
        
        if (error) {
          Alert.alert('Error', 'Failed to load safety data');
          return;
        }
      }

      console.log('Total incidents received:', data?.length || 0);

      // Filter incidents with valid coordinates
      const validIncidents = data.filter(incident => 
        incident.latitude && incident.longitude
      );

      console.log('Incidents with valid coordinates:', validIncidents.length);
      console.log('Sample incident data:', validIncidents[0]);

      // Apply time filter if specified
      let filteredIncidents = validIncidents;
      if (timeFilter && timeFilter !== 'all') {
        const now = new Date();
        const filterDate = new Date();
        
        switch (timeFilter) {
          case 'today':
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        filteredIncidents = validIncidents.filter(incident => 
          new Date(incident.reported_at) >= filterDate
        );
      }

      // Filter incidents for selected campus if specified
      if (selectedCampus) {
        const campusRadius = 0.02; // Approximately 2km in degrees
        filteredIncidents = filteredIncidents.filter(incident => {
          const distance = Math.sqrt(
            Math.pow(incident.latitude - selectedCampus.latitude, 2) +
            Math.pow(incident.longitude - selectedCampus.longitude, 2)
          );
          return distance <= campusRadius;
        });
        console.log('Incidents near selected campus:', filteredIncidents.length);
      }

      console.log('Final filtered incidents:', filteredIncidents.length);
      setIncidents(filteredIncidents);

      // Update map region if we have incidents or a selected campus
      if (selectedCampus) {
        setRegion({
          latitude: selectedCampus.latitude,
          longitude: selectedCampus.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else if (filteredIncidents.length > 0) {
        const lats = filteredIncidents.map(i => i.latitude);
        const lngs = filteredIncidents.map(i => i.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        setRegion({
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * 1.2,
          longitudeDelta: (maxLng - minLng) * 1.2,
        });
      }
    } catch (error) {
      console.error('Error in fetchIncidents:', error);
      Alert.alert('Error', 'Failed to load safety data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [timeFilter, user, selectedCampus]);

  // Convert incidents to heatmap points
  const heatmapPoints = incidents.map(incident => ({
    latitude: incident.latitude,
    longitude: incident.longitude,
    weight: getIncidentWeight(incident.incident_type), // Weight based on incident severity
  }));

  // Get weight based on incident type severity
  const getIncidentWeight = (incidentType) => {
    const weights = {
      'assault': 1.0,
      'theft': 0.7,
      'harassment': 0.8,
      'vandalism': 0.6,
      'medical': 0.9,
      'fire': 1.0,
      'other': 0.5,
    };
    return weights[incidentType] || 0.5;
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading safety data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false} // We have our own location button
        showsCompass={true}
        showsScale={true}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            description="You are here"
            pinColor="#239DD6"
            zIndex={1000}
          />
        )}

        {/* Campus Marker */}
        {selectedCampus && (
          <Marker
            coordinate={{
              latitude: selectedCampus.latitude,
              longitude: selectedCampus.longitude,
            }}
            title={selectedCampus.name}
            description={`Campus in ${selectedCampus.city}`}
            pinColor={theme.primary}
          />
        )}

        {/* Incident Markers */}
        {!showHeatmap && incidents.map((incident, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={`${incident.incident_type} Incident`}
            description={`Reported on ${new Date(incident.reported_at).toLocaleDateString()}`}
            pinColor={getIncidentColor(incident.incident_type)}
          />
        ))}

        {showHeatmap && heatmapPoints.length > 0 && (
          <Heatmap
            points={heatmapPoints}
            radius={50}
            opacity={0.7}
            gradient={{
              colors: ['#00ff00', '#ffff00', '#ff0000'],
              startPoints: [0.2, 0.5, 0.8],
              colorMapSize: 2000,
            }}
          />
        )}
      </MapView>
      
      {/* Legend */}
      {showHeatmap && heatmapPoints.length > 0 && (
        <View style={[styles.legend, { backgroundColor: theme.card + 'E6' }]}>
          <Text style={[styles.legendTitle, { color: theme.text }]}>Safety Heatmap</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#00ff00' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Low Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ffff00' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>Medium Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
              <Text style={[styles.legendText, { color: theme.text }]}>High Risk</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: theme.card + 'E6' }]}>
        <Text style={[styles.statsText, { color: theme.text }]}>
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported
        </Text>
        {selectedCampus && (
          <Text style={[styles.statsText, { color: theme.text }]}>
            near {selectedCampus.name}
          </Text>
        )}
        {timeFilter && timeFilter !== 'all' && (
          <Text style={[styles.statsText, { color: theme.text }]}>
            in the last {timeFilter}
          </Text>
        )}
      </View>
    </View>
  );
});

// Helper function to get incident color
const getIncidentColor = (incidentType) => {
  const colors = {
    'assault': '#ff0000',
    'theft': '#ff6600',
    'harassment': '#ff9900',
    'vandalism': '#ffcc00',
    'medical': '#ff0066',
    'fire': '#ff0000',
    'other': '#999999',
  };
  return colors[incidentType] || '#999999';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  legend: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  legendItems: {
    gap: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsText: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
  },
});

export default SafetyHeatmap;