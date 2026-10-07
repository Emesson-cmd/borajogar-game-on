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
import { Loader2, LogIn, Share2, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { Participant, ParticipantRole } from '@/lib/types';
import {
  createTeams,
  createWhatsAppTeamsMessage,
  TeamDrawResult,
} from '@/lib/event-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [teams, setTeams] = useState<TeamDrawResult | null>(null);
  const [drawDialogOpen, setDrawDialogOpen] = useState(false);
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [goalkeepersPerTeam, setGoalkeepersPerTeam] = useState(1);

  const isOrganizer = user?.id === event?.organizer_id;

  // Check if current user is already in the list
  const isAlreadyJoined = user
    ? participants.some((p) => p.user_id === user.id)
    : false;

  const handleJoin = async (role: ParticipantRole) => {
    if (!user || !profile) return false;
    return addParticipant(profile.full_name, role, user.id, false);
  };

  const handleOrganizerJoin = async (
    name: string,
    role: ParticipantRole,
    isOrganizerSelf = false,
  ) => {
    if (!user) return false;
    return addParticipant(
      name,
      role,
      isOrganizerSelf ? user.id : undefined,
      false,
    );
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
  const showJoinForm =
    user && hasProfile && event.is_open && !isAlreadyJoined && !isOrganizer;
  const showOrganizerJoinForm = isOrganizer && event.is_open;
  // Already joined message
  const showAlreadyJoinedMessage = user && hasProfile && isAlreadyJoined;
  const shareTeamsOnWhatsApp = () => {
    if (!teams) return;
    const eventUrl = `${window.location.origin}/event/${event.id}`;
    const message = createWhatsAppTeamsMessage(event, teams, eventUrl);
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <EventHeader event={event} participants={participants} />

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

        {showOrganizerJoinForm && (
          <AnonymousJoinForm
            onJoin={handleOrganizerJoin}
            canJoinAsPlayer={canJoinAsPlayer()}
            canJoinAsGoalkeeper={canJoinAsGoalkeeper()}
            isOpen={event.is_open}
            initialName={isAlreadyJoined ? '' : profile?.full_name}
            title="Adicionar participante"
            isOrganizerForm
            organizerAlreadyJoined={isAlreadyJoined}
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

        {isOrganizer && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => setDrawDialogOpen(true)}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Sortear times
          </Button>
        )}

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

      <Dialog
        open={drawDialogOpen}
        onOpenChange={(open) => setDrawDialogOpen(open)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sortear times</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="team-count">Quantidade de times</Label>
              <Input
                id="team-count"
                type="number"
                min={2}
                max={20}
                value={teamCount}
                onChange={(event) => {
                  setTeamCount(
                    Math.max(2, Math.min(20, Number(event.target.value) || 2)),
                  );
                  setTeams(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="players-per-team">Jogadores por time</Label>
              <Input
                id="players-per-team"
                type="number"
                min={0}
                max={50}
                value={playersPerTeam}
                onChange={(event) => {
                  setPlayersPerTeam(
                    Math.max(0, Math.min(50, Number(event.target.value) || 0)),
                  );
                  setTeams(null);
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalkeepers-per-team">Goleiros por time</Label>
              <Input
                id="goalkeepers-per-team"
                type="number"
                min={0}
                max={10}
                value={goalkeepersPerTeam}
                onChange={(event) => {
                  setGoalkeepersPerTeam(
                    Math.max(0, Math.min(10, Number(event.target.value) || 0)),
                  );
                  setTeams(null);
                }}
              />
            </div>
          </div>
          <Button
            onClick={() =>
              setTeams(
                createTeams(participants, {
                  teamCount,
                  playersPerTeam,
                  goalkeepersPerTeam,
                }),
              )
            }
            disabled={
              playersPerTeam + goalkeepersPerTeam === 0 ||
              !participants.some(
                (participant) => participant.status === 'CONFIRMED',
              )
            }
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Sortear
          </Button>
          {teams && (
            <div className="space-y-4">
              <Button onClick={shareTeamsOnWhatsApp} className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar no WhatsApp
              </Button>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {teams.teams.map((team, teamIndex) => (
                  <section key={teamIndex} className="min-w-0">
                    <h3 className="mb-2 font-semibold">Time {teamIndex + 1}</h3>
                    {team.length ? (
                      <ul className="space-y-2 text-sm">
                        {team.map((participant) => (
                          <li key={participant.id} className="break-words">
                            {participant.name}
                            <span className="block text-xs text-muted-foreground">
                              {participant.role === 'GOALKEEPER'
                                ? 'Goleiro'
                                : 'Jogador'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Sem participantes
                      </p>
                    )}
                  </section>
                ))}
              </div>
              {teams.unassigned.length > 0 && (
                <section className="border-t border-border pt-3">
                  <h3 className="mb-2 font-semibold">
                    Sem time por limite de vagas
                  </h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {teams.unassigned.map((participant) => (
                      <li key={participant.id}>
                        {participant.name} (
                        {participant.role === 'GOALKEEPER'
                          ? 'Goleiro'
                          : 'Jogador'}
                        )
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventPage;
