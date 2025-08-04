import { supabase, TABLES, USER_ROLES } from '../config/supabase';

// Role and Permission Services
export const roleService = {
  // Get user's role
  async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('role, department')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check if user has access to incident type
  async hasIncidentAccess(userId, incidentType) {
    try {
      const { data: userRole, error: roleError } = await this.getUserRole(userId);
      if (roleError) throw roleError;

      // School management and admin have access to all incidents
      if (userRole.role === USER_ROLES.SCHOOL_MANAGEMENT || userRole.role === USER_ROLES.ADMIN) {
        return { hasAccess: true, error: null };
      }

      // Check institution mapping for specific access
      const { data, error } = await supabase
        .from(TABLES.INCIDENT_INSTITUTION_MAPPING)
        .select('*')
        .eq('incident_type', incidentType)
        .eq('institution_role', userRole.role)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      return { hasAccess: !!data, error: null };
    } catch (error) {
      return { hasAccess: false, error };
    }
  },

  // Get all users by role
  async getUsersByRole(role) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('id, username, student_id, department, role')
        .eq('role', role);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user role (admin only)
  async updateUserRole(userId, newRole, department = null) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ role: newRole, department })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}; 