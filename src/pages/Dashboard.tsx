import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
import {
  Plus,
  Calendar,
  Users,
  LogOut,
  Loader2,
  ExternalLink,
  Trash2,
  Copy,
  Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProfileDropdown } from '@/components/ProfileDropdown';

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user?.id)
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8">
          <Logo size="sm" />
          <ProfileDropdown user={user} />
        </header>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Seus Jogos</h1>
          <Link to="/event/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Jogo
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 text-center shadow-card animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum jogo criado</h3>
            <p className="text-muted-foreground mb-6">
              Crie seu primeiro jogo e compartilhe o link com a galera
            </p>
            <Link to="/event/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Jogo
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="bg-gradient-card rounded-xl border border-border/50 p-4 shadow-card animate-fade-in hover:border-primary/30 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4 md:flex-row flex-col">
                  <div className="flex-1 min-w-0 max-w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg truncate">
                        {event.name}
                      </h3>
                      {!event.is_open && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-destructive/20 text-destructive text-xs">
                          Fechado
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(event.date), "dd 'de' MMM", {
                          locale: ptBR,
                        })}
                      </span>
                      <span>{event.time}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.player_limit + event.goalkeeper_limit} vagas
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link to={`/event/${event.id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to={`/event/${event.id}/edit`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => handleDuplicateEvent(event.id)}
                      title="Duplicar evento"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="text-muted-foreground text-destructive "
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
