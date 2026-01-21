import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, User, Phone, CreditCard } from 'lucide-react';

interface ParticipantDetailsModalProps {
  participantId: string | null;
  onClose: () => void;
}

interface ParticipantDetails {
  participantId: string;
  fullName: string;
  cpf: string | null;
  cellphone: string | null;
  hasProfile: boolean;
  profileCreatedAt?: string;
}

const formatCPF = (cpf: string) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
};

const formatPhone = (phone: string) => {
  if (!phone) return phone;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
};

export function ParticipantDetailsModal({
  participantId,
  onClose,
}: ParticipantDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ParticipantDetails | null>(null);

  useEffect(() => {
    if (!participantId) {
      setDetails(null);
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          'get-participant-details',
          {
            body: { participantId },
          }
        );

        if (fnError) {
          console.error('Error invoking function:', fnError);
          setError('Erro ao carregar detalhes');
          return;
        }

        if (data.error) {
          setError(data.error);
          return;
        }

        setDetails(data);
      } catch (err) {
        console.error('Failed to fetch participant details:', err);
        setError('Erro ao carregar detalhes');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [participantId]);

  return (
    <Dialog open={!!participantId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border/50">
        <DialogHeader>
          <DialogTitle>Detalhes do Participante</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {details && !loading && !error && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nome Completo</p>
                <p className="font-medium text-lg">{details.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="p-3 rounded-full bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-medium text-lg font-mono">
                  {details.cpf ? formatCPF(details.cpf) : 'Não informado'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
              <div className="p-3 rounded-full bg-primary/10">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Celular</p>
                <p className="font-medium text-lg font-mono">
                  {details.cellphone ? formatPhone(details.cellphone) : 'Não informado'}
                </p>
              </div>
            </div>

            {!details.hasProfile && (
              <p className="text-sm text-muted-foreground text-center">
                Este participante ainda não completou o cadastro
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
