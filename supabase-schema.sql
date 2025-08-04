-- Safe Campus App Database Schema
-- Run this in your Supabase SQL Editor

-- Note: app.jwt_secret is automatically managed by Supabase
-- No need to set it manually

-- Create custom types
CREATE TYPE incident_type AS ENUM ('snake_bite', 'fire_attack', 'pickpocketing', 'theft', 'assault', 'harassment', 'vandalism', 'medical', 'other');
CREATE TYPE incident_status AS ENUM ('reported', 'investigating', 'resolved', 'closed');
CREATE TYPE notification_type AS ENUM ('incident', 'emergency', 'safety_tip', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'security', 'fire_service', 'medical_service', 'school_management', 'admin');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE,
    username VARCHAR(100),
    phone VARCHAR(20),
    role user_role DEFAULT 'student',
    department VARCHAR(100),
    emergency_contacts JSONB DEFAULT '[]',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles and permissions table
CREATE TABLE public.user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    department VARCHAR(100),
    permissions JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- Incident type to institution mapping table
CREATE TABLE public.incident_institution_mapping (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_type incident_type NOT NULL,
    institution_role user_role NOT NULL,
    priority notification_priority DEFAULT 'medium',
    auto_notify BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(incident_type, institution_role)
);

-- Incidents table
CREATE TABLE public.incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    incident_type incident_type NOT NULL,
    status incident_status DEFAULT 'reported',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_description TEXT,
    evidence_files JSONB DEFAULT '[]',
    witnesses JSONB DEFAULT '[]',
    assigned_to UUID REFERENCES public.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Incident access logs table
CREATE TABLE public.incident_access_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'view', 'update', 'assign', 'resolve'
    details JSONB DEFAULT '{}',
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type DEFAULT 'system',
    priority notification_priority DEFAULT 'medium',
    read BOOLEAN DEFAULT FALSE,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Safety tips table
CREATE TABLE public.safety_tips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emergency contacts table
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table (for campus buildings/areas)
CREATE TABLE public.locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    building_code VARCHAR(20),
    floor VARCHAR(10),
    room_number VARCHAR(20),
    emergency_exits JSONB DEFAULT '[]',
    security_contacts JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE INDEX idx_incidents_type ON public.incidents(incident_type);
CREATE INDEX idx_incidents_location ON public.incidents(latitude, longitude);
CREATE INDEX idx_incidents_assigned_to ON public.incidents(assigned_to);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);
CREATE INDEX idx_users_student_id ON public.users(student_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_incident_access_logs_incident_id ON public.incident_access_logs(incident_id);
CREATE INDEX idx_incident_access_logs_user_id ON public.incident_access_logs(user_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_institution_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- School management and admin can view all users
CREATE POLICY "Management can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('school_management', 'admin')
        )
    );

-- RLS Policies for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Management can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('school_management', 'admin')
        )
    );

-- RLS Policies for incident_institution_mapping table (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view incident mappings" ON public.incident_institution_mapping
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS Policies for incidents table - Role-based access control
CREATE POLICY "Users can view incidents based on role" ON public.incidents
    FOR SELECT USING (
        -- Users can always view their own incidents
        auth.uid() = user_id
        OR
        -- School management and admin can view all incidents
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('school_management', 'admin')
        )
        OR
        -- Institution-specific access based on incident type
        EXISTS (
            SELECT 1 FROM public.incident_institution_mapping im
            JOIN public.users u ON u.id = auth.uid()
            WHERE im.incident_type = incidents.incident_type
            AND im.institution_role = u.role
        )
        OR
        -- Assigned incidents
        auth.uid() = assigned_to
    );

CREATE POLICY "Users can create own incidents" ON public.incidents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own incidents" ON public.incidents
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Assigned users can update incidents" ON public.incidents
    FOR UPDATE USING (auth.uid() = assigned_to);

CREATE POLICY "Management can update all incidents" ON public.incidents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('school_management', 'admin')
        )
    );

-- RLS Policies for incident_access_logs table
CREATE POLICY "Users can view own access logs" ON public.incident_access_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Management can view all access logs" ON public.incident_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('school_management', 'admin')
        )
    );

CREATE POLICY "Users can create access logs" ON public.incident_access_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for safety_tips table (public read access)
CREATE POLICY "Anyone can view safety tips" ON public.safety_tips
    FOR SELECT USING (true);

