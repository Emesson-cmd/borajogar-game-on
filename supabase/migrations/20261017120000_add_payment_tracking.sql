ALTER TABLE public.events
ADD COLUMN payment_tracking_enabled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.events.payment_tracking_enabled IS
  'Whether payment status is tracked for participants in this event.';

ALTER TABLE public.participants
ADD COLUMN paid BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.participants.paid IS
  'Whether the participant has paid for this event.';
