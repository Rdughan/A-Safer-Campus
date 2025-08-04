# Institution Integration Guide
## How Different Institutions Connect to Safe Campus System

This guide explains how various institutions (medical services, fire services, security, etc.) would connect to and use the Safe Campus system in real-world scenarios.

## 🏥 Medical Services Integration

### **Access Methods:**
1. **Web Dashboard**: `https://medical.campus-safety.com`
2. **Mobile App**: Campus Safety Medical Services App
3. **API Integration**: Direct database access via REST API

### **What Medical Services See:**
- ✅ Snake bite incidents (urgent priority)
- ✅ Assault incidents (high priority)
- ✅ Medical emergencies (high priority)
- ❌ Fire incidents (not visible)
- ❌ Theft incidents (not visible)

### **Real-World Workflow:**
```
1. Student reports snake bite → System automatically notifies medical services
2. Medical staff receives notification → Opens medical dashboard
3. Medical staff views incident details → Location, student info, symptoms
4. Medical staff updates status → "Investigating" → "Resolved"
5. System logs all actions → Audit trail maintained
```

### **Medical Dashboard Features:**
- **Urgent Alerts**: Real-time notifications for snake bites
- **Patient Information**: Student details, medical history
- **Location Tracking**: GPS coordinates of incident
- **Status Updates**: Track treatment progress
- **Medical Notes**: Add treatment details
- **Emergency Contacts**: Quick access to student's emergency contacts

---

## 🚒 Fire Services Integration

### **Access Methods:**
1. **Web Dashboard**: `https://fire.campus-safety.com`
2. **Mobile App**: Campus Safety Fire Services App
3. **Emergency Systems**: Integration with fire alarm systems

### **What Fire Services See:**
- ✅ Fire attack incidents (urgent priority)
- ❌ Medical incidents (not visible)
- ❌ Security incidents (not visible)

### **Real-World Workflow:**
```
1. Fire alarm triggered → System creates fire incident
2. Fire services notified immediately → Urgent priority alert
3. Fire crew responds → Updates status to "Investigating"
4. Fire contained → Updates to "Resolved"
5. Incident report generated → Stored in system
```

---

## 🛡️ Security Services Integration

### **Access Methods:**
1. **Web Dashboard**: `https://security.campus-safety.com`
2. **Mobile App**: Campus Safety Security App
3. **Patrol Systems**: Integration with security patrol software

### **What Security Services See:**
- ✅ Pickpocketing incidents (medium priority)
- ✅ Theft incidents (medium priority)
- ✅ Assault incidents (high priority)
- ✅ Harassment incidents (medium priority)
- ✅ Vandalism incidents (medium priority)
- ❌ Medical incidents (not visible)

### **Real-World Workflow:**
```
1. Student reports theft → System assigns to security
2. Security officer receives notification → Opens security dashboard
3. Officer investigates → Updates status to "Investigating"
4. Evidence collected → Photos, witness statements
5. Case resolved → Updates to "Resolved"
```

---

## 🏫 School Management Integration

### **Access Methods:**
1. **Web Dashboard**: `https://admin.campus-safety.com`
2. **Executive App**: Campus Safety Management App
3. **Reporting Tools**: Integration with existing school systems

### **What School Management Sees:**
- ✅ **ALL** incident types (full access)
- ✅ Analytics and reports
- ✅ User management
- ✅ System configuration

### **Real-World Workflow:**
```
1. Management reviews daily reports → All incidents visible
2. Identifies patterns → Multiple thefts in same area
3. Implements solutions → Increased patrols, better lighting
4. Monitors effectiveness → Track incident reduction
5. Reports to stakeholders → Parents, board, government
```

---

## 🔌 Technical Integration Methods

### **Method 1: Web-Based Dashboards**

Each institution gets a customized web interface:

```javascript
// Example: Medical Services Dashboard
const MedicalDashboard = () => {
  const [incidents, setIncidents] = useState([]);
  
  useEffect(() => {
    // Only load medical-related incidents
    loadMedicalIncidents();
  }, []);
  
  const loadMedicalIncidents = async () => {
    const { data } = await supabase
      .from('incidents')
      .select('*')
      .in('incident_type', ['snake_bite', 'assault', 'medical']);
    
    setIncidents(data);
  };
  
  return (
    <div className="medical-dashboard">
      <h1>Medical Services Dashboard</h1>
      {/* Medical-specific UI */}
    </div>
  );
};
```

### **Method 2: API Integration**

Institutions connect their existing systems:

```javascript
// Example: Medical Services API Client
class MedicalServicesAPI {
  constructor(apiKey) {
    this.baseURL = 'https://api.campus-safety.com';
    this.apiKey = apiKey;
  }
  
  async getMedicalIncidents() {
    const response = await fetch(`${this.baseURL}/incidents/medical`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  }
  
  async updateIncidentStatus(incidentId, status, medicalNotes) {
    const response = await fetch(`${this.baseURL}/incidents/${incidentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status,
        medical_notes: medicalNotes,
        updated_by: 'medical_service'
      })
    });
    return response.json();
  }
}

// Usage in medical system
const medicalAPI = new MedicalServicesAPI('MEDICAL_SERVICE_TOKEN');
const incidents = await medicalAPI.getMedicalIncidents();
```

### **Method 3: Mobile Applications**

Institution-specific mobile apps:

```javascript
// Example: Medical Services Mobile App
const MedicalServicesApp = () => {
  const [userRole] = useState('medical_service');
  const [userId] = useState('medical_user_id');
  
  return (
    <InstitutionDashboard 
      userRole={userRole}
      userId={userId}
    />
  );
};
```

---

## 🔐 Authentication & Security

### **Institution-Specific Authentication:**

```sql
-- Create institution-specific users
INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data) VALUES
-- Medical Services
('dr.smith@medical.campus.edu', 'hashed_password', '{"role": "medical_service", "department": "emergency_medicine", "institution": "medical"}'),
('nurse.jones@medical.campus.edu', 'hashed_password', '{"role": "medical_service", "department": "first_aid", "institution": "medical"}'),

