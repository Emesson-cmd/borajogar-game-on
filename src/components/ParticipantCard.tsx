import { Participant, ParticipantRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { X, ArrowLeftRight, User, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  isOrganizer?: boolean;
  onRemove: (id: string) => void;
  onSwitchRole: (id: string, newRole: ParticipantRole) => void;
  currentParticipantName?: string;
}

export function ParticipantCard({
  participant,
  index,
  isOrganizer = false,
  onRemove,
  onSwitchRole,
  currentParticipantName,
}: ParticipantCardProps) {
  const isCurrentUser = currentParticipantName?.toLowerCase() === participant.name.toLowerCase();
  const canModify = isOrganizer || isCurrentUser;

  const newRole: ParticipantRole = participant.role === 'PLAYER' ? 'GOALKEEPER' : 'PLAYER';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-200 animate-fade-in',
        isCurrentUser && 'border-primary/50 bg-primary/5',
        participant.status === 'WAITING' && 'opacity-70'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
          participant.role === 'PLAYER' 
            ? 'bg-primary/20 text-primary' 
            : 'bg-goalkeeper/20 text-goalkeeper'
        )}
      >
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{participant.name}</span>
          {isCurrentUser && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
              você
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          {participant.role === 'PLAYER' ? (
            <>
              <User className="w-3 h-3" />
              <span>Jogador</span>
            </>
          ) : (
            <>
              <Shield className="w-3 h-3" />
              <span>Goleiro</span>
            </>
          )}
        </div>
      </div>

      {canModify && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onSwitchRole(participant.id, newRole)}
            title={`Trocar para ${newRole === 'PLAYER' ? 'Jogador' : 'Goleiro'}`}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(participant.id)}
            title="Remover"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
