// Supabase Configuration
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    url: 'https://your-project-id.supabase.co',
    
    // Your Supabase anon/public key
    anonKey: 'your-anon-key-here',
    
    // Optional: Service role key for admin operations (keep secure!)
    serviceRoleKey: 'your-service-role-key-here'
};

// Dashboard Configuration
const DASHBOARD_CONFIG = {
    // Auto-refresh interval in milliseconds (5 minutes)
    refreshInterval: 5 * 60 * 1000,
    
    // Number of recent incidents to display
    recentIncidentsLimit: 10,
    
    // Number of top locations to show
    topLocationsLimit: 5,
    
    // Time range for timeline chart (days)
    timelineDays: 30,
    
    // Response time ranges for analysis
    responseTimeRanges: [
        { label: '0-15 min', min: 0, max: 15 },
        { label: '15-30 min', min: 15, max: 30 },
        { label: '30-60 min', min: 30, max: 60 },
        { label: '1-2 hours', min: 60, max: 120 },
        { label: '2+ hours', min: 120, max: Infinity }
    ],
    
    // Incident type colors
    incidentColors: {
        'snake_bite': '#e74c3c',
        'fire_attack': '#e67e22',
        'assault': '#8e44ad',
        'medical': '#3498db',
        'theft': '#f39c12',
        'harassment': '#e91e63',
        'vandalism': '#795548',
        'pickpocketing': '#607d8b',
        'other': '#9e9e9e'
    },
    
    // Severity scores for different incident types
    severityScores: {
        'snake_bite': 10,
        'fire_attack': 10,
        'assault': 9,
        'medical': 8,
        'theft': 6,
        'harassment': 7,
        'vandalism': 5,
        'pickpocketing': 4,
        'other': 3
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, DASHBOARD_CONFIG };
}
