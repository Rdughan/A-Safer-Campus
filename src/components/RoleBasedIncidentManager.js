import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { incidentService } from '../services/incidentService';
import { roleService } from '../services/roleService';
import { notificationService } from '../services/notificationService';
import { USER_ROLES, INCIDENT_TYPES } from '../config/supabase';
import CustomButton from './CustomButton';
import CustomText from './CustomText';

const RoleBasedIncidentManager = ({ userId, userRole }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [assignToUserId, setAssignToUserId] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadIncidents();
  }, [userId, userRole, filterType]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      let data;

      // Load incidents based on user role and filter
      if (filterType === 'assigned') {
        const result = await incidentService.getAssignedIncidents(userId);
        data = result.data || [];
      } else if (filterType === 'my') {
        const result = await incidentService.getIncidentsByUser(userId);
        data = result.data || [];
      } else if (filterType !== 'all') {
        const result = await incidentService.getIncidentsByType(filterType, userId);
        data = result.data || [];
      } else {
        const result = await incidentService.getAllIncidentsForHeatmap();
        data = result.data || [];
      }

      setIncidents(data);
    } catch (error) {
      console.error('Error loading incidents:', error);
      Alert.alert('Error', 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    setModalVisible(true);
  };

  const updateIncidentStatus = async () => {
    if (!selectedIncident || !newStatus) return;

    try {
      const result = await incidentService.updateIncidentStatus(
        selectedIncident.id,
        newStatus,
        userId
      );

      if (result.error) {
        Alert.alert('Error', 'Failed to update incident status');
        return;
      }

      // Send notification to the incident reporter
      await notificationService.createNotification({
        user_id: selectedIncident.user_id,
        title: 'Incident Status Updated',
        message: `Your incident "${selectedIncident.title}" status has been updated to ${newStatus}`,
        notification_type: 'incident',
        priority: 'medium'
      });

      Alert.alert('Success', 'Incident status updated successfully');
      setStatusModalVisible(false);
      setNewStatus('');
      loadIncidents();
    } catch (error) {
      console.error('Error updating incident status:', error);
      Alert.alert('Error', 'Failed to update incident status');
    }
  };

  const assignIncident = async () => {
    if (!selectedIncident || !assignToUserId) return;

    try {
      const result = await incidentService.assignIncident(
        selectedIncident.id,
        assignToUserId,
        userId
      );

      if (result.error) {
        Alert.alert('Error', 'Failed to assign incident');
        return;
      }

      // Send notification to assigned user
      await notificationService.createNotification({
        user_id: assignToUserId,
        title: 'New Incident Assigned',
        message: `You have been assigned to handle incident: "${selectedIncident.title}"`,
        notification_type: 'incident',
        priority: 'high'
      });

      Alert.alert('Success', 'Incident assigned successfully');
      setAssignModalVisible(false);
      setAssignToUserId('');
      loadIncidents();
    } catch (error) {
      console.error('Error assigning incident:', error);
      Alert.alert('Error', 'Failed to assign incident');
    }
  };

  const loadAvailableUsers = async () => {
    try {
      // Load users based on the incident type
      let roleToLoad = USER_ROLES.SCHOOL_MANAGEMENT; // Default

      if (selectedIncident) {
        switch (selectedIncident.incident_type) {
          case INCIDENT_TYPES.SNAKE_BITE:
            roleToLoad = USER_ROLES.MEDICAL_SERVICE;
            break;
          case INCIDENT_TYPES.FIRE_ATTACK:
            roleToLoad = USER_ROLES.FIRE_SERVICE;
            break;
          case INCIDENT_TYPES.PICKPOCKETING:
          case INCIDENT_TYPES.THEFT:
          case INCIDENT_TYPES.HARASSMENT:
          case INCIDENT_TYPES.VANDALISM:
            roleToLoad = USER_ROLES.SECURITY;
            break;
          case INCIDENT_TYPES.ASSAULT:
            roleToLoad = USER_ROLES.MEDICAL_SERVICE;
            break;
          case INCIDENT_TYPES.MEDICAL:
            roleToLoad = USER_ROLES.MEDICAL_SERVICE;
            break;
          default:
            roleToLoad = USER_ROLES.SCHOOL_MANAGEMENT;
        }
      }

      const result = await roleService.getUsersByRole(roleToLoad);
      if (result.data) {
        setAvailableUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading available users:', error);
    }
  };

  const getIncidentTypeColor = (type) => {
    switch (type) {
      case INCIDENT_TYPES.SNAKE_BITE:
        return '#FF6B6B';
      case INCIDENT_TYPES.FIRE_ATTACK:
        return '#FF4757';
      case INCIDENT_TYPES.PICKPOCKETING:
        return '#FFA502';
      case INCIDENT_TYPES.THEFT:
        return '#FF6348';
      case INCIDENT_TYPES.ASSAULT:
        return '#FF3838';
      case INCIDENT_TYPES.HARASSMENT:
        return '#FF9F43';
      case INCIDENT_TYPES.VANDALISM:
        return '#FF7675';
      case INCIDENT_TYPES.MEDICAL:
        return '#74B9FF';
      default:
        return '#636E72';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reported':
        return '#FFA502';
      case 'investigating':
        return '#74B9FF';
      case 'resolved':
        return '#00B894';
      case 'closed':
        return '#636E72';
      default:
        return '#636E72';
    }
  };

  const renderIncidentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.incidentItem}
      onPress={() => handleIncidentPress(item)}
    >
      <View style={styles.incidentHeader}>
        <View style={styles.incidentTypeContainer}>
          <View
            style={[
              styles.incidentTypeBadge,
              { backgroundColor: getIncidentTypeColor(item.incident_type) }
            ]}
          >
            <CustomText style={styles.incidentTypeText}>
              {item.incident_type.replace('_', ' ').toUpperCase()}
            </CustomText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}
          >
            <CustomText style={styles.statusText}>
              {item.status.toUpperCase()}
            </CustomText>
          </View>
        </View>
        <CustomText style={styles.incidentDate}>
          {new Date(item.reported_at).toLocaleDateString()}
        </CustomText>
      </View>

      <CustomText style={styles.incidentTitle}>{item.title}</CustomText>
      <CustomText style={styles.incidentDescription} numberOfLines={2}>
        {item.description}
      </CustomText>

      <View style={styles.incidentFooter}>
        <CustomText style={styles.reporterText}>
          Reported by: {item.users?.username || 'Unknown'}
        </CustomText>
        {item.assigned_user && (
          <CustomText style={styles.assignedText}>
            Assigned to: {item.assigned_user.username}
          </CustomText>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filterType === 'all' && styles.activeFilterButton]}
        onPress={() => setFilterType('all')}
      >
        <CustomText style={[styles.filterText, filterType === 'all' && styles.activeFilterText]}>
          All
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filterType === 'assigned' && styles.activeFilterButton]}
        onPress={() => setFilterType('assigned')}
      >
        <CustomText style={[styles.filterText, filterType === 'assigned' && styles.activeFilterText]}>
          Assigned
        </CustomText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filterType === 'my' && styles.activeFilterButton]}
        onPress={() => setFilterType('my')}
      >
        <CustomText style={[styles.filterText, filterType === 'my' && styles.activeFilterText]}>
          My Reports
        </CustomText>
      </TouchableOpacity>
      {userRole === USER_ROLES.SECURITY && (
        <TouchableOpacity
          style={[styles.filterButton, filterType === INCIDENT_TYPES.PICKPOCKETING && styles.activeFilterButton]}
          onPress={() => setFilterType(INCIDENT_TYPES.PICKPOCKETING)}
        >
          <CustomText style={[styles.filterText, filterType === INCIDENT_TYPES.PICKPOCKETING && styles.activeFilterText]}>
            Pickpocketing
          </CustomText>
        </TouchableOpacity>
      )}
      {userRole === USER_ROLES.FIRE_SERVICE && (
        <TouchableOpacity
          style={[styles.filterButton, filterType === INCIDENT_TYPES.FIRE_ATTACK && styles.activeFilterButton]}
          onPress={() => setFilterType(INCIDENT_TYPES.FIRE_ATTACK)}
        >
          <CustomText style={[styles.filterText, filterType === INCIDENT_TYPES.FIRE_ATTACK && styles.activeFilterText]}>
            Fire Attacks
          </CustomText>
        </TouchableOpacity>
      )}
      {userRole === USER_ROLES.MEDICAL_SERVICE && (
        <TouchableOpacity
          style={[styles.filterButton, filterType === INCIDENT_TYPES.SNAKE_BITE && styles.activeFilterButton]}
          onPress={() => setFilterType(INCIDENT_TYPES.SNAKE_BITE)}
        >
          <CustomText style={[styles.filterText, filterType === INCIDENT_TYPES.SNAKE_BITE && styles.activeFilterText]}>
            Snake Bites
          </CustomText>
        </TouchableOpacity>
      )}
      {userRole === USER_ROLES.MEDICAL_SERVICE && (
        <TouchableOpacity
          style={[styles.filterButton, filterType === INCIDENT_TYPES.MEDICAL && styles.activeFilterButton]}
          onPress={() => setFilterType(INCIDENT_TYPES.MEDICAL)}
        >
          <CustomText style={[styles.filterText, filterType === INCIDENT_TYPES.MEDICAL && styles.activeFilterText]}>
            Medical Emergencies
          </CustomText>
        </TouchableOpacity>
      )}
      {userRole === USER_ROLES.SCHOOL_MANAGEMENT && (
        <TouchableOpacity
          style={[styles.filterButton, filterType === INCIDENT_TYPES.SNAKE_BITE && styles.activeFilterButton]}
          onPress={() => setFilterType(INCIDENT_TYPES.SNAKE_BITE)}
        >
          <CustomText style={[styles.filterText, filterType === INCIDENT_TYPES.SNAKE_BITE && styles.activeFilterText]}>
            Snake Bites
          </CustomText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {renderFilterButtons()}

      <FlatList
        data={incidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomText style={styles.emptyText}>
              {loading ? 'Loading incidents...' : 'No incidents found'}
            </CustomText>
          </View>
        }
      />

      {/* Incident Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedIncident && (
                <>
                  <View style={styles.modalHeader}>
                    <CustomText style={styles.modalTitle}>{selectedIncident.title}</CustomText>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <CustomText style={styles.closeButton}>✕</CustomText>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalSection}>
                    <CustomText style={styles.sectionTitle}>Description</CustomText>
                    <CustomText style={styles.sectionContent}>{selectedIncident.description}</CustomText>
                  </View>

                  <View style={styles.modalSection}>
                    <CustomText style={styles.sectionTitle}>Details</CustomText>
                    <CustomText style={styles.sectionContent}>
                      Type: {selectedIncident.incident_type.replace('_', ' ').toUpperCase()}
                    </CustomText>
                    <CustomText style={styles.sectionContent}>
                      Status: {selectedIncident.status.toUpperCase()}
                    </CustomText>
                    <CustomText style={styles.sectionContent}>
                      Reported: {new Date(selectedIncident.reported_at).toLocaleString()}
                    </CustomText>
                    {selectedIncident.location_description && (
                      <CustomText style={styles.sectionContent}>
                        Location: {selectedIncident.location_description}
                      </CustomText>
                    )}
                  </View>

                  <View style={styles.modalSection}>
                    <CustomText style={styles.sectionTitle}>Reporter</CustomText>
                    <CustomText style={styles.sectionContent}>
                      {selectedIncident.users?.username || 'Unknown'}
                    </CustomText>
                  </View>

                  {selectedIncident.assigned_user && (
                    <View style={styles.modalSection}>
                      <CustomText style={styles.sectionTitle}>Assigned To</CustomText>
                      <CustomText style={styles.sectionContent}>
                        {selectedIncident.assigned_user.username}
                      </CustomText>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    {(userRole === USER_ROLES.SCHOOL_MANAGEMENT || 
                      userRole === USER_ROLES.ADMIN || 
                      selectedIncident.assigned_to === userId) && (
                      <CustomButton
                        title="Update Status"
                        onPress={() => {
                          setModalVisible(false);
                          setStatusModalVisible(true);
                        }}
                        style={styles.actionButton}
                      />
                    )}

                    {(userRole === USER_ROLES.SCHOOL_MANAGEMENT || userRole === USER_ROLES.ADMIN) && (
                      <CustomButton
                        title="Assign Incident"
                        onPress={() => {
                          setModalVisible(false);
                          loadAvailableUsers();
                          setAssignModalVisible(true);
                        }}
                        style={styles.actionButton}
                      />
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Update Incident Status</CustomText>
            
            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>New Status</CustomText>
              <TextInput
                style={styles.textInput}
                value={newStatus}
                onChangeText={setNewStatus}
                placeholder="Enter new status"
              />
            </View>

            <View style={styles.modalActions}>
              <CustomButton
                title="Update"
                onPress={updateIncidentStatus}
                style={styles.actionButton}
              />
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setStatusModalVisible(false);
                  setNewStatus('');
                }}
                style={[styles.actionButton, styles.cancelButton]}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Assign Incident Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={assignModalVisible}
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <CustomText style={styles.modalTitle}>Assign Incident</CustomText>
            
            <View style={styles.inputContainer}>
              <CustomText style={styles.inputLabel}>Assign To</CustomText>
              <TextInput
                style={styles.textInput}
                value={assignToUserId}
                onChangeText={setAssignToUserId}
                placeholder="Enter user ID"
              />
            </View>

            <View style={styles.modalActions}>
              <CustomButton
                title="Assign"
                onPress={assignIncident}
                style={styles.actionButton}
              />
              <CustomButton
                title="Cancel"
                onPress={() => {
                  setAssignModalVisible(false);
                  setAssignToUserId('');
                }}
                style={[styles.actionButton, styles.cancelButton]}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeFilterButton: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  incidentItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
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
    marginBottom: 8,
  },
  incidentTypeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  incidentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  incidentTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  incidentDate: {
    color: '#666',
    fontSize: 12,
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  incidentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterText: {
    fontSize: 12,
    color: '#999',
  },
  assignedText: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
  },
  modalSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
});

export default RoleBasedIncidentManager; 