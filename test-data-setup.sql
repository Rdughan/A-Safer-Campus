-- Test Data Setup for A Safer Campus
-- Run this in your Supabase SQL Editor to add sample data for testing

-- First, let's create a test user in auth.users (you can do this via Supabase Auth UI instead)
-- This is just for reference - you should create users through the app or Supabase dashboard

-- Sample incidents with coordinates around KNUST campus
INSERT INTO public.incidents (
  user_id, 
  title, 
  description, 
  incident_type, 
  status, 
  latitude, 
  longitude, 
  location_description, 
  reported_at
) VALUES 
-- Snake bite incidents
('00000000-0000-0000-0000-000000000001', 'Snake spotted near hostel', 'Large snake seen near Unity Hall', 'snake_bite', 'reported', 6.6735, -1.5718, 'Unity Hall area', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000001', 'Snake bite incident', 'Student bitten by snake', 'snake_bite', 'investigating', 6.6740, -1.5720, 'College of Science', NOW() - INTERVAL '1 day'),

-- Fire incidents  
('00000000-0000-0000-0000-000000000001', 'Small fire outbreak', 'Fire in electrical room', 'fire_attack', 'resolved', 6.6730, -1.5715, 'Engineering Block', NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000001', 'Bush fire near campus', 'Fire spreading from nearby bush', 'fire_attack', 'investigating', 6.6725, -1.5710, 'Campus perimeter', NOW() - INTERVAL '30 minutes'),

-- Theft incidents
('00000000-0000-0000-0000-000000000001', 'Laptop stolen', 'Laptop stolen from library', 'theft', 'reported', 6.6745, -1.5725, 'Main Library', NOW() - INTERVAL '5 hours'),
('00000000-0000-0000-0000-000000000001', 'Phone theft', 'Phone snatched near gate', 'theft', 'investigating', 6.6720, -1.5705, 'Main Gate', NOW() - INTERVAL '2 days'),

-- Pickpocketing incidents
('00000000-0000-0000-0000-000000000001', 'Wallet pickpocketed', 'Wallet stolen in crowded area', 'pickpocketing', 'reported', 6.6738, -1.5722, 'Student Center', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000001', 'Phone pickpocketed', 'Phone stolen from pocket', 'pickpocketing', 'closed', 6.6742, -1.5728, 'Dining Hall', NOW() - INTERVAL '4 hours'),

-- Assault incidents
('00000000-0000-0000-0000-000000000001', 'Student assault', 'Physical altercation between students', 'assault', 'investigating', 6.6732, -1.5712, 'Sports Complex', NOW() - INTERVAL '6 hours'),

-- Medical emergencies
('00000000-0000-0000-0000-000000000001', 'Student collapsed', 'Student fainted during lecture', 'medical', 'resolved', 6.6728, -1.5716, 'Lecture Hall Complex', NOW() - INTERVAL '3 hours'),

-- Harassment incidents  
('00000000-0000-0000-0000-000000000001', 'Verbal harassment', 'Student reported verbal harassment', 'harassment', 'reported', 6.6736, -1.5719, 'Library vicinity', NOW() - INTERVAL '8 hours'),

-- Vandalism
('00000000-0000-0000-0000-000000000001', 'Property damage', 'Windows broken in classroom', 'vandalism', 'reported', 6.6741, -1.5714, 'Classroom Block A', NOW() - INTERVAL '12 hours');

-- Create a test user in public.users table (use a real auth user ID if you have one)
INSERT INTO public.users (
  id, 
  student_id, 
  username, 
  phone, 
  role, 
  department, 
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'TEST001',
  'Test Student',
  '+233123456789',
  'student',
  'Computer Science',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  student_id = EXCLUDED.student_id,
  username = EXCLUDED.username,
  phone = EXCLUDED.phone;

-- Add some incidents around University of Ghana (Legon)
INSERT INTO public.incidents (
  user_id, 
  title, 
  description, 
  incident_type, 
  status, 
  latitude, 
  longitude, 
  location_description, 
  reported_at
) VALUES 
('00000000-0000-0000-0000-000000000001', 'Theft at UG', 'Bag stolen from library', 'theft', 'reported', 5.6502, -0.1869, 'UG Main Library', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000001', 'Medical emergency at UG', 'Student injured during sports', 'medical', 'resolved', 5.6510, -0.1875, 'UG Sports Complex', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000001', 'Fire incident at UG', 'Small fire in lab', 'fire_attack', 'investigating', 5.6495, -0.1860, 'UG Science Lab', NOW() - INTERVAL '4 hours');

-- Add incidents around Ashesi University
INSERT INTO public.incidents (
  user_id, 
  title, 
  description, 
  incident_type, 
  status, 
  latitude, 
  longitude, 
  location_description, 
  reported_at
) VALUES 
('00000000-0000-0000-0000-000000000001', 'Harassment at Ashesi', 'Student reported harassment', 'harassment', 'investigating', 5.7167, -0.3333, 'Ashesi Campus', NOW() - INTERVAL '6 hours'),
('00000000-0000-0000-0000-000000000001', 'Vandalism at Ashesi', 'Property damage reported', 'vandalism', 'reported', 5.7172, -0.3338, 'Ashesi Parking Lot', NOW() - INTERVAL '1 day');

-- Verify the data was inserted
SELECT 
  incident_type,
  COUNT(*) as count,
  AVG(latitude) as avg_lat,
  AVG(longitude) as avg_lng
FROM public.incidents 
GROUP BY incident_type
ORDER BY count DESC;
