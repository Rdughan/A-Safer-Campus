-- Fix for incident submission RLS policies
-- Run this in your Supabase SQL Editor to resolve "Failed to submit incident" errors

-- First, temporarily disable RLS to clean up
ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view incidents based on role" ON public.incidents;
DROP POLICY IF EXISTS "Users can create own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Assigned users can update incidents" ON public.incidents;
DROP POLICY IF EXISTS "Management can update all incidents" ON public.incidents;

-- Re-enable RLS
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create simplified, working policies for incidents table
-- Policy 1: Users can view incidents (simplified logic)
CREATE POLICY "Users can view incidents" ON public.incidents
    FOR SELECT USING (
        -- Users can always view their own incidents
        auth.uid() = user_id
        OR
        -- Users can view incidents based on their role (simplified)
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

-- Policy 2: Users can create their own incidents (CRITICAL FOR SUBMISSION)
CREATE POLICY "Users can create own incidents" ON public.incidents
    FOR INSERT WITH CHECK (
        -- Must be authenticated
        auth.uid() IS NOT NULL
        AND
        -- User ID must match the authenticated user
        auth.uid() = user_id
    );

-- Policy 3: Users can update their own incidents
CREATE POLICY "Users can update own incidents" ON public.incidents
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

-- Policy 4: Management can update all incidents
CREATE POLICY "Management can update all incidents" ON public.incidents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() 
            AND u.role IN ('school_management', 'admin')
        )
    );

-- Test the policies
-- This should work without infinite recursion
SELECT COUNT(*) FROM public.incidents WHERE user_id = auth.uid();

-- Verify the insert policy works
-- (This will be tested when you try to submit an incident) 