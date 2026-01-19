import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ParticipantRole } from '@/lib/types';
import { User, Shield, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JoinEventFormProps {
  onJoin: (name: string, role: ParticipantRole) => Promise<boolean>;
  canJoinAsPlayer: boolean;
  canJoinAsGoalkeeper: boolean;
  isOpen: boolean;
}

export function JoinEventForm({
  onJoin,
  canJoinAsPlayer,
  canJoinAsGoalkeeper,
  isOpen,
}: JoinEventFormProps) {
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<ParticipantRole>('PLAYER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    const success = await onJoin(name.trim(), selectedRole);
    setLoading(false);

    if (success) {
      // Store name in localStorage for future reference
      localStorage.setItem('borajogar_name', name.trim());
      setName('');
    }
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
      <div className="bg-gradient-card rounded-xl border border-border/50 p-4 shadow-card">
        <h3 className="font-semibold text-lg mb-4">Entrar no Jogo</h3>

        <Input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 h-12 text-base bg-secondary border-border/50"
          maxLength={50}
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setSelectedRole('PLAYER')}
            className={cn(
              'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
              selectedRole === 'PLAYER'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/50 bg-secondary/50 text-muted-foreground hover:border-primary/50'
            )}
          >
            <User className="w-6 h-6" />
            <span className="font-semibold">Jogador</span>
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
                : 'border-border/50 bg-secondary/50 text-muted-foreground hover:border-goalkeeper/50'
            )}
          >
            <Shield className="w-6 h-6" />
            <span className="font-semibold">Goleiro</span>
            {!canJoinAsGoalkeeper && (
              <span className="text-xs text-waiting">Lista de espera</span>
            )}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base"
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Confirmar Presença'
          )}
        </Button>
      </div>
    </form>
  );
}
