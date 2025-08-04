import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { supabase } from '../config/supabase';
import { USER_ROLES, INCIDENT_TYPES } from '../config/supabase';

const InstitutionDashboard = ({ userRole, userId }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    urgent: 0,
    pending: 0,
    resolved: 0
  });

  useEffect(() => {
    loadInstitutionData();
  }, [userRole]);

  const loadInstitutionData = async () => {
    try {
      setLoading(true);
      
      // Get incidents based on institution role
      let { data: incidentsData, error } = await supabase
        .from('incidents')
        .select(`
          *,
          users!incidents_user_id_fkey(username, student_id, phone),
          assigned_user:users!incidents_assigned_to_fkey(username, role)
        `)
        .or(`assigned_to.eq.${userId},user_id.eq.${userId}`)
        .order('reported_at', { ascending: false });

      if (error) throw error;

      // Filter incidents based on institution role
      const filteredIncidents = incidentsData.filter(incident => {
        switch (userRole) {
          case USER_ROLES.MEDICAL_SERVICE:
            return ['snake_bite', 'assault', 'medical'].includes(incident.incident_type);
          case USER_ROLES.FIRE_SERVICE:
            return incident.incident_type === 'fire_attack';
          case USER_ROLES.SECURITY:
            return ['pickpocketing', 'theft', 'assault', 'harassment', 'vandalism'].includes(incident.incident_type);
          case USER_ROLES.SCHOOL_MANAGEMENT:
            return true; // Can see all incidents
          default:
            return false;
        }
      });

      setIncidents(filteredIncidents);

      // Calculate statistics
      const urgentCount = filteredIncidents.filter(i => 
        ['snake_bite', 'fire_attack', 'assault'].includes(i.incident_type)
      ).length;
      
      const pendingCount = filteredIncidents.filter(i => 
        ['reported', 'investigating'].includes(i.status)
      ).length;
      
      const resolvedCount = filteredIncidents.filter(i => 
        ['resolved', 'closed'].includes(i.status)
      ).length;

      setStats({
        total: filteredIncidents.length,
        urgent: urgentCount,
        pending: pendingCount,
        resolved: resolvedCount
      });

    } catch (error) {
      console.error('Error loading institution data:', error);
      Alert.alert('Error', 'Failed to load incident data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInstitutionData();
    setRefreshing(false);
  };

  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId);

      if (error) throw error;

      Alert.alert('Success', 'Incident status updated');
      loadInstitutionData(); // Refresh data
    } catch (error) {
      console.error('Error updating incident:', error);
      Alert.alert('Error', 'Failed to update incident status');
    }
  };

  const getInstitutionName = () => {
    switch (userRole) {
      case USER_ROLES.MEDICAL_SERVICE:
        return 'Medical Services';
      case USER_ROLES.FIRE_SERVICE:
        return 'Fire Services';
      case USER_ROLES.SECURITY:
        return 'Security Services';
      case USER_ROLES.SCHOOL_MANAGEMENT:
        return 'School Management';
      default:
        return 'Institution';
    }
  };

  const getInstitutionColor = () => {
    switch (userRole) {
      case USER_ROLES.MEDICAL_SERVICE:
        return '#e74c3c'; // Red for medical
      case USER_ROLES.FIRE_SERVICE:
        return '#f39c12'; // Orange for fire
      case USER_ROLES.SECURITY:
        return '#3498db'; // Blue for security
      case USER_ROLES.SCHOOL_MANAGEMENT:
        return '#2ecc71'; // Green for management
      default:
        return '#95a5a6';
    }
  };

  const getIncidentTypeDisplay = (type) => {
    switch (type) {
      case 'snake_bite':
        return 'Snake Bite';
      case 'fire_attack':
        return 'Fire Emergency';
      case 'pickpocketing':
        return 'Pickpocketing';
      case 'theft':
        return 'Theft';
      case 'assault':
        return 'Assault';
      case 'harassment':
        return 'Harassment';
      case 'vandalism':
        return 'Vandalism';
      case 'medical':
        return 'Medical Emergency';
      default:
        return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return '#e74c3c';
      case 'investigating':
        return '#f39c12';
      case 'resolved':
        return '#27ae60';
      case 'closed':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getPriorityColor = (type) => {
    if (['snake_bite', 'fire_attack'].includes(type)) return '#e74c3c';
    if (['assault', 'medical'].includes(type)) return '#f39c12';
    return '#3498db';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading {getInstitutionName()} Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: getInstitutionColor() }]}>
        <Text style={styles.headerTitle}>{getInstitutionName()} Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {stats.total} Total Incidents • {stats.urgent} Urgent • {stats.pending} Pending
        </Text>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#e74c3c' }]}>
          <Text style={styles.statNumber}>{stats.urgent}</Text>
          <Text style={styles.statLabel}>Urgent</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#f39c12' }]}>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#27ae60' }]}>
          <Text style={styles.statNumber}>{stats.resolved}</Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Incidents List */}
      <View style={styles.incidentsContainer}>
        <Text style={styles.sectionTitle}>Recent Incidents</Text>
        
        {incidents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No incidents assigned to {getInstitutionName()}</Text>
          </View>
        ) : (
          incidents.map((incident) => (
            <View key={incident.id} style={styles.incidentCard}>
              <View style={styles.incidentHeader}>
                <View style={styles.incidentTypeContainer}>
                  <View 
                    style={[
                      styles.priorityIndicator, 
                      { backgroundColor: getPriorityColor(incident.incident_type) }
                    ]} 
                  />
                  <Text style={styles.incidentType}>
                    {getIncidentTypeDisplay(incident.incident_type)}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                  <Text style={styles.statusText}>{incident.status}</Text>
                </View>
              </View>

              <Text style={styles.incidentTitle}>{incident.title}</Text>
              <Text style={styles.incidentDescription}>{incident.description}</Text>

              <View style={styles.incidentDetails}>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Reported by:</Text> {incident.users?.username || 'Unknown'}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Location:</Text> {incident.location_description || 'Not specified'}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Time:</Text> {new Date(incident.reported_at).toLocaleString()}
                </Text>
              </View>

              {/* Action Buttons */}
              {incident.status !== 'resolved' && incident.status !== 'closed' && (
                <View style={styles.actionButtons}>
                  {incident.status === 'reported' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
                      onPress={() => updateIncidentStatus(incident.id, 'investigating')}
                    >
                      <Text style={styles.actionButtonText}>Start Investigation</Text>
                    </TouchableOpacity>
                  )}
                  
                  {incident.status === 'investigating' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
                      onPress={() => updateIncidentStatus(incident.id, 'resolved')}
                    >
                      <Text style={styles.actionButtonText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  incidentsContainer: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  incidentCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  incidentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  incidentType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  incidentDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  incidentDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  detailLabel: {
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default InstitutionDashboard; 