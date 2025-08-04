import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import { incidentService } from '../services/incidentService';
import { AuthContext } from '../context/AuthContext';

const SafetyHeatmap = forwardRef(({ 
  style, 
  initialRegion = null,
  onIncidentPress = null,
  showHeatmap = true,
  timeFilter = null // 'today', 'week', 'month', 'all'
}, ref) => {
  const { user } = useContext(AuthContext);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(
    initialRegion || {
      latitude: 5.6064, // Default to your campus coordinates
      longitude: -0.2000,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }
  );

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchIncidents
  }));

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

      console.log('Final filtered incidents:', filteredIncidents.length);
      setIncidents(filteredIncidents);

      // Update map region if we have incidents
      if (filteredIncidents.length > 0) {
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
  }, [timeFilter, user]);

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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#239DD6" />
          <Text style={styles.loadingText}>Loading safety data...</Text>
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
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
      >
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
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Safety Heatmap</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#00ff00' }]} />
              <Text style={styles.legendText}>Low Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ffff00' }]} />
              <Text style={styles.legendText}>Medium Risk</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ff0000' }]} />
              <Text style={styles.legendText}>High Risk</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported
        </Text>
        {timeFilter && timeFilter !== 'all' && (
          <Text style={styles.statsText}>
            in the last {timeFilter}
          </Text>
        )}
      </View>
    </View>
  );
});

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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  legend: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#333',
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
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  statsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    color: '#333',
    fontFamily: 'Montserrat-Regular',
  },
});

export default SafetyHeatmap;