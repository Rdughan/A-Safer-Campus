import React, { useState, useEffect, forwardRef, useImperativeHandle, useContext } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert, TouchableOpacity, Modal, ScrollView } from 'react-native';
import MapView, { Heatmap, PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { incidentService } from '../services/incidentService';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { formatLocationName } from '../services/locationService';

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
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

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
  // AND only if no selectedCampus is present (to prevent reverting from search results)
  useEffect(() => {
    if (userLocation && regionInitialized && !selectedCampus) {
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
  }, [userLocation, regionInitialized, region, selectedCampus]);

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
      
      // Do not precompute reverse geocoding (rate limits). Store raw incidents; compute lazily when needed.
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

  // Convert incidents to heatmap points with density-based intensity
  const heatmapPoints = incidents.map(incident => ({
    latitude: incident.latitude,
    longitude: incident.longitude,
    weight: getIncidentWeight(incident.incident_type),
  }));

  // Group incidents by type for separate heatmaps
  const incidentsByType = incidents.reduce((acc, incident) => {
    const type = incident.incident_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(incident);
    return acc;
  }, {});

  // Calculate incident density (0-1 scale)
  const calculateIncidentDensity = (typeIncidents) => {
    if (typeIncidents.length <= 1) return 0;
    
    const clusterRadius = 0.001; // ~100 meters
    let clusters = 0;
    let totalIncidents = typeIncidents.length;
    
    // Simple clustering to find density
    const processed = new Set();
    
    typeIncidents.forEach((incident, index) => {
      if (processed.has(index)) return;
      
      const cluster = [incident];
      processed.add(index);
      
      // Find nearby incidents
      typeIncidents.forEach((otherIncident, otherIndex) => {
        if (processed.has(otherIndex) || index === otherIndex) return;
        
        const distance = Math.sqrt(
          Math.pow(incident.latitude - otherIncident.latitude, 2) +
          Math.pow(incident.longitude - otherIncident.longitude, 2)
        );
        
        if (distance <= clusterRadius) {
          cluster.push(otherIncident);
          processed.add(otherIndex);
        }
      });
      
      if (cluster.length > 1) {
        clusters++;
      }
    });
    
    // Return density factor (0-1)
    return Math.min(clusters / totalIncidents, 1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sanitize any description that embeds raw coordinates into a landmark-based phrase
  const sanitizeDescription = (incident) => {
    const raw = incident?.description?.trim();
    if (!raw) return null;
    const looksLikeCoords = /Lat:\s*\d+\.\d+\s*,\s*Lng:\s*-?\d+\.\d+|^\d+\.\d+\s*,\s*-?\d+\.\d+$/i.test(raw);
    if (looksLikeCoords || /reported at\s*lat/i.test(raw)) {
      const readable = incident?.friendlyLocation || incident?.location_description || 'Unknown Location';
      return `Reported at ${readable}`;
    }
    return raw;
  };

  // Handle incident marker press
  const handleIncidentPress = async (incident) => {
    let friendlyLocation = incident.friendlyLocation;
    if (!friendlyLocation && incident?.latitude && incident?.longitude) {
      try {
        friendlyLocation = await formatLocationName(
          incident.latitude,
          incident.longitude,
          incident.location_description
        );
      } catch (e) {
        friendlyLocation = incident.location_description || 'Unknown Location';
      }
    }

    const withFriendly = { ...incident, friendlyLocation };
    setSelectedIncident(withFriendly);
    setShowIncidentModal(true);
    if (onIncidentPress) {
      onIncidentPress(withFriendly);
    }
  };

  // Handle cluster marker press
  const handleClusterPress = async (group) => {
    // Show details for the cluster
    const clusterInfo = {
      ...group,
      isCluster: true,
      count: group.incidents.length,
      mostRecentIncident: group.incidents.sort((a, b) => 
        new Date(b.reported_at) - new Date(a.reported_at)
      )[0]
    };
    // Lazily compute friendly names for incidents in the cluster (throttled by service)
    try {
      const enhancedIncidents = await Promise.all(
        clusterInfo.incidents.map(async (inc) => {
          if (inc.friendlyLocation || !inc.latitude || !inc.longitude) return inc;
          try {
            const friendly = await formatLocationName(inc.latitude, inc.longitude, inc.location_description);
            return { ...inc, friendlyLocation: friendly };
          } catch (_) {
            return { ...inc, friendlyLocation: inc.location_description || 'Unknown Location' };
          }
        })
      );
      const enhancedMostRecent = enhancedIncidents.find(i => i.id === clusterInfo.mostRecentIncident.id) || clusterInfo.mostRecentIncident;
      setSelectedIncident({ ...clusterInfo, incidents: enhancedIncidents, mostRecentIncident: enhancedMostRecent });
    } catch (e) {
      setSelectedIncident(clusterInfo);
    }
    setShowIncidentModal(true);
  };

  // Handle map press to detect heatmap taps
  const handleMapPress = (event) => {
    if (!showHeatmap || incidents.length === 0) return;
    
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const tapRadius = 0.002; // ~200 meters - larger radius for better tap detection
    
    // Find the closest incident to the tap point, grouped by type
    let closestIncident = null;
    let closestDistance = Infinity;
    let closestType = null;
    
    // Check each incident type separately
    Object.entries(incidentsByType).forEach(([incidentType, typeIncidents]) => {
      typeIncidents.forEach(incident => {
        const distance = Math.sqrt(
          Math.pow(latitude - incident.latitude, 2) +
          Math.pow(longitude - incident.longitude, 2)
        );
        
        if (distance <= tapRadius && distance < closestDistance) {
          closestDistance = distance;
          closestIncident = incident;
          closestType = incidentType;
        }
      });
    });
    
    // If we found an incident within tap radius, create a cluster for that type
    if (closestIncident && closestType) {
      // Find all incidents of the same type near the tapped location
      const nearbyIncidents = incidentsByType[closestType].filter(incident => {
        const distance = Math.sqrt(
          Math.pow(latitude - incident.latitude, 2) +
          Math.pow(longitude - incident.longitude, 2)
        );
        return distance <= tapRadius;
      });
      
      // Create cluster for this incident type
      const cluster = {
        center: {
          latitude: nearbyIncidents.reduce((sum, inc) => sum + inc.latitude, 0) / nearbyIncidents.length,
          longitude: nearbyIncidents.reduce((sum, inc) => sum + inc.longitude, 0) / nearbyIncidents.length
        },
        incidents: nearbyIncidents,
        type: closestType
      };
      
      handleClusterPress(cluster);
    }
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
        initialRegion={region || {
          latitude: 6.6735,
          longitude: -1.5718,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        onPress={handleMapPress}
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

        {/* Individual Incident Markers - show when markers are enabled and make them clickable */}
        {showMarkers && incidents.map((incident, index) => (
          <Marker
            key={`incident-${incident.id || index}`}
            coordinate={{
              latitude: incident.latitude,
              longitude: incident.longitude,
            }}
            title={incident.title || `${incident.incident_type?.replace('_', ' ')} Incident`}
            description={sanitizeDescription(incident) || `Reported at ${incident.friendlyLocation || incident.location_description || 'Unknown Location'}`}
            pinColor={getIncidentColor(incident.incident_type)}
            onPress={() => handleIncidentPress(incident)}
          />
        ))}

        {/* Clustered Incident Markers - make them clickable too */}
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
            onPress={() => handleClusterPress(group)}
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
            {/* Create separate heatmaps for each incident type with distinct colors and density-based sizing */}
            {Object.entries(incidentsByType).map(([incidentType, typeIncidents]) => {
              // Calculate density for this incident type
              const density = calculateIncidentDensity(typeIncidents);
              
              // Adjust radius and opacity based on density
              const baseRadius = 50;
              const radius = baseRadius + (density * 30); // Increase radius based on density
              
              const baseOpacity = 0.6;
              const opacity = Math.min(baseOpacity + (density * 0.3), 0.9); // Increase opacity based on density
              
              // Get the base color for this incident type
              const baseColor = getIncidentColor(incidentType);
              
              return (
                <Heatmap
                  key={incidentType}
                  points={typeIncidents.map(incident => ({
                    latitude: incident.latitude,
                    longitude: incident.longitude,
                    weight: getIncidentWeight(incident.incident_type) * (1 + density * 0.5), // Increase weight based on density
                  }))}
                  radius={radius}
                  opacity={opacity}
                  gradient={{
                    colors: [
                      baseColor + '00', // Completely transparent at edges
                      baseColor + '40', // Semi-transparent in middle
                      baseColor + '80', // More opaque in center
                      baseColor + 'FF'  // Full opacity at core
                    ],
                    startPoints: [0.0, 0.3, 0.7, 1.0],
                    colorMapSize: 256,
                  }}
                />
              );
            })}
            
          </>
        )}
      </MapView>
      
      {/* Incident Details Modal */}
      <Modal
        visible={showIncidentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowIncidentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedIncident?.isCluster 
                  ? `${selectedIncident.count} ${getIncidentDisplayName(selectedIncident.type)} Incidents`
                  : getIncidentDisplayName(selectedIncident?.incident_type)
                }
              </Text>
              <TouchableOpacity onPress={() => setShowIncidentModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedIncident?.isCluster ? (
                // Cluster details
                <View>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Cluster Information</Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      {selectedIncident.count} incidents of {getIncidentDisplayName(selectedIncident.type)} reported in this area
                    </Text>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Most Recent Incident</Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      Reported: {formatDate(selectedIncident.mostRecentIncident?.reported_at)}
                    </Text>
                    {selectedIncident.mostRecentIncident?.location_description && (
                      <Text style={[styles.modalText, { color: theme.text }]}>
                        Location: {selectedIncident.mostRecentIncident.friendlyLocation || selectedIncident.mostRecentIncident.location_description}
                      </Text>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>All Incidents in this Area</Text>
                    {selectedIncident.incidents?.map((incident, index) => (
                      <View key={index} style={[styles.incidentItem, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.incidentTime, { color: theme.primary }]}>
                          {formatDate(incident.reported_at)}
                        </Text>
                        {incident.title && (
                          <Text style={[styles.incidentTitle, { color: theme.text }]}>
                            {incident.title}
                          </Text>
                        )}
                        {sanitizeDescription(incident) && (
                          <Text style={[styles.incidentDescription, { color: theme.textSecondary }]}>
                            {sanitizeDescription(incident)}
                          </Text>
                        )}
                        {incident.location_description && (
                          <Text style={[styles.incidentLocation, { color: theme.textSecondary }]}>
                            📍 {incident.friendlyLocation || incident.location_description}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                // Single incident details
                <View>
                  {selectedIncident?.title && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Title</Text>
                      <Text style={[styles.modalText, { color: theme.text }]}>
                        {selectedIncident.title}
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Reported</Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      {formatDate(selectedIncident?.reported_at)}
                    </Text>
                  </View>

                  {selectedIncident?.description && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Description</Text>
                      <Text style={[styles.modalText, { color: theme.text }]}>
                        {selectedIncident.description}
                      </Text>
                    </View>
                  )}

                  {selectedIncident?.location_description && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Location</Text>
                      <Text style={[styles.modalText, { color: theme.text }]}>
                        📍 {selectedIncident.friendlyLocation || selectedIncident.location_description}
                      </Text>
                    </View>
                  )}

                  {selectedIncident?.status && (
                    <View style={styles.modalSection}>
                      <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Status</Text>
                      <Text style={[styles.modalText, { color: theme.text }]}>
                        {selectedIncident.status.charAt(0).toUpperCase() + selectedIncident.status.slice(1)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Severity</Text>
                    <View style={[styles.severityIndicator, { backgroundColor: getIncidentColor(selectedIncident?.incident_type) }]}>
                      <Text style={styles.severityText}>
                        {getIncidentWeight(selectedIncident?.incident_type) >= 0.8 ? 'High' : 
                         getIncidentWeight(selectedIncident?.incident_type) >= 0.6 ? 'Medium' : 'Low'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
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
              {[...new Set(incidents.map(i => i.incident_type))].map(type => {
                const typeIncidents = incidents.filter(i => i.incident_type === type);
                const density = calculateIncidentDensity(typeIncidents);
                
                return (
                  <View key={type} style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: getIncidentColor(type) }]} />
                    <Text style={[styles.legendText, { color: theme.text }]}>
                      {getIncidentDisplayName(type)} ({typeIncidents.length})
                    </Text>
                    {density > 0 && (
                      <Text style={[styles.legendSubtext, { color: theme.text + '80' }]}>
                        Hotspot
                      </Text>
                    )}
                  </View>
                );
              })}
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
  legendSubtitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Montserrat-Bold',
  },
  legendSubtext: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 20,
  },
  incidentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  incidentTime: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
    marginBottom: 4,
  },
  incidentTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: 4,
  },
  incidentDescription: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    lineHeight: 18,
    marginBottom: 4,
  },
  incidentLocation: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    fontStyle: 'italic',
  },
  severityIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  locationButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SafetyHeatmap;