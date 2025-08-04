import { supabase, TABLES, USER_ROLES, INCIDENT_TYPES } from '../config/supabase';
import { roleService } from './roleService';

// Incident Services with Role-Based Access Control
export const incidentService = {
  // Create a new incident report
  async createIncident(incidentData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .insert([incidentData])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get incidents based on user role and permissions
  async getIncidents(userId = null) {
    try {
      let query = supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .order('reported_at', { ascending: false });

      // If userId is provided, filter based on role permissions
      if (userId) {
        const { data: userRole, error: roleError } = await roleService.getUserRole(userId);
        if (roleError) throw roleError;

        // Students can only see their own incidents
        if (userRole.role === USER_ROLES.STUDENT) {
          query = query.eq('user_id', userId);
        }
        // Faculty can see incidents in their department
        else if (userRole.role === USER_ROLES.FACULTY) {
          // This would need department-based filtering if implemented
          query = query.eq('user_id', userId);
        }
        // Other roles (security, fire_service, medical_service, school_management, admin) can see all incidents
        // due to RLS policies
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get all incidents for heatmap display (bypasses user filtering)
  async getAllIncidentsForHeatmap() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get incidents by user
  async getIncidentsByUser(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .eq('user_id', userId)
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get incidents by type (for institution-specific access)
  async getIncidentsByType(incidentType, userId = null) {
    try {
      let query = supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .eq('incident_type', incidentType)
        .order('reported_at', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get assigned incidents for a user
  async getAssignedIncidents(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .eq('assigned_to', userId)
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update incident status
  async updateIncidentStatus(incidentId, status, userId = null) {
    try {
      const updateData = { status };
      
      // If status is being resolved, add resolved timestamp
      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .update(updateData)
        .eq('id', incidentId)
        .select();
      
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Assign incident to a user
  async assignIncident(incidentId, assignedUserId, assignedByUserId = null) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .update({ 
          assigned_to: assignedUserId,
          assigned_at: new Date().toISOString()
        })
        .eq('id', incidentId)
        .select();
      
      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Log incident access
  async logIncidentAccess(incidentId, userId, action, details = {}) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENT_ACCESS_LOGS)
        .insert([{
          incident_id: incidentId,
          user_id: userId,
          action,
          details
        }]);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get incidents by location (within radius)
  async getIncidentsByLocation(latitude, longitude, radius = 1000, userId = null) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .order('reported_at', { ascending: false });
      
      if (error) throw error;
      
      // Filter by distance (simplified)
      const filteredData = data.filter(incident => {
        if (!incident.latitude || !incident.longitude) return false;
        
        const distance = calculateDistance(
          latitude, longitude,
          incident.latitude, incident.longitude
        );
        
        return distance <= radius;
      });
      
      return { data: filteredData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get incident statistics by type
  async getIncidentStats(userId = null) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('incident_type, status, created_at');
      
      if (error) throw error;

      // Group by incident type and status
      const stats = {};
      data.forEach(incident => {
        if (!stats[incident.incident_type]) {
          stats[incident.incident_type] = { total: 0, reported: 0, investigating: 0, resolved: 0, closed: 0 };
        }
        stats[incident.incident_type].total++;
        stats[incident.incident_type][incident.status]++;
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Utility function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}