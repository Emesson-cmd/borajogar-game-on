import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventRule } from '@/lib/types';
import { ArrowLeft, Loader2, Plus, X, Save } from 'lucide-react';
import { toast } from 'sonner';

const EventForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [playerLimit, setPlayerLimit] = useState(20);
  const [goalkeeperLimit, setGoalkeeperLimit] = useState(4);
  const [isOpen, setIsOpen] = useState(true);
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isEditing && user) {
      fetchEvent();
    }
  }, [isEditing, user]);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('organizer_id', user?.id)
        .maybeSingle();

      if (eventError) throw eventError;
      if (!eventData) {
        toast.error('Evento não encontrado');
        navigate('/dashboard');
        return;
      }

      setName(eventData.name);
      setDate(eventData.date);
      setTime(eventData.time);
      setLocation(eventData.location);
      setGoogleMapsUrl(eventData.google_maps_url || '');
      setPlayerLimit(eventData.player_limit);
      setGoalkeeperLimit(eventData.goalkeeper_limit);
      setIsOpen(eventData.is_open);

      const { data: rulesData, error: rulesError } = await supabase
        .from('event_rules')
        .select('*')
        .eq('event_id', id)
        .order('order_index', { ascending: true });

      if (rulesError) throw rulesError;
      setRules(rulesData?.map(r => r.rule_text) || []);

    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Erro ao carregar evento');
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule('');
    }
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim() || !date || !time || !location.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setSaving(true);

    try {
      let eventId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('events')
          .update({
            name: name.trim(),
            date,
            time,
            location: location.trim(),
            google_maps_url: googleMapsUrl.trim() || null,
            player_limit: playerLimit,
            goalkeeper_limit: goalkeeperLimit,
            is_open: isOpen,
          })
          .eq('id', id);

        if (error) throw error;

        // Delete existing rules and re-add
        await supabase.from('event_rules').delete().eq('event_id', id);
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert({
            organizer_id: user.id,
            name: name.trim(),
            date,
            time,
            location: location.trim(),
            google_maps_url: googleMapsUrl.trim() || null,
            player_limit: playerLimit,
            goalkeeper_limit: goalkeeperLimit,
            is_open: isOpen,
          })
          .select()
          .single();

        if (error) throw error;
        eventId = data.id;
      }

      // Add rules
      if (rules.length > 0 && eventId) {
        const rulesData = rules.map((rule, index) => ({
          event_id: eventId,
          rule_text: rule,
          order_index: index,
        }));

        const { error: rulesError } = await supabase
          .from('event_rules')
          .insert(rulesData);

        if (rulesError) throw rulesError;
      }

      toast.success(isEditing ? 'Evento atualizado!' : 'Evento criado!');
      navigate(`/event/${eventId}`);
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error('Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <header className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
        </header>

        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Editar Jogo' : 'Novo Jogo'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Evento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: BoraJogar - Sábado"
                className="h-12 bg-secondary border-border/50"
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-12 bg-secondary border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-12 bg-secondary border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Arena Soccer, Barra da Tijuca"
                className="h-12 bg-secondary border-border/50"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleMapsUrl">Link do Google Maps</Label>
              <Input
                id="googleMapsUrl"
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="https://maps.google.com/..."
                className="h-12 bg-secondary border-border/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="playerLimit">Limite de Jogadores</Label>
                <Input
                  id="playerLimit"
                  type="number"
                  min={1}
                  max={50}
                  value={playerLimit}
                  onChange={(e) => setPlayerLimit(parseInt(e.target.value) || 20)}
                  className="h-12 bg-secondary border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goalkeeperLimit">Limite de Goleiros</Label>
                <Input
                  id="goalkeeperLimit"
                  type="number"
                  min={1}
                  max={10}
                  value={goalkeeperLimit}
                  onChange={(e) => setGoalkeeperLimit(parseInt(e.target.value) || 4)}
                  className="h-12 bg-secondary border-border/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="isOpen">Inscrições Abertas</Label>
                <p className="text-sm text-muted-foreground">
                  Jogadores podem se inscrever
                </p>
              </div>
              <Switch
                id="isOpen"
                checked={isOpen}
                onCheckedChange={setIsOpen}
              />
            </div>
          </div>

          {/* Rules Section */}
          <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card space-y-4">
            <h2 className="font-semibold text-lg">Regras do Jogo</h2>

            {rules.map((rule, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <span className="flex-1">{rule}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRule(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Adicionar nova regra..."
                className="h-10 bg-secondary border-border/50"
                maxLength={200}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRule();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={addRule}
                disabled={!newRule.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Criar Jogo'}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
