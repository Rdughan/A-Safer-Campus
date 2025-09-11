import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
  userLocation = null,
  showMarkers = true // New prop to control marker display
}, ref) => {
  const { user } = useContext(AuthContext);
  const { theme } = useTheme();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState(null);
  const [regionInitialized, setRegionInitialized] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Expose refresh and updateRegion methods to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchIncidents,
    updateRegion: (newRegion) => {
      setRegion(newRegion);
    }
  }));

  // Initialize region with user location, initial region, or default
  useEffect(() => {
    if (!regionInitialized) {
      if (userLocation) {
        setRegion({
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setRegionInitialized(true);
      } else if (initialRegion) {
        setRegion(initialRegion);
        setRegionInitialized(true);
      } else {
        // Default to KNUST if no location available
        setRegion({
          latitude: 6.6735,
          longitude: -1.5718,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setRegionInitialized(true);
      }
    }
  }, [userLocation, initialRegion, regionInitialized]);

  // Update region when userLocation changes (only if not already initialized with user location)
  useEffect(() => {
    if (userLocation && regionInitialized) {
      // Only update if the user location is significantly different
      if (region) {
        const latDiff = Math.abs(userLocation.latitude - region.latitude);
        const lngDiff = Math.abs(userLocation.longitude - region.longitude);
        
        // Only update if the change is significant (more than 0.001 degrees)
        if (latDiff > 0.001 || lngDiff > 0.001) {
          setRegion({
            ...userLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        setRegion({
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  }, [userLocation, regionInitialized, region]);


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
      
      // Only show real incidents, no mock data
      setIncidents(filteredIncidents);

      // Only update map region if we have a selected campus and no user location
      // Don't auto-update region based on incidents to avoid jumping around
      if (selectedCampus && !userLocation && !region) {
        setRegion({
          latitude: selectedCampus.latitude,
          longitude: selectedCampus.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
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

  // Get weight based on incident type severity
  const getIncidentWeight = (incidentType) => {
    const weights = {
      'snake_bite': 1.0,
      'fire_attack': 1.0,
      'assault': 1.0,
      'medical': 0.9,
      'harassment': 0.8,
      'theft': 0.7,
      'pickpocketing': 0.6,
      'vandalism': 0.6,
      'other': 0.5,
    };
    return weights[incidentType] || 0.5;
  };

  // Group incidents by type and nearby location for clustering
  const groupIncidentsByTypeAndLocation = (incidents) => {
    const groups = {};
    const proximityThreshold = 0.001; // ~100 meters
    
    incidents.forEach(incident => {
      const key = `${incident.incident_type}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      
      // Check if there's a nearby incident of the same type
      let addedToExistingGroup = false;
      for (let group of groups[key]) {
        const distance = Math.sqrt(
          Math.pow(incident.latitude - group.center.latitude, 2) +
          Math.pow(incident.longitude - group.center.longitude, 2)
        );
        
        if (distance <= proximityThreshold) {
          group.incidents.push(incident);
          // Update center to average position
          group.center.latitude = group.incidents.reduce((sum, inc) => sum + inc.latitude, 0) / group.incidents.length;
          group.center.longitude = group.incidents.reduce((sum, inc) => sum + inc.longitude, 0) / group.incidents.length;
          addedToExistingGroup = true;
          break;
        }
      }
      
      if (!addedToExistingGroup) {
        groups[key].push({
          center: { latitude: incident.latitude, longitude: incident.longitude },
          incidents: [incident],
          type: incident.incident_type
        });
      }
    });
    
    return groups;
  };

  // Group incidents by type and location for better visualization
  const groupedIncidents = groupIncidentsByTypeAndLocation(incidents);

  // Convert incidents to heatmap points with distinct colors for each type
  const heatmapPoints = incidents.map(incident => ({
    latitude: incident.latitude,
    longitude: incident.longitude,
    weight: getIncidentWeight(incident.incident_type),
    color: getIncidentColor(incident.incident_type),
  }));

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
        region={region || {
          latitude: 6.6735,
          longitude: -1.5718,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onRegionChangeComplete={(newRegion) => {
          // Only update if there's a significant change to prevent constant updates
          if (region) {
            const latDiff = Math.abs(newRegion.latitude - region.latitude);
            const lngDiff = Math.abs(newRegion.longitude - region.longitude);
            
            // Only update if the change is significant (user manually moved map)
            // Use a smaller threshold to be more responsive to user input
            if (latDiff > 0.001 || lngDiff > 0.001) {
              setRegion(newRegion);
            }
          } else {
            setRegion(newRegion);
          }
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} // We have our own location button
        showsCompass={true}
        showsScale={true}
      >
        {/* User Location Marker - only show if showMarkers is true */}
        {showMarkers && userLocation && (
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

        {/* Campus Marker - only show if showMarkers is true */}
        {showMarkers && selectedCampus && (
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

        {/* Individual Incident Markers - show when markers are enabled */}
        {showMarkers && incidents.map((incident, index) => (
          <Marker
            key={`incident-${incident.id || index}`}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.title || `${incident.incident_type?.replace('_', ' ')} Incident`}
            description={incident.description || `Reported at ${incident.location_description || 'Unknown Location'}`}
            pinColor={getIncidentColor(incident.incident_type)}
          />
        ))}

        {/* Clustered Incident Markers - only show if showMarkers is true and not showing individual markers */}
        {showMarkers && !showHeatmap && Object.values(groupedIncidents).flat().map((group, index) => (
          <Marker
            key={`group-${index}`}
            coordinate={{
              latitude: group.center.latitude,
              longitude: group.center.longitude,
            }}
            title={`${group.incidents.length} ${group.type.replace('_', ' ')} incident${group.incidents.length > 1 ? 's' : ''}`}
            description={`${group.incidents.length} incident${group.incidents.length > 1 ? 's' : ''} reported in this area`}
            pinColor={getIncidentColor(group.type)}
          >
            <View style={[
              styles.clusterMarker,
              { backgroundColor: getIncidentColor(group.type) },
              group.incidents.length > 1 && styles.clusterMarkerLarge
            ]}>
              <Text style={[
                styles.clusterText,
                group.incidents.length > 1 && styles.clusterTextLarge
              ]}>
                {group.incidents.length}
              </Text>
            </View>
          </Marker>
        ))}

        {showHeatmap && heatmapPoints.length > 0 && (
          <>
            {/* Create separate heatmaps for each incident type with distinct colors */}
            {Object.entries(
              incidents.reduce((acc, incident) => {
                const type = incident.incident_type;
                if (!acc[type]) acc[type] = [];
                acc[type].push({
                  latitude: incident.latitude,
                  longitude: incident.longitude,
                  weight: getIncidentWeight(incident.incident_type),
                });
                return acc;
              }, {})
            ).map(([incidentType, points]) => (
              <Heatmap
                key={incidentType}
                points={points}
                radius={50}
                opacity={0.7}
                gradient={{
                  colors: [getIncidentColor(incidentType) + '40', getIncidentColor(incidentType) + '80', getIncidentColor(incidentType)],
                  startPoints: [0.2, 0.6, 1.0],
                  colorMapSize: 1000,
                }}
              />
            ))}
          </>
        )}
      </MapView>
      
      {/* Collapsible Legend - Bottom Right */}
      {(showHeatmap || (showMarkers && incidents.length > 0)) && (
        <View style={[styles.legendContainer, { backgroundColor: theme.card + 'E6' }]}>
          <TouchableOpacity 
            style={[styles.legendHeader, { borderBottomColor: theme.border }]}
            onPress={() => setLegendCollapsed(!legendCollapsed)}
          >
            <Text style={[styles.legendTitle, { color: theme.text }]}>
              {showHeatmap ? 'Incident Types' : 'Incident Types'}
            </Text>
            <Ionicons 
              name={legendCollapsed ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.text} 
            />
          </TouchableOpacity>
          
          {!legendCollapsed && (
            <View style={styles.legendItems}>
              {[...new Set(incidents.map(i => i.incident_type))].map(type => (
                <View key={type} style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: getIncidentColor(type) }]} />
                  <Text style={[styles.legendText, { color: theme.text }]}>
                    {getIncidentDisplayName(type)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      
      {/* Stats - only show when there are incidents */}
      {incidents.length > 0 && (
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
      )}
    </View>
  );
});

// Helper function to get incident color - using more distinct colors
const getIncidentColor = (incidentType) => {
  const colors = {
    'snake_bite': '#8B0000',     // Dark red - high danger
    'fire_attack': '#FF4500',    // Orange red - fire
    'assault': '#DC143C',        // Crimson - violence
    'medical': '#00CED1',        // Dark turquoise - medical emergency
    'harassment': '#9370DB',     // Medium purple - harassment
    'theft': '#FF8C00',          // Dark orange - theft
    'pickpocketing': '#32CD32',  // Lime green - pickpocketing
    'vandalism': '#FFD700',      // Gold - vandalism
    'other': '#808080',          // Gray - other
  };
  return colors[incidentType] || '#808080';
};

// Helper function to get incident type display name
const getIncidentDisplayName = (incidentType) => {
  const displayNames = {
    'snake_bite': 'Snake Bite',
    'fire_attack': 'Fire Attack',
    'assault': 'Assault',
    'medical': 'Medical Emergency',
    'harassment': 'Harassment',
    'theft': 'Theft',
    'pickpocketing': 'Pickpocketing',
    'vandalism': 'Vandalism',
    'other': 'Other',
  };
  return displayNames[incidentType] || incidentType;
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
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 200,
    minWidth: 150,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
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
    padding: 12,
    gap: 8,
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
  clusterMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterMarkerLarge: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  clusterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  clusterTextLarge: {
    fontSize: 14,
  },
});

export default SafetyHeatmap;