import { Participant, ParticipantRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  X,
  ArrowLeftRight,
  User,
  Shield,
  Eye,
  BanknoteX,
  BanknoteCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ParticipantCardProps {
  participant: Participant;
  index: number;
  isOrganizer?: boolean;
  onRemove: (id: string) => void;
  onSwitchRole: (id: string, newRole: ParticipantRole) => void;
  onViewDetails?: (id: string) => void;
  trackPayments?: boolean;
  onTogglePayment?: (id: string, paid: boolean) => void;
  currentUserId?: string;
}

export function ParticipantCard({
  participant,
  index,
  isOrganizer = false,
  onRemove,
  onSwitchRole,
  onViewDetails,
  trackPayments = false,
  onTogglePayment,
  currentUserId,
}: ParticipantCardProps) {
  const isCurrentUser = currentUserId && participant.user_id === currentUserId;
  // Can modify if: organizer (always), or current user (only if they have user_id)
  const canModify = isOrganizer || isCurrentUser;

  const newRole: ParticipantRole =
    participant.role === "PLAYER" ? "GOALKEEPER" : "PLAYER";

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50 transition-all duration-200 animate-fade-in",
        isCurrentUser && "border-primary/50 bg-primary/5",
        participant.status === "WAITING" && "opacity-70",
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          participant.role === "PLAYER"
            ? "bg-primary/20 text-primary"
            : "bg-goalkeeper/20 text-goalkeeper",
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
          {participant.role === "PLAYER" ? (
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

      <div className="flex items-center gap-1 shrink-0">
        {trackPayments && (
          isOrganizer && onTogglePayment ? (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8",
                participant.paid
                  ? "text-success hover:text-success"
                  : "text-muted-foreground hover:text-success",
              )}
              onClick={() => onTogglePayment(participant.id, !participant.paid)}
              title={participant.paid ? "Marcar como não pago" : "Marcar como pago"}
              aria-label={participant.paid ? "Marcar como não pago" : "Marcar como pago"}
            >
              {participant.paid ? (
                <BanknoteCheck className="w-4 h-4" />
              ) : (
                <BanknoteX className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center",
                participant.paid ? "text-success" : "text-muted-foreground",
              )}
              title={participant.paid ? "Pagamento realizado" : "Pagamento pendente"}
              aria-label={participant.paid ? "Pagamento realizado" : "Pagamento pendente"}
            >
              {participant.paid ? (
                <BanknoteCheck className="w-4 h-4" />
              ) : (
                <BanknoteX className="w-4 h-4" />
              )}
            </span>
          )
        )}
        {isOrganizer && onViewDetails && participant.user_id && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={() => onViewDetails(participant.id)}
            title="Ver detalhes"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
        {canModify && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onSwitchRole(participant.id, newRole)}
              title={`Trocar para ${newRole === "PLAYER" ? "Jogador" : "Goleiro"}`}
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
          </>
        )}
      </div>
    </div>
  );
}
