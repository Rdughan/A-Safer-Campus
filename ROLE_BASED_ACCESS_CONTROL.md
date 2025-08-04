# Role-Based Access Control System

## Overview

The Safe Campus app implements a comprehensive role-based access control (RBAC) system that ensures different institutions have access to relevant incident reports based on the type of incident and their role in the campus community.

## User Roles

### 1. Student
- **Default role** for new users
- Can report incidents
- Can view only their own incident reports
- Limited access to incident management features

### 2. Faculty
- Can report incidents
- Can view incidents in their department (if implemented)
- Limited management capabilities

### 3. Security Services
- **Access to**: Pickpocketing, Theft, Assault, Harassment, Vandalism incidents
- Can view, update, and manage assigned incidents
- Can be automatically assigned to relevant incidents
- Full incident management capabilities

### 4. Fire Service
- **Access to**: Fire Attack incidents
- Can view, update, and manage assigned incidents
- Can be automatically assigned to fire-related incidents
- Full incident management capabilities

### 5. Medical Services
- **Access to**: Snake Bite, Medical Emergency, and Assault incidents
- Can view, update, and manage assigned incidents
- Can be automatically assigned to medical-related incidents
- Full incident management capabilities for medical emergencies

### 6. School Management
- **Access to**: ALL incident types (including Snake Bite, Medical, Other)
- Can view all incidents in the system
- Can assign incidents to appropriate personnel
- Can update incident statuses
- Full administrative capabilities

### 7. Administrator
- **Access to**: ALL incident types and system features
- Can manage user roles and permissions
- Can view all system data
- Full system administration capabilities

## Incident Types and Institution Mapping

| Incident Type | Primary Institution | Secondary Institution | Priority |
|---------------|-------------------|---------------------|----------|
| Snake Bite | Medical Services | School Management | Urgent |
| Fire Attack | Fire Service | School Management | Urgent |
| Pickpocketing | Security Services | School Management | Medium |
| Theft | Security Services | School Management | Medium |
| Assault | Medical Services | Security Services, School Management | High |
| Harassment | Security Services | School Management | Medium |
| Vandalism | Security Services | School Management | Medium |
| Medical Emergency | Medical Services | School Management | High |
| Other | School Management | - | Medium |

## Database Schema

### New Tables Added

1. **user_roles** - Stores user role assignments and permissions
2. **incident_institution_mapping** - Maps incident types to appropriate institutions
3. **incident_access_logs** - Tracks who accessed which incidents and when

### Updated Tables

1. **users** - Added `role` and `department` fields
2. **incidents** - Added `assigned_to` and `assigned_at` fields

## Row Level Security (RLS) Policies

The system uses Supabase Row Level Security to enforce access control at the database level:

### Users Table
- Users can only view and update their own profile
- School management and admin can view all users

### Incidents Table
- Users can always view their own incidents
- Institution-specific access based on incident type mapping
- School management and admin can view all incidents
- Assigned users can view and update their assigned incidents

### Access Logs
- Users can view their own access logs
- Management can view all access logs

## Automatic Incident Assignment

When an incident is reported, the system automatically:

1. **Determines the appropriate institution** based on incident type
2. **Finds available personnel** from that institution
3. **Assigns the incident** to the first available person
4. **Sends notifications** to the assigned person
5. **Logs the assignment** for audit purposes

## API Endpoints

### Role Management
- `getUserRole(userId)` - Get user's current role
- `hasIncidentAccess(userId, incidentType)` - Check if user has access to incident type
- `getUsersByRole(role)` - Get all users with a specific role
- `updateUserRole(userId, newRole)` - Update user role (admin only)

### Incident Management
- `getIncidents(userId)` - Get incidents based on user permissions
- `getIncidentsByType(incidentType, userId)` - Get incidents by type with access control
- `getAssignedIncidents(userId)` - Get incidents assigned to user
- `updateIncidentStatus(incidentId, status, userId)` - Update incident status
- `assignIncident(incidentId, assignedUserId, assignedByUserId)` - Assign incident to user
- `logIncidentAccess(incidentId, userId, action, details)` - Log access for audit

### Notifications
- `sendNotificationToRole(role, notificationData)` - Send notification to all users with a role

## Usage Examples

### For Students
```javascript
// Report an incident
const incidentData = {
  user_id: user.id,
  title: "Snake Bite - Library",
  description: "Saw a snake near the library entrance",
  incident_type: "snake_bite",
  location_description: "Library entrance",
  // ... other fields
};

const result = await incidentService.createIncident(incidentData);
```

### For Security Services
```javascript
// Get pickpocketing incidents
const incidents = await incidentService.getIncidentsByType('pickpocketing', userId);

// Update incident status
await incidentService.updateIncidentStatus(incidentId, 'investigating', userId);
```

### For School Management
```javascript
// Get all incidents
const allIncidents = await incidentService.getIncidents(userId);

// Assign incident to security
await incidentService.assignIncident(incidentId, securityUserId, userId);

// Send notification to security team
await notificationService.sendNotificationToRole('security', {
  title: 'New Incident Assigned',
  message: 'A new incident has been assigned to your team',
  notification_type: 'incident',
  priority: 'high'
});
```

## Security Features

1. **Database-level security** with Row Level Security policies
2. **Access logging** for audit trails
3. **Role-based filtering** at the application level
4. **Automatic assignment** based on incident type
5. **Notification system** for real-time updates

## Implementation Notes

1. **Default Role**: New users are assigned the 'student' role by default
2. **Role Updates**: Only administrators can change user roles
3. **Incident Assignment**: Automatic assignment happens on incident creation
4. **Access Logging**: All incident access is logged for security audit
5. **Real-time Updates**: Notifications are sent in real-time for important events

## Future Enhancements

1. **Department-based filtering** for faculty members
2. **Geographic access control** based on campus zones
3. **Time-based access** for different shifts
4. **Escalation procedures** for urgent incidents
5. **Integration with external systems** (police, fire department) 