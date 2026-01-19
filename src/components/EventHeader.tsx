import { Event } from '@/lib/types';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Share2, Copy, ExternalLink, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventHeaderProps {
  event: Event;
  isOrganizer?: boolean;
}

export function EventHeader({ event, isOrganizer = false }: EventHeaderProps) {
  const eventUrl = `${window.location.origin}/event/${event.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success('Link copiado!');
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `⚽ ${event.name}\n📅 ${format(parseISO(event.date), "dd 'de' MMMM", { locale: ptBR })}\n⏰ ${event.time}\n📍 ${event.location}\n\n🔗 Confirme sua presença: ${eventUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const formattedDate = format(parseISO(event.date), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Logo size="sm" />
        {isOrganizer && (
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">
              <Settings className="w-4 h-4 mr-2" />
              Dashboard
            </a>
          </Button>
        )}
      </div>

      <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 shadow-card">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-2xl font-bold text-foreground">{event.name}</h1>
          {!event.is_open && (
            <span className="shrink-0 px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium">
              Fechado
            </span>
          )}
        </div>

        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary shrink-0" />
            <span className="capitalize">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <span>{event.location}</span>
            {event.google_maps_url && (
              <a
                href={event.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLink}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Link
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={shareWhatsApp}
            className="flex-1"
          >
            <Share2 className="w-4 h-4 mr-2" />
            WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
