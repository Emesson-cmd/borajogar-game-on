import { Participant, ParticipantRole } from '@/lib/types';
import { ParticipantCard } from './ParticipantCard';
import { User, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantListProps {
  title: string;
  icon: 'player' | 'goalkeeper' | 'waiting';
  participants: Participant[];
  limit?: number;
  isOrganizer?: boolean;
  currentUserId?: string;
  onRemove: (id: string) => void;
  onSwitchRole: (id: string, newRole: ParticipantRole) => void;
  onViewDetails?: (id: string) => void;
  trackPayments?: boolean;
  onTogglePayment?: (id: string, paid: boolean) => void;
}

export function ParticipantList({
  title,
  icon,
  participants,
  limit,
  isOrganizer = false,
  currentUserId,
  onRemove,
  onSwitchRole,
  onViewDetails,
  trackPayments = false,
  onTogglePayment,
}: ParticipantListProps) {
  const IconComponent = icon === 'player' ? User : icon === 'goalkeeper' ? Shield : Clock;
  const displayedParticipants = trackPayments
    ? [...participants].sort((first, second) => Number(second.paid) - Number(first.paid))
    : participants;
  
  const iconColors = {
    player: 'text-primary bg-primary/10',
    goalkeeper: 'text-goalkeeper bg-goalkeeper/10',
    waiting: 'text-waiting bg-waiting/10',
  };

  const badgeColors = {
    player: 'bg-primary text-primary-foreground',
    goalkeeper: 'bg-goalkeeper text-goalkeeper-foreground',
    waiting: 'bg-waiting text-waiting-foreground',
  };

  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 overflow-hidden shadow-card">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', iconColors[icon])}>
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className={cn('px-3 py-1 rounded-full text-sm font-bold', badgeColors[icon])}>
            {participants.length}{limit !== undefined && `/${limit}`}
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
        {participants.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhum participante ainda
          </p>
        ) : (
          displayedParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
              isOrganizer={isOrganizer}
              onRemove={onRemove}
              onSwitchRole={onSwitchRole}
              onViewDetails={onViewDetails}
              trackPayments={trackPayments}
              onTogglePayment={onTogglePayment}
              currentUserId={currentUserId}
            />
          ))
        )}
      </div>
    </div>
  );
}
