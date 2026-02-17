import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { useAuth } from '@/hooks/useAuth';
import { useParticipantProfile } from '@/hooks/useParticipantProfile';
import { EventHeader } from '@/components/EventHeader';
import { ParticipantList } from '@/components/ParticipantList';
import { JoinEventForm } from '@/components/JoinEventForm';
import { AnonymousJoinForm } from '@/components/AnonymousJoinForm';
import { EventRules } from '@/components/EventRules';
import { ParticipantDetailsModal } from '@/components/ParticipantDetailsModal';
import { Button } from '@/components/ui/button';
import { Loader2, LogIn } from 'lucide-react';
import { useState } from 'react';
import { ParticipantRole } from '@/lib/types';

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    loading: profileLoading,
    hasProfile,
  } = useParticipantProfile();
  const {
    event,
    participants,
    rules,
    loading: eventLoading,
    getConfirmedPlayers,
    getConfirmedGoalkeepers,
    getWaitingList,
    canJoinAsPlayer,
    canJoinAsGoalkeeper,
    addParticipant,
    removeParticipant,
    switchRole,
  } = useEvent(id);

  const [selectedParticipantId, setSelectedParticipantId] = useState<
    string | null
  >(null);

  const isOrganizer = user?.id === event?.organizer_id;

  // Check if current user is already in the list
  const isAlreadyJoined = user
    ? participants.some((p) => p.user_id === user.id)
    : false;

  const handleJoin = async (role: ParticipantRole) => {
    if (!user || !profile) return false;
    return addParticipant(profile.full_name, role, user.id, false);
  };

  const handleAnonymousJoin = async (name: string, role: ParticipantRole) => {
    // For anonymous join, allowDuplicateName is true (allows duplicate names)
    return addParticipant(name, role, undefined, false);
  };

  const handleViewDetails = (participantId: string) => {
    setSelectedParticipantId(participantId);
  };

  const loading = eventLoading || authLoading || profileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Evento não encontrado</h1>
          <p className="text-muted-foreground">
            Este link pode estar incorreto ou o evento foi removido.
          </p>
          <Link to="/">Voltar para a página inicial</Link>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  const showAuthPrompt = !user && event.is_open && event.requires_registration;
  // Authenticated but no profile - show profile creation prompt
  const showProfilePrompt =
    user && !hasProfile && event.is_open && event.requires_registration;
  // Show anonymous join form if registration is not required
  const showAnonymousJoinForm =
    !user && event.is_open && !event.requires_registration;
  // Join Form - only show if authenticated, has profile, and not already joined
  const showJoinForm = user && hasProfile && event.is_open && !isAlreadyJoined;
  // Already joined message
  const showAlreadyJoinedMessage = user && hasProfile && isAlreadyJoined;

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <EventHeader event={event} />

        {/* Auth prompt for unauthenticated users */}
        {showAuthPrompt && (
          <div className="bg-gradient-card rounded-xl border border-border/50 p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-2">Quer participar?</h3>
            <p className="text-muted-foreground mb-4">
              Faça login ou cadastre-se para confirmar sua presença no jogo.
            </p>
            <Button
              onClick={() =>
                navigate(`/participant-auth?redirect=/event/${id}`)
              }
              className="w-full h-12"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar / Cadastrar
            </Button>
          </div>
        )}

        {/* Profile prompt for authenticated users without profile */}
        {showProfilePrompt && (
          <div className="bg-gradient-card rounded-xl border border-border/50 p-6 shadow-card">
            <h3 className="font-semibold text-lg mb-2">
              Complete seu cadastro
            </h3>
            <p className="text-muted-foreground mb-4">
              Para participar, você precisa completar seu perfil com algumas
              informações.
            </p>
            <Button
              onClick={() =>
                navigate(`/participant-auth?redirect=/event/${id}`)
              }
              className="w-full h-12"
            >
              Completar Cadastro
            </Button>
          </div>
        )}

        {/* Anonymous Join Form - only show if registration not required and not authenticated */}
        {showAnonymousJoinForm && (
          <AnonymousJoinForm
            onJoin={handleAnonymousJoin}
            canJoinAsPlayer={canJoinAsPlayer()}
            canJoinAsGoalkeeper={canJoinAsGoalkeeper()}
            isOpen={event.is_open}
          />
        )}

        {/* Join Form - only show if authenticated, has profile, and not already joined */}
        {showJoinForm && (
          <JoinEventForm
            onJoin={handleJoin}
            canJoinAsPlayer={canJoinAsPlayer()}
            canJoinAsGoalkeeper={canJoinAsGoalkeeper()}
            isOpen={event.is_open}
            userName={profile!.full_name}
          />
        )}

        {/* Already joined message */}
        {showAlreadyJoinedMessage && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 text-center">
            <p className="text-success font-medium">
              ✓ Você está inscrito neste evento
            </p>
          </div>
        )}

        {/* Rules */}
        <EventRules rules={rules} />

        {/* Goalkeepers List */}
        <ParticipantList
          title="Goleiros"
          icon="goalkeeper"
          participants={getConfirmedGoalkeepers()}
          limit={event.goalkeeper_limit}
          isOrganizer={isOrganizer}
          currentUserId={user?.id}
          onRemove={removeParticipant}
          onSwitchRole={switchRole}
          onViewDetails={isOrganizer ? handleViewDetails : undefined}
        />

        {/* Players List */}
        <ParticipantList
          title="Jogadores"
          icon="player"
          participants={getConfirmedPlayers()}
          limit={event.player_limit}
          isOrganizer={isOrganizer}
          currentUserId={user?.id}
          onRemove={removeParticipant}
          onSwitchRole={switchRole}
          onViewDetails={isOrganizer ? handleViewDetails : undefined}
        />

        {/* Waiting List */}
        {getWaitingList().length > 0 && (
          <ParticipantList
            title="Lista de Espera"
            icon="waiting"
            participants={getWaitingList()}
            isOrganizer={isOrganizer}
            currentUserId={user?.id}
            onRemove={removeParticipant}
            onSwitchRole={switchRole}
            onViewDetails={isOrganizer ? handleViewDetails : undefined}
          />
        )}
      </div>

      {/* Participant Details Modal (for organizers) */}
      <ParticipantDetailsModal
        participantId={selectedParticipantId}
        onClose={() => setSelectedParticipantId(null)}
      />
    </div>
  );
};

export default EventPage;
