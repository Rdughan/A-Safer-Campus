-- Test incident access for the current user
-- Run this in Supabase SQL Editor to check if the user can see incidents

-- First, let's see what incidents exist in the system
SELECT COUNT(*) as total_incidents FROM public.incidents;

-- Check if the current user exists
SELECT id, username, role FROM public.users WHERE id = auth.uid();

-- Check what incidents the current user can see
SELECT 
    id,
    title,
    incident_type,
    status,
    user_id,
    reported_at
FROM public.incidents 
WHERE user_id = auth.uid();

-- Check all incidents (this should be filtered by RLS)
SELECT 
    COUNT(*) as visible_incidents
FROM public.incidents;

-- Check if there are any incidents with the specific user ID
SELECT 
    COUNT(*) as user_incidents
FROM public.incidents 
WHERE user_id = '477e43bc-9e2f-49a7-b895-c8b9683584f2';

-- Check the user's role and what incidents they should see
SELECT 
    u.id,
    u.username,
    u.role,
    COUNT(i.id) as incident_count
FROM public.users u
LEFT JOIN public.incidents i ON u.id = i.user_id
WHERE u.id = '477e43bc-9e2f-49a7-b895-c8b9683584f2'
GROUP BY u.id, u.username, u.role; 