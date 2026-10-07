import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ParticipantRole } from '@/lib/types';
import { User, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnonymousJoinFormProps {
  onJoin: (
    name: string,
    role: ParticipantRole,
    isOrganizerSelf?: boolean,
  ) => Promise<boolean>;
  canJoinAsPlayer: boolean;
  canJoinAsGoalkeeper: boolean;
  isOpen: boolean;
  initialName?: string;
  title?: string;
  isOrganizerForm?: boolean;
  organizerAlreadyJoined?: boolean;
}

export function AnonymousJoinForm({
  onJoin,
  canJoinAsPlayer,
  canJoinAsGoalkeeper,
  isOpen,
  initialName = '',
  title = 'Inscrever-se no Jogo',
  isOrganizerForm = false,
  organizerAlreadyJoined = false,
}: AnonymousJoinFormProps) {
  const [name, setName] = useState(initialName);
  const [isOrganizerSelf, setIsOrganizerSelf] = useState(
    isOrganizerForm && !organizerAlreadyJoined,
  );
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>('PLAYER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setLoading(true);
    const success = await onJoin(
      name,
      selectedRole,
      isOrganizerForm && isOrganizerSelf,
    );
    if (success) {
      setName('');
      setSelectedRole('PLAYER');
      setIsOrganizerSelf(false);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <p className="text-destructive font-medium">Inscrições encerradas</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gradient-card rounded-xl border border-border/50 p-4 shadow-card space-y-4">
        <h3 className="font-semibold text-lg">{title}</h3>

        <div className="space-y-2">
          <Label htmlFor="anonymous-name">
            {isOrganizerForm ? 'Nome do participante *' : 'Seu Nome *'}
          </Label>
          <Input
            id="anonymous-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome"
            className="h-10 bg-secondary border-border/50"
            maxLength={100}
            disabled={isOrganizerForm && isOrganizerSelf && !!initialName}
          />
        </div>

        {isOrganizerForm && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="organizer-is-self"
              checked={isOrganizerSelf}
              disabled={organizerAlreadyJoined}
              onCheckedChange={(checked) => {
                const isSelf = checked === true;
                setIsOrganizerSelf(isSelf);
                setName(isSelf ? initialName : '');
              }}
            />
            <Label htmlFor="organizer-is-self">Este participante sou eu</Label>
          </div>
        )}

        <div className="space-y-2">
          <Label>Escolha sua Posição *</Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedRole('PLAYER')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                selectedRole === 'PLAYER'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/50',
              )}
            >
              <User className="w-6 h-6" />
              <span className="font-semibold text-sm">Jogador</span>
              {!canJoinAsPlayer && (
                <span className="text-xs text-waiting">Lista de espera</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('GOALKEEPER')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                selectedRole === 'GOALKEEPER'
                  ? 'border-goalkeeper bg-goalkeeper/10 text-goalkeeper'
                  : 'border-border/50 bg-secondary/50 text-muted-foreground hover:border-goalkeeper/50',
              )}
            >
              <Shield className="w-6 h-6" />
              <span className="font-semibold text-sm">Goleiro</span>
              {!canJoinAsGoalkeeper && (
                <span className="text-xs text-waiting">Lista de espera</span>
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={loading || !name.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Inscrevendo...
            </>
          ) : (
            'Confirmar Presença'
          )}
        </Button>
      </div>
    </form>
  );
}
