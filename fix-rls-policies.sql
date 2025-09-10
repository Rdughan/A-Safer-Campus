-- Fix RLS policies to ensure students can see some incidents
DROP POLICY IF EXISTS "Users can view incidents based on role" ON public.incidents;

-- Create improved RLS policy
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
        SELECT 1 FROM public.incident_institution_mapping iim
        JOIN public.users u ON u.id = auth.uid()
        WHERE iim.incident_type = incidents.incident_type
        AND iim.institution_role = u.role
    )
    OR
    -- Students can view public safety incidents (snake bite, fire, pickpocketing)
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'student'
        AND incidents.incident_type IN ('snake_bite', 'fire_attack', 'pickpocketing')
    )
);

-- Ensure incident institution mappings exist
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
('other', 'school_management', 'medium', true)
ON CONFLICT (incident_type, institution_role) DO NOTHING;