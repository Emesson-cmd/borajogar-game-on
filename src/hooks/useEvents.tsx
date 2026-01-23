import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Event } from '@/lib/types';

export function useEvents(organizerId: string) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Evento excluído');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erro ao excluir evento');
    }
  };

  const handleDuplicateEvent = async (eventId: string) => {
    try {
      // Fetch the original event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (eventError) throw eventError;
      if (!eventData) {
        toast.error('Evento não encontrado');
        return;
      }

      // Create new event with copied data (no participants)
      const { data: newEvent, error: insertError } = await supabase
        .from('events')
        .insert({
          organizer_id: eventData.organizer_id,
          name: `${eventData.name} (Cópia)`,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          google_maps_url: eventData.google_maps_url,
          player_limit: eventData.player_limit,
          goalkeeper_limit: eventData.goalkeeper_limit,
          is_open: eventData.is_open,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Copy event rules
      const { data: rules, error: rulesError } = await supabase
        .from('event_rules')
        .select('*')
        .eq('event_id', eventId);

      if (rulesError) throw rulesError;

      if (rules && rules.length > 0) {
        const newRules = rules.map((rule) => ({
          event_id: newEvent.id,
          rule_text: rule.rule_text,
          order_index: rule.order_index,
        }));

        const { error: copyRulesError } = await supabase
          .from('event_rules')
          .insert(newRules);

        if (copyRulesError) throw copyRulesError;
      }

      toast.success('Evento duplicado com sucesso!');
      fetchEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast.error('Erro ao duplicar evento');
    }
  };

  return {
    events,
    loading,
    fetchEvents,
    handleDeleteEvent,
    handleDuplicateEvent,
  };
}
