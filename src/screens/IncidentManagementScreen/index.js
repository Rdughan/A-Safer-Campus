import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoleBasedIncidentManager from '../../components/RoleBasedIncidentManager';
import { roleService } from '../../services/roleService';
import { AuthContext } from '../../context/AuthContext';
import CustomText from '../../components/CustomText';

export default function IncidentManagementScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [userRole, setUserRole] = useState('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, [user]);

  const loadUserRole = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const result = await roleService.getUserRole(user.id);
      if (result.data) {
        setUserRole(result.data.role);
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'student':
        return 'Student';
      case 'faculty':
        return 'Faculty';
      case 'security':
        return 'Security Services';
      case 'fire_service':
        return 'Fire Service';
      case 'medical_service':
        return 'Medical Services';
      case 'school_management':
        return 'School Management';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <CustomText style={styles.loadingText}>Loading...</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <CustomText style={styles.headerTitle}>Incident Management</CustomText>
          <CustomText style={styles.roleText}>
            {getRoleDisplayName(userRole)}
          </CustomText>
        </View>
      </View>

      {/* Incident Manager */}
      <RoleBasedIncidentManager 
        userId={user?.id} 
        userRole={userRole} 
      />
    </SafeAreaView>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  roleText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
}); 