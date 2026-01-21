-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  google_maps_url TEXT,
  player_limit INTEGER NOT NULL DEFAULT 20,
  goalkeeper_limit INTEGER NOT NULL DEFAULT 4,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role participant_role NOT NULL,
  status participant_status NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, name)
);

-- Create event_rules table
CREATE TABLE public.event_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  rule_text TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rules ENABLE ROW LEVEL SECURITY;

-- Events policies
-- Anyone can view events (public access for participants)
CREATE POLICY "Events are viewable by everyone" 
ON public.events FOR SELECT 
USING (true);

-- Only organizers can create their own events
CREATE POLICY "Organizers can create their own events" 
ON public.events FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = organizer_id);

-- Only organizers can update their own events
CREATE POLICY "Organizers can update their own events" 
ON public.events FOR UPDATE 
TO authenticated
USING (auth.uid() = organizer_id);

-- Only organizers can delete their own events
CREATE POLICY "Organizers can delete their own events" 
ON public.events FOR DELETE 
TO authenticated
USING (auth.uid() = organizer_id);

-- Participants policies
-- Anyone can view participants (public access)
CREATE POLICY "Participants are viewable by everyone" 
ON public.participants FOR SELECT 
USING (true);

-- Anyone can join an event (public signup)
CREATE POLICY "Anyone can join an event" 
ON public.participants FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND is_open = true
  )
);

-- Participants can update their own entry OR organizer can update any
CREATE POLICY "Participants and organizers can update" 
ON public.participants FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id
  )
);

-- Participants can remove themselves OR organizer can remove any
CREATE POLICY "Participants and organizers can delete" 
ON public.participants FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id
  )
);

-- Event rules policies
-- Anyone can view rules
CREATE POLICY "Rules are viewable by everyone" 
ON public.event_rules FOR SELECT 
USING (true);

-- Only event organizers can manage rules
CREATE POLICY "Organizers can create rules" 
ON public.event_rules FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can update rules" 
ON public.event_rules FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);

CREATE POLICY "Organizers can delete rules" 
ON public.event_rules FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for events
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for participants table (for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;