import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project credentials
// You can find these in your Supabase project settings
const supabaseUrl = 'https://lhgtiuwbwfvosuapfmay.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoZ3RpdXdid2Z2b3N1YXBmbWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4Nzk0NTYsImV4cCI6MjA2OTQ1NTQ1Nn0.OgWXm2jDuTo3Uz16gEIC1TVzR8QgVlhrHEsef1NN6os';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database table names
export const TABLES = {
  USERS: 'users',
  USER_ROLES: 'user_roles',
  INCIDENT_INSTITUTION_MAPPING: 'incident_institution_mapping',
  INCIDENTS: 'incidents',
  INCIDENT_ACCESS_LOGS: 'incident_access_logs',
  NOTIFICATIONS: 'notifications',
  SAFETY_TIPS: 'safety_tips',
  EMERGENCY_CONTACTS: 'emergency_contacts',
  LOCATIONS: 'locations'
};

// User roles
export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  SECURITY: 'security',
  FIRE_SERVICE: 'fire_service',
  MEDICAL_SERVICE: 'medical_service',
  SCHOOL_MANAGEMENT: 'school_management',
  ADMIN: 'admin'
};

// Incident types
export const INCIDENT_TYPES = {
  SNAKE_BITE: 'snake_bite',
  FIRE_ATTACK: 'fire_attack',
  PICKPOCKETING: 'pickpocketing',
  THEFT: 'theft',
  ASSAULT: 'assault',
  HARASSMENT: 'harassment',
  VANDALISM: 'vandalism',
  MEDICAL: 'medical',
  OTHER: 'other'
};

// Real-time subscriptions
export const REALTIME_CHANNELS = {
  INCIDENTS: 'incidents',
  NOTIFICATIONS: 'notifications',
  EMERGENCY_ALERTS: 'emergency_alerts'
}; 