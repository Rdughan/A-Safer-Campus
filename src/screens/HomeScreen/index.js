import { StyleSheet, Text, View, Dimensions, Image, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react'
import MapView, { Marker, Heatmap, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { incidentService } from '../../services/incidentService';

const HomeScreen = ({ route }) => {
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [markerCoords, setMarkerCoords] = useState(null);
    const [mapType, setMapType] = useState(route.params?.mapType || 'standard');
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [timeFilter, setTimeFilter] = useState('all');
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();

    const timeFilterOptions = [
        { key: 'all', label: 'All Time' },
        { key: 'month', label: 'This Month' },
        { key: 'week', label: 'This Week' },
        { key: 'today', label: 'Today' },
    ];

    // Update mapType when route params change
    useEffect(() => {
        if (route.params?.mapType) {
            setMapType(route.params.mapType);
        }
    }, [route.params?.mapType]);

    useEffect(() => {
        (async () => {
            // Request permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            // Get current position
            let location = await Location.getCurrentPositionAsync({});
            setMarkerCoords({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        })();
    }, []);

    // Fetch incidents from Supabase
    const fetchIncidents = async () => {
        try {
            setLoading(true);
            
            // Use the regular getIncidents function which respects RLS policies
            const { data, error } = await incidentService.getIncidents();
            
            if (error) {
                console.error('Error fetching incidents:', error);
                // Don't show alert for empty data, just log it
                if (error.message !== 'No incidents found') {
                    Alert.alert('Error', 'Failed to load safety data');
                }
                setIncidents([]);
                return;
            }

            console.log('Fetched incidents:', data?.length || 0, 'incidents');

            // Filter incidents with valid coordinates
            const validIncidents = (data || []).filter(incident => 
                incident.latitude && incident.longitude
            );

            console.log('Valid incidents with coordinates:', validIncidents.length);

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
        } catch (error) {
            console.error('Error in fetchIncidents:', error);
            setIncidents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, [timeFilter]);

    // Refresh incidents when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchIncidents();
        });

        return unsubscribe;
    }, [navigation]);

    // Get weight based on incident type severity
    const getIncidentWeight = (incidentType) => {
        const weights = {
            'assault': 1.0,
            'theft': 0.7,
            'harassment': 0.8,
            'vandalism': 0.6,
            'medical': 0.9,
            'fire_attack': 1.0,
            'snake_bite': 0.9,
            'pickpocketing': 0.7,
            'other': 0.5,
        };
        return weights[incidentType] || 0.5;
    };

    // Convert incidents to heatmap points
    const heatmapPoints = incidents.map(incident => ({
        latitude: incident.latitude,
        longitude: incident.longitude,
        weight: getIncidentWeight(incident.incident_type),
    }));

    const toggleHeatmap = () => {
        setShowHeatmap(!showHeatmap);
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.logoNameView}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4413/4413044.png' }}
                        style={styles.logo}
                    />
                    <Text style={styles.logoName}>SaferCampus</Text>
                </View>
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchBar}
                        placeholder="Search for a campus..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={() => { }}
                    />
                    <TouchableOpacity
                        style={styles.searchIconButton}
                        onPress={() => alert(`Searching for ${searchQuery}`)}
                    >
                        <Icon name="search" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            <MapView
                style={styles.map}
                initialRegion={markerCoords ? {
                    latitude: markerCoords.latitude,
                    longitude: markerCoords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                } : {
                    latitude: 5.6064, // Default location if permission denied
                    longitude: -0.2000,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
                }}
                showsUserLocation={true}
                followsUserLocation={true}
                provider={PROVIDER_GOOGLE}
                mapType={mapType}
            >
                {/* Custom marker for user location */}
                {markerCoords && (
                    <Marker
                        coordinate={markerCoords}
                        title="Your Location"
                        pinColor="blue"
                    />
                )}

                <Marker
                    coordinate={{ latitude: 5.55, longitude: -0.2 }}
                    title="You are here"
                    description="Welcome to Accra"
                />

                {/* Safety Heatmap */}
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

            {/* Time Filter Buttons */}
            <View style={styles.filterContainer}>
                {timeFilterOptions.map((option) => (
                    <TouchableOpacity
                        key={option.key}
                        style={[
                            styles.filterButton,
                            timeFilter === option.key && styles.filterButtonActive
                        ]}
                        onPress={() => setTimeFilter(option.key)}
                    >
                        <Text style={[
                            styles.filterButtonText,
                            timeFilter === option.key && styles.filterButtonTextActive
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Toggle Heatmap Button */}
            <TouchableOpacity 
                style={styles.toggleHeatmapButton}
                onPress={toggleHeatmap}
            >
                <Icon 
                    name={showHeatmap ? "eye-off" : "eye"} 
                    size={24} 
                    color="#fff" 
                />
                <Text style={styles.toggleHeatmapButtonText}>
                    {showHeatmap ? 'Hide' : 'Show'} Heatmap
                </Text>
            </TouchableOpacity>

            {/* Stats */}
            {showHeatmap && (
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
            )}

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

        </View>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        width:'100%'
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 10,
        position: 'absolute',
        bottom: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
    },
    map: {
        flex: 1,
        width:'100%',
    },
    headerContainer:{
        width:'100%',
        height:'auto',
        backgroundColor:'white',
        alignItems:'center',
        justifyContent:'center',
        paddingTop:'10%',
        paddingBottom:'6%',
        borderRadius:20,
        position:'absolute',
        top: 0, 
        zIndex: 10,
        gap:20,
        elevation:5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
    },
    logo: {
        width: 30,  
        height: 30, 
    },
    logoName:{
        fontSize:17,
        color:'black', 
        fontFamily: 'Montserrat-Bold'
    },
    logoNameView:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:5,
        width:'100%',
        top:'10%',
    },
    searchBar: {
        zIndex: 1,
        backgroundColor: '#E6E7E8',
        padding: 10,
        borderRadius: 10,
        borderWidth:0.9,
        width:'80%',
        borderColor:'transparent',
        color:'black',
        overflow: 'hidden',
        height:'auto',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        gap: 10,
    },
    searchIconButton: {
        backgroundColor: '#239DD6',
        padding: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterContainer: {
        position: 'absolute',
        top: 190,
        left: 20,
        right: 20,
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    filterButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        borderRadius: 15,
        backgroundColor: '#f0f0f0',
    },
    filterButtonActive: {
        backgroundColor: '#239DD6',
    },
    filterButtonText: {
        fontSize: 11,
        color: '#666',
        fontFamily: 'Montserrat-Regular',
    },
    filterButtonTextActive: {
        color: '#fff',
    },
    toggleHeatmapButton: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#239DD6',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toggleHeatmapButtonText: {
        color: '#fff',
        marginLeft: 5,
        fontSize: 12,
        fontFamily: 'Montserrat-Bold',
    },
    statsContainer: {
        position: 'absolute',
        bottom: 80,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statsText: {
        fontSize: 11,
        color: '#333',
        fontFamily: 'Montserrat-Regular',
    },
    legend: {
        position: 'absolute',
        top: 180,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 6,
        color: '#333',
        fontFamily: 'Montserrat-Bold',
    },
    legendItems: {
        gap: 4,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendColor: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    legendText: {
        fontSize: 10,
        color: '#666',
        fontFamily: 'Montserrat-Regular',
    },
})