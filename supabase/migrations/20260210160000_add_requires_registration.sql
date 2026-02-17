-- Add requires_registration column to events table
ALTER TABLE public.events
ADD COLUMN requires_registration BOOLEAN DEFAULT true NOT NULL;

-- Add comment to clarify the field
COMMENT ON COLUMN public.events.requires_registration IS 'If true, players must register/login to participate. If false, players can join by just entering their name.';
