import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { incidentService } from '../../services/incidentService';
import { roleService } from '../../services/roleService';
import { notificationService } from '../../services/notificationService';
import { USER_ROLES, INCIDENT_TYPES } from '../../config/supabase';
import { AuthContext } from '../../context/AuthContext';
import { formatLocationName } from '../../services/locationService';

const { width } = Dimensions.get('window');

export default function IncidentDetailScreen({ route, navigation }) {
  const { incidentId } = route.params;
  const { user } = useContext(AuthContext);
  const [incident, setIncident] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadIncidentData();
  }, [incidentId]);

  const loadIncidentData = async () => {
    try {
      setLoading(true);
      
      // Load user role
      const { data: roleData, error: roleError } = await roleService.getUserRole(user.id);
      if (roleError) throw roleError;
      setUserRole(roleData.role);
      
      // Load incident details directly by ID
      const { data: incident, error: incidentError } = await incidentService.getIncidentById(incidentId);
      
      if (incidentError) {
        console.error('Error fetching incident:', incidentError);
        Alert.alert('Error', 'Incident not found or access denied');
        navigation.goBack();
        return;
      }
      
      if (!incident) {
        console.log('No incident found with ID:', incidentId);
        Alert.alert('Error', 'Incident not found');
        navigation.goBack();
        return;
      }
      
      console.log('Found incident:', incident);
      setIncident(incident);
      
    } catch (error) {
      console.error('Error loading incident data:', error);
      Alert.alert('Error', 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const result = await incidentService.updateIncidentStatus(incidentId, newStatus);
      
      if (result.error) {
        Alert.alert('Error', 'Failed to update incident status');
        return;
      }
      
      // Update local state
      setIncident(prev => ({ ...prev, status: newStatus }));
      
      // Send notification to incident reporter
      if (incident.user_id !== user.id) {
        await notificationService.createNotification({
          user_id: incident.user_id,
          title: 'Incident Status Updated',
          message: `Your incident "${incident.title}" status has been updated to ${newStatus.replace('_', ' ')}`,
          type: 'status_update',
          related_incident_id: incidentId
        });
      }
      
      Alert.alert('Success', 'Incident status updated successfully');
      
    } catch (error) {
      console.error('Error updating incident status:', error);
      Alert.alert('Error', 'Failed to update incident status');
    } finally {
      setUpdating(false);
    }
  };

  const assignIncident = async () => {
    try {
      setUpdating(true);
      
      const result = await incidentService.assignIncident(incidentId, user.id);
      
      if (result.error) {
        Alert.alert('Error', 'Failed to assign incident');
        return;
      }
      
      // Update local state
      setIncident(prev => ({ ...prev, assigned_to: user.id, assigned_at: new Date().toISOString() }));
      
      Alert.alert('Success', 'Incident assigned to you successfully');
      
    } catch (error) {
      console.error('Error assigning incident:', error);
      Alert.alert('Error', 'Failed to assign incident');
    } finally {
      setUpdating(false);
    }
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

  const canUpdateStatus = () => {
    return [USER_ROLES.SCHOOL_MANAGEMENT, USER_ROLES.ADMIN, USER_ROLES.SECURITY, 
            USER_ROLES.FIRE_SERVICE, USER_ROLES.MEDICAL_SERVICE].includes(userRole);
  };

  const canAssign = () => {
    return [USER_ROLES.SCHOOL_MANAGEMENT, USER_ROLES.ADMIN].includes(userRole) ||
           (incident && !incident.assigned_to);
  };

  const showStatusUpdateDialog = () => {
    Alert.alert(
      'Update Status',
      'Select new status:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'In Progress', onPress: () => updateIncidentStatus('in_progress') },
        { text: 'Resolved', onPress: () => updateIncidentStatus('resolved') },
        { text: 'Urgent', onPress: () => updateIncidentStatus('urgent') }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#239DD6" />
        <Text style={styles.loadingText}>Loading incident details...</Text>
      </View>
    );
  }

  if (!incident) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorText}>Incident not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#239DD6', '#fff']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Incident Details</Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Incident Header */}
        <View style={styles.incidentHeader}>
          <View style={styles.incidentTypeSection}>
            <Ionicons 
              name={getIncidentTypeIcon(incident.incident_type)} 
              size={32} 
              color="#239DD6" 
            />
            <View style={styles.incidentTypeText}>
              <Text style={styles.incidentTypeLabel}>
                {incident.incident_type.replace('_', ' ').toUpperCase()}
              </Text>
              <Text style={styles.incidentTitle}>{incident.title}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
            <Text style={styles.statusText}>{incident.status.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{incident.description}</Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.locationText}>{incident.location_description}</Text>
          </View>
          {incident.latitude && incident.longitude && (
            <Text style={styles.coordinatesText}>
              {formatLocationName(incident.latitude, incident.longitude, incident.location_description)}
            </Text>
          )}
        </View>

        {/* Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Reported</Text>
              <Text style={styles.detailValue}>
                {new Date(incident.reported_at).toLocaleString()}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Reporter</Text>
              <Text style={styles.detailValue}>
                {incident.user_id === user.id ? 'You' : 'Anonymous'}
              </Text>
            </View>
            {incident.assigned_to && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Assigned To</Text>
                <Text style={styles.detailValue}>
                  {incident.assigned_to === user.id ? 'You' : 'Another User'}
                </Text>
              </View>
            )}
            {incident.assigned_at && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Assigned At</Text>
                <Text style={styles.detailValue}>
                  {new Date(incident.assigned_at).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Evidence */}
        {incident.evidence_files && incident.evidence_files.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Evidence</Text>
            <Text style={styles.evidenceText}>
              {incident.evidence_files.length} file(s) attached
            </Text>
          </View>
        )}

        {/* Witnesses */}
        {incident.witnesses && incident.witnesses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Witnesses</Text>
            <Text style={styles.witnessesText}>
              {incident.witnesses.length} witness(es) reported
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {canUpdateStatus() && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.updateButton]}
            onPress={showStatusUpdateDialog}
            disabled={updating}
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Update Status</Text>
          </TouchableOpacity>
        )}
        
        {canAssign() && !incident.assigned_to && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={assignIncident}
            disabled={updating}
          >
            <Ionicons name="briefcase-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Assign to Me</Text>
          </TouchableOpacity>
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#F44336',
    marginTop: 16,
    fontFamily: 'Montserrat-Bold',
  },
  backButtonText: {
    fontSize: 16,
    color: '#239DD6',
    fontFamily: 'Montserrat-Bold',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
    fontFamily: 'Montserrat-Bold',
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  incidentHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  incidentTypeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  incidentTypeText: {
    marginLeft: 12,
    flex: 1,
  },
  incidentTypeLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'Montserrat-Bold',
  },
  incidentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
    fontFamily: 'Montserrat-Bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Montserrat-Bold',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Montserrat-Regular',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Montserrat-Regular',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Montserrat-Regular',
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  evidenceText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  witnessesText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  assignButton: {
    backgroundColor: '#239DD6',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: 'Montserrat-Bold',
  },
}); 