-- RLS Policies for emergency_contacts table
CREATE POLICY "Users can view own emergency contacts" ON public.emergency_contacts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own emergency contacts" ON public.emergency_contacts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for locations table (public read access)
CREATE POLICY "Anyone can view locations" ON public.locations
    FOR SELECT USING (true);

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_safety_tips_updated_at BEFORE UPDATE ON public.safety_tips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, student_id, username, phone, role)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'student_id',
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log incident access
CREATE OR REPLACE FUNCTION public.log_incident_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.incident_access_logs (incident_id, user_id, action, details)
    VALUES (
        NEW.id,
        auth.uid(),
        'view',
        jsonb_build_object('incident_type', NEW.incident_type, 'status', NEW.status)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to automatically assign incidents based on type
CREATE OR REPLACE FUNCTION public.auto_assign_incident()
RETURNS TRIGGER AS $$
DECLARE
    assigned_user_id UUID;
BEGIN
    -- Find appropriate user based on incident type and institution mapping
    SELECT u.id INTO assigned_user_id
    FROM public.users u
    JOIN public.incident_institution_mapping im ON im.institution_role = u.role
    WHERE im.incident_type = NEW.incident_type
    AND u.role IN ('security', 'fire_service', 'school_management')
    LIMIT 1;
    
    IF assigned_user_id IS NOT NULL THEN
        NEW.assigned_to = assigned_user_id;
        NEW.assigned_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-assign incidents
CREATE TRIGGER auto_assign_incident_trigger
    BEFORE INSERT ON public.incidents
    FOR EACH ROW EXECUTE FUNCTION public.auto_assign_incident();

-- Insert incident type to institution mappings
INSERT INTO public.incident_institution_mapping (incident_type, institution_role, priority, auto_notify) VALUES
('snake_bite', 'medical_service', 'urgent', true),
('snake_bite', 'school_management', 'high', true),
('fire_attack', 'fire_service', 'urgent', true),
('fire_attack', 'school_management', 'urgent', true),
('pickpocketing', 'security', 'medium', true),
('pickpocketing', 'school_management', 'medium', true),
('theft', 'security', 'medium', true),
('theft', 'school_management', 'medium', true),
('assault', 'security', 'high', true),
('assault', 'medical_service', 'high', true),
('assault', 'school_management', 'high', true),
('harassment', 'security', 'medium', true),
('harassment', 'school_management', 'medium', true),
('vandalism', 'security', 'medium', true),
('vandalism', 'school_management', 'medium', true),
('medical', 'medical_service', 'high', true),
('medical', 'school_management', 'high', true),
('other', 'school_management', 'medium', true);

-- Insert sample safety tips
INSERT INTO public.safety_tips (title, content, category) VALUES
('Stay Alert', 'Always be aware of your surroundings, especially when walking alone at night.', 'general'),
('Use Well-Lit Paths', 'Stick to well-lit and populated areas when walking around campus.', 'walking'),
('Emergency Contacts', 'Keep emergency contacts easily accessible on your phone.', 'emergency'),
('Report Suspicious Activity', 'If you see something suspicious, report it immediately to campus security.', 'reporting'),
('Buddy System', 'Use the buddy system when walking at night or in isolated areas.', 'walking'),
('Snake Safety', 'If you encounter a snake, do not approach it. Move away slowly and report the location to campus security.', 'wildlife'),
('Fire Safety', 'Know the location of fire exits and fire extinguishers in your building.', 'fire_safety'),
('Theft Prevention', 'Keep your belongings close and never leave them unattended in public areas.', 'theft_prevention');

-- Insert sample locations
INSERT INTO public.locations (name, description, building_code, emergency_exits) VALUES
('Main Library', 'Central campus library with 24/7 study spaces', 'LIB', '["North Exit", "South Exit", "East Exit"]'),
('Student Center', 'Main student hub with dining and recreation facilities', 'SC', '["Main Entrance", "Back Exit", "Emergency Exit"]'),
('Science Building', 'Laboratory and classroom building', 'SCI', '["Front Entrance", "Lab Exit", "Emergency Exit"]'),
('Dormitory A', 'Student residence hall', 'DORM-A', '["Main Lobby", "Fire Exit 1", "Fire Exit 2"]'); 