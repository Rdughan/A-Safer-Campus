import { supabase, TABLES } from '../config/supabase';
import { roleService } from './roleService';

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