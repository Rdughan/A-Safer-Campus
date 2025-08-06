-- Fix for foreign key constraint error
-- The user ID doesn't exist in the users table

-- First, let's check if the user exists
SELECT id, username, email, role FROM public.users WHERE id = '477e43bc-9e2f-49a7-b895-c8b9683584f2';

-- If the user doesn't exist, we need to create them
-- This usually happens when a user signs up through Supabase Auth but the trigger doesn't work

-- Check if there are any auth users without corresponding records in the users table
SELECT 
    au.id,
    au.email,
    au.created_at
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL;

-- If you see the user in auth.users but not in public.users, run this:
INSERT INTO public.users (id, username, email, role, created_at, updated_at)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'username', au.email),
    au.email,
    'student', -- default role
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id = '477e43bc-9e2f-49a7-b895-c8b9683584f2'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Verify the user was created
SELECT id, username, email, role FROM public.users WHERE id = '477e43bc-9e2f-49a7-b895-c8b9683584f2';

-- Test the foreign key constraint
SELECT COUNT(*) FROM public.incidents WHERE user_id = '477e43bc-9e2f-49a7-b895-c8b9683584f2'; 