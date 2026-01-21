import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to get their ID
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { participantId } = await req.json();
    if (!participantId) {
      return new Response(
        JSON.stringify({ error: 'Missing participantId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get the participant and their event
    const { data: participant, error: participantError } = await supabaseAdmin
      .from('participants')
      .select('id, event_id, user_id, name')
      .eq('id', participantId)
      .maybeSingle();

    if (participantError) {
      console.error('Error fetching participant:', participantError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch participant' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!participant) {
      return new Response(
        JSON.stringify({ error: 'Participant not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the event to verify the caller is the organizer
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('organizer_id')
      .eq('id', participant.event_id)
      .maybeSingle();

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the caller is the event organizer
    if (event.organizer_id !== user.id) {
      console.log('Access denied: user is not the organizer', { userId: user.id, organizerId: event.organizer_id });
      return new Response(
        JSON.stringify({ error: 'Only the event organizer can view participant details' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If participant doesn't have a user_id, return basic info only
    if (!participant.user_id) {
      return new Response(
        JSON.stringify({
          participantId: participant.id,
          fullName: participant.name,
          cpf: null,
          cellphone: null,
          hasProfile: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the participant's profile with PII
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('participant_profiles')
      .select('full_name, cpf, cellphone, created_at')
      .eq('user_id', participant.user_id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch participant profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!profile) {
      return new Response(
        JSON.stringify({
          participantId: participant.id,
          fullName: participant.name,
          cpf: null,
          cellphone: null,
          hasProfile: false
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully returning participant details for organizer');
    
    return new Response(
      JSON.stringify({
        participantId: participant.id,
        fullName: profile.full_name,
        cpf: profile.cpf,
        cellphone: profile.cellphone,
        profileCreatedAt: profile.created_at,
        hasProfile: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
