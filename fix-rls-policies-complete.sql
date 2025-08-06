-- Complete fix for infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- First, disable RLS temporarily to clean up
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_institution_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_access_logs DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Management can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view incidents based on role" ON public.incidents;
DROP POLICY IF EXISTS "Users can insert own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Management can update all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Management can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Management can view all access logs" ON public.incident_access_logs;
DROP POLICY IF EXISTS "Users can view own access logs" ON public.incident_access_logs;

-- Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_institution_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_access_logs ENABLE ROW LEVEL SECURITY;

-- Create simplified, non-circular policies for users table
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Create simplified policies for incidents table
CREATE POLICY "Users can view incidents" ON public.incidents
    FOR SELECT USING (
        -- Users can always view their own incidents
        auth.uid() = user_id
        OR
        -- Users can view incidents based on their role (simplified logic)
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND (
                u.role IN ('school_management', 'admin')
                OR
                (u.role = 'security' AND incidents.incident_type IN ('pickpocketing', 'theft', 'assault', 'harassment', 'vandalism'))
                OR
                (u.role = 'fire_service' AND incidents.incident_type IN ('fire_attack', 'medical'))
                OR
                (u.role = 'medical_service' AND incidents.incident_type IN ('snake_bite', 'medical'))
                OR
                (u.role = 'faculty' AND incidents.incident_type != 'other')
                OR
                (u.role = 'student' AND (
                    incidents.incident_type IN ('snake_bite', 'fire_attack', 'pickpocketing')
                    OR auth.uid() = incidents.user_id
                ))
            )
        )
        OR
        -- Assigned incidents
        auth.uid() = assigned_to
    );

CREATE POLICY "Users can insert own incidents" ON public.incidents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update incidents" ON public.incidents
    FOR UPDATE USING (
        auth.uid() = user_id
        OR
        auth.uid() = assigned_to
        OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('school_management', 'admin', 'security', 'fire_service', 'medical_service')
        )
    );

-- Create policies for user_roles table
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Management can view all roles" ON public.user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('school_management', 'admin')
        )
    );

-- Create policies for incident_institution_mapping table
CREATE POLICY "All users can view mapping" ON public.incident_institution_mapping
    FOR SELECT USING (true);

-- Create policies for incident_access_logs table
CREATE POLICY "Users can view own access logs" ON public.incident_access_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Management can view all access logs" ON public.incident_access_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('school_management', 'admin')
        )
    );

-- Create policy for inserting access logs
CREATE POLICY "Users can insert access logs" ON public.incident_access_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Test the policies by running a simple query
-- This should work without infinite recursion
SELECT COUNT(*) FROM public.incidents WHERE user_id = auth.uid(); 