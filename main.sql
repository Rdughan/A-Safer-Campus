-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.emergency_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name character varying NOT NULL,
  phone character varying NOT NULL,
  relationship character varying,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id),
  CONSTRAINT emergency_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.incident_access_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_id uuid NOT NULL,
  user_id uuid NOT NULL,
  action character varying NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  accessed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incident_access_logs_pkey PRIMARY KEY (id),
  CONSTRAINT incident_access_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT incident_access_logs_incident_id_fkey FOREIGN KEY (incident_id) REFERENCES public.incidents(id)
);
CREATE TABLE public.incident_institution_mapping (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  incident_type USER-DEFINED NOT NULL,
  institution_role USER-DEFINED NOT NULL,
  priority USER-DEFINED DEFAULT 'medium'::notification_priority,
  auto_notify boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incident_institution_mapping_pkey PRIMARY KEY (id)
);
CREATE TABLE public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  incident_type USER-DEFINED NOT NULL,
  status USER-DEFINED DEFAULT 'reported'::incident_status,
  latitude numeric,
  longitude numeric,
  location_description text,
  evidence_files jsonb DEFAULT '[]'::jsonb,
  witnesses jsonb DEFAULT '[]'::jsonb,
  assigned_to uuid,
  assigned_at timestamp with time zone,
  reported_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT incidents_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  latitude numeric,
  longitude numeric,
  building_code character varying,
  floor character varying,
  room_number character varying,
  emergency_exits jsonb DEFAULT '[]'::jsonb,
  security_contacts jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT locations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title character varying NOT NULL,
  message text NOT NULL,
  notification_type USER-DEFINED DEFAULT 'system'::notification_type,
  priority USER-DEFINED DEFAULT 'medium'::notification_priority,
  read boolean DEFAULT false,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.safety_tips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  category character varying,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT safety_tips_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL,
  department character varying,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  student_id character varying UNIQUE,
  username character varying,
  phone character varying,
  role USER-DEFINED DEFAULT 'student'::user_role,
  department character varying,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);