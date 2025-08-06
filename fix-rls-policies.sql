-- Fix for infinite recursion in RLS policies
-- Run this in your Supabase SQL Editor

-- Drop the problematic policies
DROP POLICY IF EXISTS "Management can view all users" ON public.users;
DROP POLICY IF EXISTS "Management can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view incidents based on role" ON public.incidents;
DROP POLICY IF EXISTS "Management can update all incidents" ON public.incidents;
DROP POLICY IF EXISTS "Management can view all access logs" ON public.incident_access_logs;

-- Create simplified policies that avoid circular references
CREATE POLICY "Management can view all users" ON public.users
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('school_management', 'admin')
    );

CREATE POLICY "Management can view all roles" ON public.user_roles
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('school_management', 'admin')
    );

-- Simplified incident access policy
CREATE POLICY "Users can view incidents based on role" ON public.incidents
    FOR SELECT USING (
        -- Users can always view their own incidents
        auth.uid() = user_id
        OR
        -- School management and admin can view all incidents
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('school_management', 'admin')
        OR
        -- Institution-specific access based on incident type
        EXISTS (
            SELECT 1 FROM public.incident_institution_mapping im
            WHERE im.incident_type = incidents.incident_type
            AND im.institution_role = (SELECT role FROM public.users WHERE id = auth.uid())
        )
        OR
        -- Assigned incidents
        auth.uid() = assigned_to
    );

CREATE POLICY "Management can update all incidents" ON public.incidents
    FOR UPDATE USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('school_management', 'admin')
    );

CREATE POLICY "Management can view all access logs" ON public.incident_access_logs
    FOR SELECT USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('school_management', 'admin')
    ); 