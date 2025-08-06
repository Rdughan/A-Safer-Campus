-- Fix for the handle_new_user trigger function
-- The function is missing the email field which is required

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, student_id, username, phone, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'student_id',
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'),
        NEW.created_at,
        NEW.updated_at
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now fix the existing user that's missing
INSERT INTO public.users (id, email, username, role, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'username', au.email),
    COALESCE((au.raw_user_meta_data->>'role')::user_role, 'student'),
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id = '477e43bc-9e2f-49a7-b895-c8b9683584f2'
AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = au.id
);

-- Verify the user was created
SELECT id, email, username, role FROM public.users WHERE id = '477e43bc-9e2f-49a7-b895-c8b9683584f2';

-- Test that the foreign key constraint works now
SELECT COUNT(*) FROM public.incidents WHERE user_id = '477e43bc-9e2f-49a7-b895-c8b9683584f2'; 