# Supabase Setup Guide for Safe Campus App

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `safe-campus-app`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Click "Create new project"

### 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon public key**
3. Update `src/config/supabase.js` with your credentials:

```javascript
const supabaseUrl = 'YOUR_PROJECT_URL_HERE';
const supabaseAnonKey = 'YOUR_ANON_KEY_HERE';
```

### 3. Set Up Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Click "Run" to create all tables and policies

### 4. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your site URL (for development: `exp://localhost:8081`)
3. Add redirect URLs if needed
4. Enable email confirmations (optional)

### 5. Test the Integration

1. Start your React Native app: `npm start`
2. Try signing up with a new account
3. Check your Supabase dashboard to see the user created

## 📋 Database Tables

The schema creates the following tables:

- **users**: Extended user profiles
- **incidents**: Safety incident reports
- **notifications**: User notifications
- **safety_tips**: Safety tips and guidelines
- **emergency_contacts**: User emergency contacts
- **locations**: Campus buildings and areas

## 🔐 Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Secure user signup/login
- **Real-time**: Live updates for notifications and incidents
- **File Storage**: Secure file uploads for incident evidence

## 🛠️ Available Services

The app includes these Supabase services:

### Authentication
```javascript
import { authService } from '../services/supabaseService';

// Sign up
await authService.signUp(email, password, userData);

// Sign in
await authService.signIn(email, password);

// Sign out
await authService.signOut();
```

### Incidents
```javascript
import { incidentService } from '../services/supabaseService';

// Create incident
await incidentService.createIncident(incidentData);

// Get user incidents
await incidentService.getIncidentsByUser(userId);

// Get nearby incidents
await incidentService.getIncidentsByLocation(lat, lng, radius);
```

### Notifications
```javascript
import { notificationService } from '../services/supabaseService';

// Get notifications
await notificationService.getNotifications(userId);

// Mark as read
await notificationService.markAsRead(notificationId);

// Real-time subscription
notificationService.subscribeToNotifications(userId, callback);
```

### Emergency Contacts
```javascript
import { emergencyService } from '../services/supabaseService';

// Add contact
await emergencyService.addEmergencyContact(userId, contactData);

// Get contacts
await emergencyService.getEmergencyContacts(userId);

// Send emergency alert
await emergencyService.sendEmergencyAlert(userId, alertData);
```

## 🔧 Environment Variables (Optional)

For production, create a `.env` file:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then update `src/config/supabase.js`:

```javascript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

## 🚨 Troubleshooting

### Common Issues

1. **Authentication errors**: Check your project URL and anon key
2. **RLS policy errors**: Ensure you're signed in before accessing data
3. **Real-time not working**: Check your network connection and Supabase status

### Debug Mode

Enable debug logging in `src/config/supabase.js`:

```javascript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: true
  }
});
```

## 📱 Next Steps

1. **Test all features**: Sign up, login, create incidents, etc.
2. **Add real-time features**: Implement live notifications
3. **File uploads**: Add image upload for incident reports
4. **Push notifications**: Integrate with Expo notifications
5. **Analytics**: Add usage tracking and safety metrics

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [React Native Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

## 🆘 Support

If you encounter issues:

1. Check the Supabase status page
2. Review the error logs in your Supabase dashboard
3. Check the React Native console for detailed error messages
4. Ensure all dependencies are properly installed

---

**Happy coding! 🎉** 