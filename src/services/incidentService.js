import { supabase, TABLES, USER_ROLES, INCIDENT_TYPES } from '../config/supabase';
import { roleService } from './roleService';
import { locationService } from './locationService';

// Incident Services with Role-Based Access Control
export const incidentService = {
  // Create a new incident report
  async createIncident(incidentData) {
    try {
      console.log('🔍 [incidentService] Starting incident creation...');
      console.log('📊 [incidentService] Incident data:', JSON.stringify(incidentData, null, 2));
      
      // Validate required fields
      if (!incidentData.user_id) {
        console.error('❌ [incidentService] Missing user_id in incident data');
        return { data: null, error: { message: 'User ID is required' } };
      }

      if (!incidentData.incident_type) {
        console.error('❌ [incidentService] Missing incident_type in incident data');
        return { data: null, error: { message: 'Incident type is required' } };
      }

      // Ensure the user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ [incidentService] Authentication error:', authError);
        return { data: null, error: { message: 'User not authenticated' } };
      }

      console.log('✅ [incidentService] User authenticated:', user.id);
      console.log('🔐 [incidentService] Current auth.uid():', user.id);

      // Handle location geocoding if location_description is provided
      let finalLatitude = incidentData.latitude || null;
      let finalLongitude = incidentData.longitude || null;
      let finalLocationDescription = incidentData.location_description || '';

      // If we have a location description but no coordinates, try to geocode it
      if (finalLocationDescription && (finalLatitude === null || finalLongitude === null)) {
        console.log('🔍 [incidentService] Geocoding location:', finalLocationDescription);
        
        try {
          const geocodedLocation = await locationService.geocodeLocation(finalLocationDescription);
          
          if (geocodedLocation) {
            finalLatitude = geocodedLocation.latitude;
            finalLongitude = geocodedLocation.longitude;
            // Update location description with the formatted address if available
            if (geocodedLocation.address) {
              finalLocationDescription = geocodedLocation.address;
            }
            console.log('✅ [incidentService] Location geocoded successfully:', {
              original: incidentData.location_description,
              coordinates: { latitude: finalLatitude, longitude: finalLongitude },
              formatted: finalLocationDescription
            });
          } else {
            console.log('⚠️ [incidentService] Could not geocode location, using campus coordinates as fallback');
            // Use campus coordinates as fallback if geocoding fails
            finalLatitude = 5.6064;
            finalLongitude = -0.2000;
          }
        } catch (geocodeError) {
          console.error('❌ [incidentService] Geocoding error:', geocodeError);
          // Use campus coordinates as fallback if geocoding fails
          finalLatitude = 5.6064;
          finalLongitude = -0.2000;
        }
      } else if (!finalLatitude || !finalLongitude) {
        // If no location description and no coordinates, use campus coordinates
        console.log('⚠️ [incidentService] No location or coordinates provided, using campus coordinates');
        finalLatitude = 5.6064;
        finalLongitude = -0.2000;
      }

      // Clean and validate the incident data
      const cleanedData = {
        user_id: incidentData.user_id,
        title: incidentData.title || 'Untitled Incident',
        description: incidentData.description || '',
        incident_type: incidentData.incident_type,
        status: incidentData.status || 'reported',
        latitude: finalLatitude,
        longitude: finalLongitude,
        location_description: finalLocationDescription,
        evidence_files: Array.isArray(incidentData.evidence_files) ? incidentData.evidence_files : [],
        witnesses: Array.isArray(incidentData.witnesses) ? incidentData.witnesses : [],
        reported_at: incidentData.reported_at || new Date().toISOString()
      };

      console.log('🧹 [incidentService] Cleaned incident data:', JSON.stringify(cleanedData, null, 2));
      console.log('🎯 [incidentService] Final coordinates for heatmap:', {
        latitude: cleanedData.latitude,
        longitude: cleanedData.longitude,
        location_description: cleanedData.location_description
      });

      // Attempt to create the incident
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .insert([cleanedData])
        .select();
      
      if (error) {
        console.error('❌ [incidentService] Supabase error:', error);
        console.error('❌ [incidentService] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [incidentService] Incident created successfully:', data);
      return { data, error: null };
    } catch (error) {
      console.error('💥 [incidentService] Unexpected error:', error);
      return { data: null, error };
    }
  },

  // Get incidents based on user role and permissions
  async getIncidents(userId = null) {
    try {
      // Let RLS policies handle the filtering instead of client-side role checking
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

  // Get a single incident by ID
  async getIncidentById(incidentId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INCIDENTS)
        .select('*')
        .eq('id', incidentId)
        .single();
      
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