-- Fire Services
('chief.fire@fire.campus.edu', 'hashed_password', '{"role": "fire_service", "department": "emergency_response", "institution": "fire"}'),
('firefighter.brown@fire.campus.edu', 'hashed_password', '{"role": "fire_service", "department": "response_team", "institution": "fire"}'),

-- Security Services
('officer.security@security.campus.edu', 'hashed_password', '{"role": "security", "department": "patrol", "institution": "security"}'),
('supervisor.security@security.campus.edu', 'hashed_password', '{"role": "security", "department": "management", "institution": "security"}');
```

### **Role-Based Access Control (RLS):**

```sql
-- Medical services can only see medical incidents
CREATE POLICY "Medical services access" ON incidents
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'medical_service'
  )
  AND incident_type IN ('snake_bite', 'assault', 'medical')
);
```

---

## 📱 Real-Time Notifications

### **Push Notifications:**

```javascript
// Example: Medical Services Notification
const sendMedicalAlert = async (incident) => {
  // Get all medical service users
  const { data: medicalUsers } = await supabase
    .from('users')
    .select('id, username, phone')
    .eq('role', 'medical_service');
  
  // Send notifications to all medical staff
  medicalUsers.forEach(user => {
    sendPushNotification(user.id, {
      title: 'Medical Emergency Alert',
      body: `New ${incident.incident_type} incident at ${incident.location_description}`,
      data: { incidentId: incident.id }
    });
  });
};
```

### **Email Notifications:**

```javascript
// Example: Email notification system
const sendInstitutionEmail = async (institution, incident) => {
  const emailTemplates = {
    medical_service: {
      subject: 'Medical Emergency - Immediate Response Required',
      template: 'medical-emergency-template.html'
    },
    fire_service: {
      subject: 'Fire Emergency - Urgent Response Required',
      template: 'fire-emergency-template.html'
    },
    security: {
      subject: 'Security Incident - Investigation Required',
      template: 'security-incident-template.html'
    }
  };
  
  const template = emailTemplates[institution];
  await sendEmail(institution, template, incident);
};
```

---

## 📊 Reporting & Analytics

### **Institution-Specific Reports:**

```sql
-- Medical Services Report
SELECT 
  incident_type,
  COUNT(*) as total_incidents,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved,
  AVG(EXTRACT(EPOCH FROM (resolved_at - reported_at))/3600) as avg_response_time_hours
FROM incidents 
WHERE incident_type IN ('snake_bite', 'assault', 'medical')
  AND reported_at >= NOW() - INTERVAL '30 days'
GROUP BY incident_type;

-- Security Services Report
SELECT 
  incident_type,
  COUNT(*) as total_incidents,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved
FROM incidents 
WHERE incident_type IN ('pickpocketing', 'theft', 'assault', 'harassment', 'vandalism')
  AND reported_at >= NOW() - INTERVAL '30 days'
GROUP BY incident_type;
```

---

## 🚀 Deployment Options

### **Option 1: Single Application with Role-Based UI**
- **Pros**: Easier maintenance, single codebase
- **Cons**: Less customization per institution
- **Best for**: Small to medium campuses

### **Option 2: Separate Applications**
- **Pros**: Maximum customization, independent deployment
- **Cons**: More complex maintenance, higher costs
- **Best for**: Large campuses with complex needs

### **Option 3: Hybrid Approach**
- **Pros**: Balance of customization and maintenance
- **Cons**: Moderate complexity
- **Best for**: Most campuses

---

## 🔧 Implementation Checklist

### **Phase 1: Database Setup**
- [ ] Run the complete Supabase schema
- [ ] Create institution-specific user accounts
- [ ] Test role-based access control
- [ ] Verify incident type mappings

### **Phase 2: Institution Onboarding**
- [ ] Set up institution-specific dashboards
- [ ] Configure authentication for each institution
- [ ] Train institution staff on system usage
- [ ] Test incident workflows

### **Phase 3: Integration & Testing**
- [ ] Integrate with existing institution systems
- [ ] Set up real-time notifications
- [ ] Test emergency response workflows
- [ ] Conduct security audits

### **Phase 4: Go-Live**
- [ ] Deploy to production
- [ ] Monitor system performance
- [ ] Gather user feedback
- [ ] Implement improvements

---

## 📞 Support & Maintenance

### **Institution Support:**
- **Medical Services**: 24/7 emergency support
- **Fire Services**: Emergency response support
- **Security Services**: Business hours support
- **School Management**: Full administrative support

### **Technical Support:**
- **API Documentation**: Available at `/docs/api`
- **User Guides**: Institution-specific documentation
- **Training Materials**: Video tutorials and guides
- **Help Desk**: Email and phone support

---

## 🎯 Success Metrics

### **Medical Services:**
- Response time to medical emergencies
- Number of incidents resolved
- Patient satisfaction scores

### **Fire Services:**
- Emergency response time
- Incident containment success rate
- Safety compliance metrics

### **Security Services:**
- Incident resolution rate
- Crime prevention effectiveness
- Community safety scores

### **School Management:**
- Overall campus safety improvement
- Cost savings from incident prevention
- Stakeholder satisfaction

---

This integration guide provides a comprehensive framework for connecting different institutions to the Safe Campus system, ensuring each institution has the tools and access they need while maintaining security and data integrity. 