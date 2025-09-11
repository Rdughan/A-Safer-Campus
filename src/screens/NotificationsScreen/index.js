import { StyleSheet, Text, View, TouchableOpacity,FlatList,Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import NotificationItem from '../../components/NotificationItem';
import {NotificationData} from '../../components/Data/NotificationData.js'
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';
import { incidentService } from '../../services/incidentService';
import { AuthContext } from '../../context/AuthContext';
import { getLocationDetails } from '../../services/locationService';

const NotificationsScreen = ({navigation}) => {
  const { theme, isDarkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const getImageForType = (type) => {
    const t = (type || '').toLowerCase();
    if (t.includes('fire')) return require('../../components/notifScreenMedia/fire.png');
    if (t.includes('snake') || t.includes('medical')) return require('../../components/notifScreenMedia/snake.jpeg');
    if (t.includes('pickpocket')) return require('../../components/notifScreenMedia/pickpocketing.png');
    if (t.includes('theft') || t.includes('robbery')) return require('../../components/notifScreenMedia/robbery.png');
    if (t.includes('missing')) return require('../../components/notifScreenMedia/missing.png');
    return require('../../components/notifScreenMedia/fire.png');
  };

  // Build a concise, human-friendly location string
  const formatDisplayLocation = (details, fallbackText) => {
    if (!details) return fallbackText || 'Unknown Location';
    const parts = [];
    // Prefer name if present (landmark), else district/city/region
    if (details.name && details.name !== 'Unknown Location') parts.push(details.name);
    if (details.district && !parts.includes(details.district)) parts.push(details.district);
    if (details.city && !parts.includes(details.city)) parts.push(details.city);
    if (parts.length === 0 && details.region) parts.push(details.region);
    const label = parts.join(', ');
    // Fallback to prior text if we only have coordinate-y text
    if (!label || /^Location:/i.test(label)) return fallbackText || 'Unknown Location';
    return label;
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await incidentService.getIncidents();
      
      if (error) {
        console.error('Error fetching incidents for notifications:', error);
        // Fallback to hardcoded data if there's an error
        setIncidents(NotificationData);
        return;
      }

      // Convert incidents to notification format (last 5) with clean location names
      const recentIncidents = data?.slice(0, 5) ? await Promise.all(
        data.slice(0, 5).map(async (incident) => {
          let locText = incident.location_description || '';
          let details = null;
          try {
            if (incident.latitude && incident.longitude) {
              details = await getLocationDetails(incident.latitude, incident.longitude);
            }
          } catch {}
          const displayLoc = formatDisplayLocation(details, locText);
          const typeSafe = (incident.incident_type || 'unknown').replace('_', ' ').toUpperCase();
          return {
            id: incident.id,
            title: `${typeSafe} - ${displayLoc}`,
            message: incident.description || `Incident reported at ${displayLoc}`,
            location: displayLoc,
            status: incident.status || 'Reported',
            time: new Date(incident.reported_at || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: getImageForType(incident.incident_type),
            type: 'incident',
            priority: 'high',
            isRead: false
          };
        })
      ) : [];

      setIncidents(recentIncidents);
    } catch (error) {
      console.error('Error in fetchIncidents:', error);
      // Fallback to hardcoded data
      setIncidents(NotificationData);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      <View intensity={100} tint="light" style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#239DD6' : '#Add8e6' }]}>
        <View style={{flexDirection:'row' , gap:7, alignItems:'center', justifyContent:'c'}}>
          <Text style={[styles.notificationsText, { color: theme.text }]}>Recent Incidents</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading incidents...</Text>
        </View>
      ) : (
        <FlatList
          data={incidents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotificationItem item={item} />}
          contentContainerStyle={{ paddingBottom: 30, marginTop:20}}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={60} color={theme.primary} />
              <Text style={[styles.emptyText, { color: theme.text }]}>No recent incidents</Text>
              <Text style={[styles.emptySubtext, { color: theme.text }]}>Campus is safe!</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
    mainContainer:{
        flex:1,
        width:'100%',
    },
     headerContainer:{
        height:'15%', 
        borderRadius:20,
         elevation:5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3.84,
        
    },
    backArrow:{
       fontSize:25,
         left:20,
         top:50,
    },
   
        notificationsText:{ 
          fontSize:30,
          fontFamily:'Montserrat-Bold',
          left:20,
          top:70,
        },
     abstractImage:{
        height:350,
        width:350,
        position:'absolute',
        resizeMode: 'contain',
     },
     loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 20,
        fontFamily: 'Montserrat-Bold',
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 16,
        fontFamily: 'Montserrat-Regular',
        marginTop: 5,
        opacity: 0.7,
    }
})