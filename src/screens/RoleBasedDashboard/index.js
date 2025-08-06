import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  RefreshControl, Alert, Dimensions, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { incidentService } from '../../services/incidentService';
import { roleService } from '../../services/roleService';
import { notificationService } from '../../services/notificationService';
import { USER_ROLES, INCIDENT_TYPES } from '../../config/supabase';
import { AuthContext } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RoleBasedDashboard({ navigation }) {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    if (userRole) {
      loadDashboardData();
    }
  }, [userRole, selectedFilter]);

  // Refresh dashboard when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (userRole) {
        loadDashboardData();
      }
    });

    return unsubscribe;
  }, [navigation, userRole]);

  const loadUserRole = async () => {
    try {
      const { data, error } = await roleService.getUserRole(user.id);
      if (error) throw error;
      setUserRole(data.role);
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole('student'); // Default fallback
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      let incidentsData = [];
      
      // Load incidents based on role and filter
      switch (selectedFilter) {
        case 'all':
          const { data: allIncidents, error: allError } = await incidentService.getIncidents();
          if (allError) throw allError;
          incidentsData = allIncidents || [];
          break;
        case 'my':
          const { data: myIncidents, error: myError } = await incidentService.getIncidentsByUser(user.id);
          if (myError) throw myError;
          incidentsData = myIncidents || [];
          break;
        case 'assigned':
          const { data: assignedIncidents, error: assignedError } = await incidentService.getAssignedIncidents(user.id);
          if (assignedError) throw assignedError;
          incidentsData = assignedIncidents || [];
          break;
        default:
          const { data: defaultIncidents, error: defaultError } = await incidentService.getIncidents();
          if (defaultError) throw defaultError;
          incidentsData = defaultIncidents || [];
      }

      console.log('Raw incidents data:', incidentsData.length, 'incidents');

      // Filter incidents based on user role
      const filteredIncidents = filterIncidentsByRole(incidentsData, userRole);
      console.log('Filtered incidents:', filteredIncidents.length, 'incidents');
      setIncidents(filteredIncidents);

      // Calculate stats
      const statsData = calculateStats(filteredIncidents);
      setStats(statsData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filterIncidentsByRole = (incidents, role) => {
    if (!incidents || !Array.isArray(incidents)) {
      console.log('No incidents or not an array:', incidents);
      return [];
    }

    console.log('Filtering incidents for role:', role, 'Total incidents:', incidents.length);

    switch (role) {
      case USER_ROLES.SCHOOL_MANAGEMENT:
      case USER_ROLES.ADMIN:
        // Management sees all incidents
        console.log('Management role - showing all incidents');
        return incidents;
      
      case USER_ROLES.SECURITY:
        // Security sees security-related incidents
        const securityIncidents = incidents.filter(incident => 
          [INCIDENT_TYPES.PICKPOCKETING, INCIDENT_TYPES.THEFT, INCIDENT_TYPES.ASSAULT, 
           INCIDENT_TYPES.HARASSMENT, INCIDENT_TYPES.VANDALISM].includes(incident.incident_type)
        );
        console.log('Security role - showing', securityIncidents.length, 'incidents');
        return securityIncidents;
      
      case USER_ROLES.FIRE_SERVICE:
        // Fire service sees fire-related incidents
        const fireIncidents = incidents.filter(incident => 
          [INCIDENT_TYPES.FIRE_ATTACK, INCIDENT_TYPES.MEDICAL].includes(incident.incident_type)
        );
        console.log('Fire service role - showing', fireIncidents.length, 'incidents');
        return fireIncidents;
      
      case USER_ROLES.MEDICAL_SERVICE:
        // Medical service sees medical-related incidents
        const medicalIncidents = incidents.filter(incident => 
          [INCIDENT_TYPES.SNAKE_BITE, INCIDENT_TYPES.MEDICAL].includes(incident.incident_type)
        );
        console.log('Medical service role - showing', medicalIncidents.length, 'incidents');
        return medicalIncidents;
      
      case USER_ROLES.FACULTY:
        // Faculty sees incidents in their area/department
        const facultyIncidents = incidents.filter(incident => 
          incident.incident_type !== INCIDENT_TYPES.OTHER
        );
        console.log('Faculty role - showing', facultyIncidents.length, 'incidents');
        return facultyIncidents;
      
      case USER_ROLES.STUDENT:
      default:
        // Students see their own incidents and general campus incidents
        const studentIncidents = incidents.filter(incident => 
          incident.user_id === user.id || 
          [INCIDENT_TYPES.SNAKE_BITE, INCIDENT_TYPES.FIRE_ATTACK, INCIDENT_TYPES.PICKPOCKETING].includes(incident.incident_type)
        );
        console.log('Student role - showing', studentIncidents.length, 'incidents');
        return studentIncidents;
    }
  };

  const calculateStats = (incidents) => {
    const total = incidents.length;
    const reported = incidents.filter(i => i.status === 'reported').length;
    const inProgress = incidents.filter(i => i.status === 'in_progress').length;
    const resolved = incidents.filter(i => i.status === 'resolved').length;
    const urgent = incidents.filter(i => i.status === 'urgent').length;

    return { total, reported, inProgress, resolved, urgent };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      [USER_ROLES.STUDENT]: 'Student',
      [USER_ROLES.FACULTY]: 'Faculty',
      [USER_ROLES.SECURITY]: 'Security Services',
      [USER_ROLES.FIRE_SERVICE]: 'Fire Service',
      [USER_ROLES.MEDICAL_SERVICE]: 'Medical Service',
      [USER_ROLES.SCHOOL_MANAGEMENT]: 'School Management',
      [USER_ROLES.ADMIN]: 'Administrator'
    };
    return roleNames[role] || 'User';
  };

  const getRoleColor = (role) => {
    const colors = {
      [USER_ROLES.STUDENT]: '#239DD6',
      [USER_ROLES.FACULTY]: '#239DD6',
      [USER_ROLES.SECURITY]: '#239DD6',
      [USER_ROLES.FIRE_SERVICE]: '#239DD6',
      [USER_ROLES.MEDICAL_SERVICE]: '#239DD6',
      [USER_ROLES.SCHOOL_MANAGEMENT]: '#239DD6',
      [USER_ROLES.ADMIN]: '#239DD6'
    };
    return colors[role] || '#239DD6';
  };

  const getIncidentTypeIcon = (type) => {
    const icons = {
      [INCIDENT_TYPES.SNAKE_BITE]: 'medical-outline',
      [INCIDENT_TYPES.FIRE_ATTACK]: 'flame-outline',
      [INCIDENT_TYPES.PICKPOCKETING]: 'hand-left-outline',
      [INCIDENT_TYPES.THEFT]: 'bag-outline',
      [INCIDENT_TYPES.ASSAULT]: 'warning-outline',
      [INCIDENT_TYPES.HARASSMENT]: 'person-remove-outline',
      [INCIDENT_TYPES.VANDALISM]: 'construct-outline',
      [INCIDENT_TYPES.MEDICAL]: 'medical-outline',
      [INCIDENT_TYPES.OTHER]: 'ellipsis-horizontal-outline'
    };
    return icons[type] || 'alert-circle-outline';
  };

  const getStatusColor = (status) => {
    const colors = {
      'reported': '#FF9800',
      'in_progress': '#2196F3',
      'resolved': '#4CAF50',
      'urgent': '#F44336'
    };
    return colors[status] || '#666';
  };

  const renderStatsCard = (title, value, icon, color) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsContent}>
        <Ionicons name={icon} size={24} color={color} />
        <View style={styles.statsText}>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsLabel}>{title}</Text>
        </View>
      </View>
    </View>
  );

  const renderIncidentCard = (incident) => (
    <TouchableOpacity 
      key={incident.id} 
      style={styles.incidentCard}
      onPress={() => navigation.navigate('IncidentDetail', { incidentId: incident.id })}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.incidentType}>
          <Ionicons 
            name={getIncidentTypeIcon(incident.incident_type)} 
            size={20} 
            color={getRoleColor(userRole)} 
          />
          <Text style={styles.incidentTypeText}>
            {incident.incident_type.replace('_', ' ').toUpperCase()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
          <Text style={styles.statusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.incidentTitle} numberOfLines={1}>
        {incident.title}
      </Text>
      
      <Text style={styles.incidentDescription} numberOfLines={2}>
        {incident.description}
      </Text>
      
      <View style={styles.incidentFooter}>
        <Text style={styles.incidentLocation}>
          <Ionicons name="location-outline" size={14} /> {incident.location_description}
        </Text>
        <Text style={styles.incidentTime}>
          {new Date(incident.reported_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={getRoleColor(userRole)} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[getRoleColor(userRole), '#fff']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.roleText}>{getRoleDisplayName(userRole)} Dashboard</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatsCard('Total', stats.total, 'list-outline', getRoleColor(userRole))}
            {renderStatsCard('Reported', stats.reported, 'document-text-outline', '#FF9800')}
            {renderStatsCard('In Progress', stats.inProgress, 'time-outline', '#239DD6')}
            {renderStatsCard('Resolved', stats.resolved, 'checkmark-circle-outline', '#239DD6')}
          </View>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Incidents</Text>
          <View style={styles.filterButtons}>
            {[
              { key: 'all', label: 'All', icon: 'list-outline' },
              { key: 'my', label: 'My Reports', icon: 'person-outline' },
              { key: 'assigned', label: 'Assigned', icon: 'briefcase-outline' }
            ].map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && { backgroundColor: getRoleColor(userRole) }
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Ionicons 
                  name={filter.icon} 
                  size={16} 
                  color={selectedFilter === filter.key ? 'white' : '#666'} 
                />
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.key && { color: 'white' }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Incidents List */}
        <View style={styles.incidentsSection}>
          {incidents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No incidents found</Text>
              <Text style={styles.emptyStateSubtext}>
                {selectedFilter === 'all' ? 'No incidents match your role criteria' :
                 selectedFilter === 'my' ? 'You haven\'t reported any incidents yet' :
                 'No incidents are assigned to you'}
              </Text>
            </View>
          ) : (
            incidents.map(renderIncidentCard)
          )}
        </View>
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: getRoleColor(userRole) }]}
          onPress={() => navigation.navigate('ReportIncident')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.actionButtonText}>Report Incident</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Montserrat-Regular',
  },
  roleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'Montserrat-Bold',
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Montserrat-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: (width - 60) / 2,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    marginLeft: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Montserrat-Bold',
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  filterSection: {
    marginTop: 20,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  incidentsSection: {
    marginTop: 20,
    marginBottom: 100,
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  incidentType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incidentTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Montserrat-Bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'Montserrat-Bold',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Montserrat-Regular',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  incidentLocation: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  incidentTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 16,
    fontFamily: 'Montserrat-Bold',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Montserrat-Regular',
  },
  quickActions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Montserrat-Bold',
  },
}); 