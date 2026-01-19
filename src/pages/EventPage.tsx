import { useParams } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import { useAuth } from '@/hooks/useAuth';
import { EventHeader } from '@/components/EventHeader';
import { ParticipantList } from '@/components/ParticipantList';
import { JoinEventForm } from '@/components/JoinEventForm';
import { EventRules } from '@/components/EventRules';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const EventPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    event,
    participants,
    rules,
    loading,
    getConfirmedPlayers,
    getConfirmedGoalkeepers,
    getWaitingList,
    canJoinAsPlayer,
    canJoinAsGoalkeeper,
    addParticipant,
    removeParticipant,
    switchRole,
  } = useEvent(id);

  const [currentParticipantName, setCurrentParticipantName] = useState<string>('');

  // Load stored name from localStorage
  useEffect(() => {
    const storedName = localStorage.getItem('borajogar_name');
    if (storedName) {
      setCurrentParticipantName(storedName);
    }
  }, []);

  // Update stored name when user joins
  const handleJoin = async (name: string, role: 'PLAYER' | 'GOALKEEPER') => {
    const success = await addParticipant(name, role);
    if (success) {
      setCurrentParticipantName(name);
    }
    return success;
  };

  const isOrganizer = user?.id === event?.organizer_id;

  // Check if current user is already in the list
  const isAlreadyJoined = participants.some(
    p => p.name.toLowerCase() === currentParticipantName.toLowerCase()
  );

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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        <EventHeader event={event} isOrganizer={isOrganizer} />

        {/* Join Form - only show if not already joined */}
        {!isAlreadyJoined && (
          <JoinEventForm
            onJoin={handleJoin}
            canJoinAsPlayer={canJoinAsPlayer()}
            canJoinAsGoalkeeper={canJoinAsGoalkeeper()}
            isOpen={event.is_open}
          />
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
          currentParticipantName={currentParticipantName}
          onRemove={removeParticipant}
          onSwitchRole={switchRole}
        />

        {/* Players List */}
        <ParticipantList
          title="Jogadores"
          icon="player"
          participants={getConfirmedPlayers()}
          limit={event.player_limit}
          isOrganizer={isOrganizer}
          currentParticipantName={currentParticipantName}
          onRemove={removeParticipant}
          onSwitchRole={switchRole}
        />

        {/* Waiting List */}
        {getWaitingList().length > 0 && (
          <ParticipantList
            title="Lista de Espera"
            icon="waiting"
            participants={getWaitingList()}
            isOrganizer={isOrganizer}
            currentParticipantName={currentParticipantName}
            onRemove={removeParticipant}
            onSwitchRole={switchRole}
          />
        )}
      </div>
    </div>
  );
};

export default EventPage;
