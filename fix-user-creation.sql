-- Fix user creation function to handle missing metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, student_id, username, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'student_id', 'STU-' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing users with missing data
UPDATE public.users 
SET 
    student_id = COALESCE(student_id, 'STU-' || substr(id::text, 1, 8)),
    username = COALESCE(username, 'User ' || substr(id::text, 1, 8)),
    phone = COALESCE(phone, ''),
    role = COALESCE(role, 'student')
WHERE student_id IS NULL OR username IS NULL OR role IS NULL;

-- Ensure all users have proper role assignment
UPDATE public.users 
SET role = 'student' 
WHERE role IS NULL;
