import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Event, Participant, EventRule, ParticipantRole, ParticipantStatus } from '@/lib/types';
import { toast } from 'sonner';

export function useEvent(eventId: string | undefined) {
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [rules, setRules] = useState<EventRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;

    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) throw eventError;
      setEvent(eventData);

      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (participantsError) throw participantsError;
      setParticipants(participantsData || []);

      const { data: rulesData, error: rulesError } = await supabase
        .from('event_rules')
        .select('*')
        .eq('event_id', eventId)
        .order('order_index', { ascending: true });

      if (rulesError) throw rulesError;
      setRules(rulesData || []);

    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Real-time subscription for participants
  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`participants-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'participants',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchEvent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchEvent]);

  const getConfirmedPlayers = () => 
    participants.filter(p => p.role === 'PLAYER' && p.status === 'CONFIRMED');

  const getConfirmedGoalkeepers = () => 
    participants.filter(p => p.role === 'GOALKEEPER' && p.status === 'CONFIRMED');

  const getWaitingList = () => 
    participants.filter(p => p.status === 'WAITING');

  const canJoinAsPlayer = () => {
    if (!event) return false;
    return getConfirmedPlayers().length < event.player_limit;
  };

  const canJoinAsGoalkeeper = () => {
    if (!event) return false;
    return getConfirmedGoalkeepers().length < event.goalkeeper_limit;
  };

  const addParticipant = async (name: string, role: ParticipantRole, userId?: string): Promise<boolean> => {
    if (!event || !eventId) return false;

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('Digite seu nome');
      return false;
    }

    // Check for duplicate user_id if provided
    if (userId) {
      const existingByUserId = participants.find(p => p.user_id === userId);
      if (existingByUserId) {
        toast.error('Você já está inscrito neste evento');
        return false;
      }
    }

    // Check for duplicate name
    const existingParticipant = participants.find(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingParticipant) {
      toast.error('Este nome já está na lista');
      return false;
    }

    // Determine status based on availability
    let status: ParticipantStatus = 'CONFIRMED';
    if (role === 'PLAYER' && !canJoinAsPlayer()) {
      status = 'WAITING';
    } else if (role === 'GOALKEEPER' && !canJoinAsGoalkeeper()) {
      status = 'WAITING';
    }

    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          event_id: eventId,
          name: trimmedName,
          role,
          status,
          user_id: userId || null,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Este nome já está na lista');
        } else {
          throw error;
        }
        return false;
      }

      if (status === 'WAITING') {
        toast.info('Lista cheia! Você entrou na lista de espera');
      } else {
        toast.success('Inscrição confirmada!');
      }
      return true;
    } catch (error: any) {
      console.error('Error adding participant:', error);
      toast.error('Erro ao fazer inscrição');
      return false;
    }
  };

  const removeParticipant = async (participantId: string): Promise<boolean> => {
    try {
      const removedParticipant = participants.find(p => p.id === participantId);
      
      const { error } = await supabase
        .from('participants')
        .delete()
        .eq('id', participantId);

      if (error) throw error;

      // Auto-promote from waiting list
      if (removedParticipant?.status === 'CONFIRMED' && event) {
        const waitingList = getWaitingList();
        const waitingWithSameRole = waitingList.find(p => p.role === removedParticipant.role);
        
        if (waitingWithSameRole) {
          await supabase
            .from('participants')
            .update({ status: 'CONFIRMED' })
            .eq('id', waitingWithSameRole.id);
        }
      }

      toast.success('Removido da lista');
      return true;
    } catch (error: any) {
      console.error('Error removing participant:', error);
      toast.error('Erro ao remover');
      return false;
    }
  };

  const switchRole = async (participantId: string, newRole: ParticipantRole): Promise<boolean> => {
    if (!event) return false;

    const participant = participants.find(p => p.id === participantId);
    if (!participant) return false;

    // Check if there's room in the new role
    let newStatus: ParticipantStatus = 'CONFIRMED';
    if (newRole === 'PLAYER' && getConfirmedPlayers().length >= event.player_limit) {
      newStatus = 'WAITING';
    } else if (newRole === 'GOALKEEPER' && getConfirmedGoalkeepers().length >= event.goalkeeper_limit) {
      newStatus = 'WAITING';
    }

    try {
      const { error } = await supabase
        .from('participants')
        .update({ role: newRole, status: newStatus })
        .eq('id', participantId);

      if (error) throw error;

      // If original spot was confirmed, promote from waiting list
      if (participant.status === 'CONFIRMED') {
        const waitingWithOldRole = getWaitingList().find(p => p.role === participant.role);
        if (waitingWithOldRole) {
          await supabase
            .from('participants')
            .update({ status: 'CONFIRMED' })
            .eq('id', waitingWithOldRole.id);
        }
      }

      if (newStatus === 'WAITING') {
        toast.info('Posição cheia! Você está na lista de espera');
      } else {
        toast.success('Posição alterada!');
      }
      return true;
    } catch (error: any) {
      console.error('Error switching role:', error);
      toast.error('Erro ao trocar posição');
      return false;
    }
  };

  return {
    event,
    participants,
    rules,
    loading,
    refetch: fetchEvent,
    getConfirmedPlayers,
    getConfirmedGoalkeepers,
    getWaitingList,
    canJoinAsPlayer,
    canJoinAsGoalkeeper,
    addParticipant,
    removeParticipant,
    switchRole,
  };
}
