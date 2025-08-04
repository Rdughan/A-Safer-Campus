import { supabase, TABLES, USER_ROLES, INCIDENT_TYPES } from '../config/supabase';
import { roleService } from './roleService';

// Authentication Services
export const authService = {
  // Sign up with email and password
  async signUp(email, password, userData = {}, redirectTo = null) {
    try {
      const signUpOptions = {
        email,
        password,
        options: {
          data: userData
        }
      };

      // Add redirectTo if provided
      if (redirectTo) {
        signUpOptions.options.redirectTo = redirectTo;
      }

      const { data, error } = await supabase.auth.signUp(signUpOptions);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  getCurrentUser() {
    return supabase.auth.getUser();
  },

  // Listen to auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};





// Notification Services
export const notificationService = {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert([notificationData])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get notifications for a user
  async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .update({ read: true })
        .eq('id', notificationId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Subscribe to real-time notifications
  subscribeToNotifications(userId, callback) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: TABLES.NOTIFICATIONS,
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  // Send notification to users by role
  async sendNotificationToRole(role, notificationData) {
    try {
      // Get all users with the specified role
      const { data: users, error: usersError } = await roleService.getUsersByRole(role);
      if (usersError) throw usersError;

      // Create notifications for each user
      const notifications = users.map(user => ({
        ...notificationData,
        user_id: user.id
      }));

      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert(notifications)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// User Profile Services
export const userService = {
  // Create or update user profile
  async upsertUserProfile(userId, profileData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .upsert([{ id: userId, ...profileData }])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user preferences
  async updatePreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update({ preferences })
        .eq('id', userId)
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
};

// Emergency Contacts Services
export const emergencyService = {
  // Add emergency contact
  async addEmergencyContact(userId, contactData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMERGENCY_CONTACTS)
        .insert([{ user_id: userId, ...contactData }])
        .select();
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get emergency contacts for user
  async getEmergencyContacts(userId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EMERGENCY_CONTACTS)
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Send emergency alert
  async sendEmergencyAlert(userId, alertData) {
    try {
      // Create emergency notification
      const { data, error } = await supabase
        .from(TABLES.NOTIFICATIONS)
        .insert([{
          user_id: userId,
          type: 'emergency',
          title: 'Emergency Alert',
          message: alertData.message,
          priority: 'high',
          ...alertData
        }])
        .select();
      
      if (error) throw error;
      return { data, error: null };
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