# Safer Campus Analytics Dashboard

A comprehensive, real-time analytics dashboard for monitoring campus safety incidents and generating actionable insights.

## Features

### 📊 **Real-time Analytics**
- Live incident monitoring
- Automatic data refresh every 5 minutes
- Real-time metrics and KPIs

### 📈 **Data Visualizations**
- **Incident Type Distribution**: Pie chart showing breakdown of incident types
- **Timeline Analysis**: Line chart tracking incidents over the last 30 days
- **Response Time Analysis**: Bar chart showing response time distribution
- **Location Heatmap**: Horizontal bar chart of top incident locations

### 🎯 **Key Metrics**
- **Total Incidents**: Overall incident count with trend analysis
- **Active Incidents**: Currently unresolved incidents
- **Average Response Time**: Mean time from report to assignment
- **Safety Score**: Calculated safety rating (0-100)

### 📱 **Responsive Design**
- Mobile-friendly interface
- Adaptive grid layout
- Touch-optimized controls

## Setup Instructions

### 1. Configure Supabase Connection

1. Open `config.js` in the dashboard folder
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy your **Project URL** and **anon public** key
4. Paste them into the `config.js` file

### 3. Deploy the Dashboard

#### Option A: Local Development
1. Open `index.html` in a web browser
2. The dashboard will automatically connect to your Supabase database

#### Option B: Web Hosting
1. Upload the dashboard files to any web hosting service
2. Ensure the hosting service supports HTTPS (required for Supabase)
3. Access via your domain

#### Option C: GitHub Pages
1. Create a new GitHub repository
2. Upload the dashboard files
3. Enable GitHub Pages in repository settings
4. Access via `https://yourusername.github.io/repository-name`

## Data Requirements

The dashboard expects the following Supabase tables:

### `incidents` table
- `id` (UUID)
- `incident_type` (text)
- `status` (text)
- `reported_at` (timestamp)
- `assigned_at` (timestamp)
- `resolved_at` (timestamp)
- `location_description` (text)
- `latitude` (decimal)
- `longitude` (decimal)

### `users` table
- `id` (UUID)
- `role` (text)
- `username` (text)

### `incident_access_logs` table
- `incident_id` (UUID)
- `user_id` (UUID)
- `action` (text)
- `accessed_at` (timestamp)

## Customization

### Modify Refresh Interval
```javascript
// In config.js
refreshInterval: 5 * 60 * 1000, // 5 minutes
```

### Change Chart Colors
```javascript
// In config.js
incidentColors: {
    'snake_bite': '#e74c3c',
    'fire_attack': '#e67e22',
    // ... add more colors
}
```

### Adjust Severity Scores
```javascript
// In config.js
severityScores: {
    'snake_bite': 10,
    'fire_attack': 10,
    // ... adjust scores
}
```

## Security Considerations

1. **Use Anon Key**: Only use the anon/public key in the dashboard
2. **Row Level Security**: Ensure RLS policies are properly configured
3. **HTTPS Only**: Always serve the dashboard over HTTPS
4. **API Limits**: Monitor Supabase usage and set appropriate limits

## Troubleshooting

### Dashboard Not Loading
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure RLS policies allow public read access to incidents table

### No Data Showing
- Verify database tables exist and have data
- Check RLS policies for data access
- Ensure incident data has proper timestamps

### Charts Not Rendering
- Check if Chart.js library is loading
- Verify data format matches expected structure
- Check browser console for JavaScript errors

## Performance Optimization

### For Large Datasets
1. Add database indexes on frequently queried columns
2. Implement pagination for incident lists
3. Use database views for complex aggregations
4. Consider caching frequently accessed data

### For High Traffic
1. Use Supabase connection pooling
2. Implement client-side caching
3. Add loading states and error handling
4. Consider using a CDN for static assets

## Future Enhancements

- [ ] Real-time notifications
- [ ] Export functionality (PDF/Excel)
- [ ] Advanced filtering options
- [ ] User role-based dashboards
- [ ] Mobile app integration
- [ ] Predictive analytics
- [ ] Machine learning insights

## Support

For technical support or feature requests, please refer to the main project documentation or create an issue in the project repository.
