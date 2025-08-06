# Role-Based Dashboard System

## Overview
The role-based dashboard provides different views and access levels based on user roles. Each role sees incidents relevant to their responsibilities and has different capabilities for managing incidents.

## User Roles and Access

### 1. Student
- **Visible Incidents**: 
  - Their own reported incidents
  - Snake bite incidents (campus-wide awareness)
  - Fire attack incidents (campus-wide awareness)
  - Pickpocketing incidents (campus-wide awareness)
- **Actions**: Can report incidents, view their own reports
- **Dashboard Features**: Basic incident overview, personal reporting history

### 2. Faculty
- **Visible Incidents**: 
  - All incident types except "Other"
  - Incidents in their department/area
- **Actions**: Can report incidents, view campus incidents
- **Dashboard Features**: Department-focused view, incident monitoring

### 3. Security Services
- **Visible Incidents**: 
  - Pickpocketing
  - Theft
  - Assault
  - Harassment
  - Vandalism
- **Actions**: Can update incident status, assign incidents to themselves
- **Dashboard Features**: Security incident management, status updates

### 4. Fire Service
- **Visible Incidents**: 
  - Fire attack incidents
  - Medical emergencies
- **Actions**: Can update incident status, assign incidents to themselves
- **Dashboard Features**: Fire and medical incident management

### 5. Medical Service
- **Visible Incidents**: 
  - Snake bite incidents
  - Medical emergencies
- **Actions**: Can update incident status, assign incidents to themselves
- **Dashboard Features**: Medical incident management, health monitoring

### 6. School Management
- **Visible Incidents**: ALL incidents (full access)
- **Actions**: Can update any incident status, assign incidents, view all data
- **Dashboard Features**: Complete oversight, analytics, management tools

### 7. Administrator
- **Visible Incidents**: ALL incidents (full access)
- **Actions**: Can update any incident status, assign incidents, manage users
- **Dashboard Features**: Complete system administration, user management

## Dashboard Features

### Statistics Overview
- **Total Incidents**: Count of visible incidents
- **Reported**: Incidents with "reported" status
- **In Progress**: Incidents with "in_progress" status
- **Resolved**: Incidents with "resolved" status

### Filtering Options
- **All**: Shows all incidents visible to the user's role
- **My Reports**: Shows incidents reported by the current user
- **Assigned**: Shows incidents assigned to the current user

### Incident Cards
Each incident card displays:
- Incident type with appropriate icon
- Status badge with color coding
- Title and description
- Location information
- Date and time
- Tap to view full details

### Quick Actions
- **Report Incident**: Quick access to incident reporting
- **Update Status**: For authorized roles (Security, Fire, Medical, Management)
- **Assign Incident**: For management roles or unassigned incidents

## Navigation

### Tab Navigation
- **Home**: General app home screen
- **Dashboard**: Role-based incident dashboard
- **Notifications**: User notifications
- **Report Incident**: Incident reporting form
- **Settings**: App settings and profile

### Screen Navigation
- **Dashboard** → **Incident Detail**: Tap on incident card
- **Incident Detail** → **Dashboard**: Back button
- **Dashboard** → **Report Incident**: Quick action button

## Technical Implementation

### Role Detection
- User role is fetched from Supabase on dashboard load
- Role determines which incidents are visible
- Role determines which actions are available

### Data Filtering
- Incidents are filtered client-side based on user role
- RLS policies provide additional server-side security
- Real-time updates through Supabase subscriptions

### Status Management
- Status updates are role-restricted
- Notifications sent to incident reporters when status changes
- Audit trail maintained for all status changes

## Security Features

### Row Level Security (RLS)
- Database-level access control
- Prevents unauthorized data access
- Role-based query restrictions

### Client-Side Validation
- UI elements hidden based on user role
- Action buttons disabled for unauthorized users
- Graceful fallbacks for missing permissions

### Audit Logging
- All incident access is logged
- Status changes are tracked
- Assignment actions are recorded

## Usage Examples

### Student Dashboard
1. Student logs in and sees their dashboard
2. Views their own reported incidents
3. Sees campus-wide safety incidents (snake bites, fires, pickpocketing)
4. Can report new incidents
5. Cannot update incident status or assign incidents

### Security Officer Dashboard
1. Security officer logs in and sees security-focused dashboard
2. Views all security-related incidents (theft, assault, harassment, etc.)
3. Can update incident status (in progress, resolved, urgent)
4. Can assign incidents to themselves
5. Receives notifications for new security incidents

### School Management Dashboard
1. Management logs in and sees complete overview
2. Views ALL incidents across the campus
3. Can update any incident status
4. Can assign incidents to any user
5. Has access to analytics and reporting features
6. Can manage user roles and permissions

## Future Enhancements

### Planned Features
- **Analytics Dashboard**: Charts and graphs for incident trends
- **Export Functionality**: PDF/Excel reports for management
- **Advanced Filtering**: Date ranges, location-based filtering
- **Real-time Notifications**: Push notifications for new incidents
- **Mobile Offline Support**: Offline incident reporting
- **Integration**: Connect with external emergency services

### Role Customization
- **Custom Roles**: Allow creation of department-specific roles
- **Permission Granularity**: Fine-tune access permissions
- **Role Hierarchies**: Support for role inheritance
- **Temporary Permissions**: Time-limited elevated access

This role-based dashboard system ensures that each user sees only the information relevant to their role while maintaining security and providing appropriate tools for incident management. 