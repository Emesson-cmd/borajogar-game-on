import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';
import { LogOut, Plus, Users } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useParticipantProfile } from '@/hooks/useParticipantProfile';

type ProfileDropdownProps = {
  user: User | null;
};

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  const { signOut } = useAuth();
  const { profile } = useParticipantProfile()
  const [participatingEvents, setParticipatingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);


  console.log('profile', profile)
  useEffect(() => {
    if (window === undefined) return;

    if (!user?.id) return;

    const fetchParticipatingEvents = async () => {
      try {
        setLoading(true);
        // Get all participants for this user
        const { data: participants, error: participantsError } = await supabase
          .from('participants')
          .select('event_id')
          .eq('user_id', user.id);

        if (participantsError) throw participantsError;

        if (!participants || participants.length === 0) {
          setParticipatingEvents([]);
          return;
        }

        // Get the events for those participants
        const eventIds = participants.map((p) => p.event_id);
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds)
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;
        setParticipatingEvents(events || []);
      } catch (error) {
        console.error('Error fetching participating events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParticipatingEvents();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          {profile?.full_name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="">
        <DropdownMenuLabel className="font-semibold">
          {user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link to="/event/new">
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Novo Jogo
          </DropdownMenuItem>
        </Link>

        {participatingEvents.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
              Meus Jogos ({participatingEvents.length})
            </DropdownMenuLabel>
            {participatingEvents.map((event) => (
              <Link key={event.id} to={`/event/${event.id}`}>
                <DropdownMenuItem className="cursor-pointer flex-col items-start py-2">
                  <span className="font-medium text-sm">{event.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('pt-BR')} às{' '}
                    {event.time}
                  </span>
                </DropdownMenuItem>
              </Link>
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
