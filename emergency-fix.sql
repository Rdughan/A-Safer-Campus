-- Emergency fix: Temporarily disable RLS to get the app working
-- Run this if the complete fix doesn't work

-- Disable RLS on all tables
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_institution_mapping DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_access_logs DISABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Management can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can insert own incidents" ON public.incidents;
DROP POLICY IF EXISTS "Users can update incidents" ON public.incidents;
DROP POLICY IF EXISTS "Management can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "All users can view mapping" ON public.incident_institution_mapping;
DROP POLICY IF EXISTS "Users can view own access logs" ON public.incident_access_logs;
DROP POLICY IF EXISTS "Management can view all access logs" ON public.incident_access_logs;
DROP POLICY IF EXISTS "Users can insert access logs" ON public.incident_access_logs;

-- This will allow all operations without RLS restrictions
-- WARNING: This removes security - only use temporarily for testing

-- Test that incidents can be created
-- Try creating a test incident to verify the fix works 