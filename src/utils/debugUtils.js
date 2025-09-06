import { supabase } from '../config/supabase';

// Debug utilities to help identify issues
export const debugUtils = {
  // Check authentication status
  async checkAuthStatus() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('🔐 [debugUtils] Auth status check:', { user: user?.id, error });
      return { user, error };
    } catch (error) {
      console.error('❌ [debugUtils] Auth check failed:', error);
      return { user: null, error };
    }
  },

  // Check if user exists in the users table
  async checkUserInTable(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role, student_id, username')
        .eq('id', userId)
        .single();
      
      console.log('👤 [debugUtils] User in table check:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('❌ [debugUtils] User table check failed:', error);
      return { data: null, error };
    }
  },

  // Test incident table access
  async testIncidentAccess() {
    try {
      // Test SELECT access
      const { data: selectData, error: selectError } = await supabase
        .from('incidents')
        .select('count')
        .limit(1);
      
      console.log('📖 [debugUtils] SELECT access test:', { data: selectData, error: selectError });

      // Test INSERT access (this will fail due to missing data, but we can see the error)
      const { data: insertData, error: insertError } = await supabase
        .from('incidents')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
          title: 'Test Incident',
          incident_type: 'other'
        }])
        .select();
      
      console.log('✏️ [debugUtils] INSERT access test:', { data: insertData, error: insertError });

      return {
        select: { data: selectData, error: selectError },
        insert: { data: insertData, error: insertError }
      };
    } catch (error) {
      console.error('❌ [debugUtils] Incident access test failed:', error);
      return { select: { data: null, error }, insert: { data: null, error } };
    }
  },

  // Check RLS policies
  async checkRLSPolicies() {
    try {
      const { data, error } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'incidents');
      
      console.log('🛡️ [debugUtils] RLS policies:', { data, error });
      return { data, error };
    } catch (error) {
      console.error('❌ [debugUtils] RLS policy check failed:', error);
      return { data: null, error };
    }
  },

  // Comprehensive diagnostic
  async runDiagnostics() {
    console.log('🔍 [debugUtils] Starting comprehensive diagnostics...');
    
    const results = {
      auth: await this.checkAuthStatus(),
      userInTable: null,
      incidentAccess: null,
      rlsPolicies: null
    };

    if (results.auth.user) {
      results.userInTable = await this.checkUserInTable(results.auth.user.id);
    }

    results.incidentAccess = await this.testIncidentAccess();
    results.rlsPolicies = await this.checkRLSPolicies();

    console.log('📊 [debugUtils] Diagnostic results:', results);
    return results;
  }
}; 