import { describe, it, expect } from 'vitest';
import {
  createTeams,
  createWhatsAppMessage,
  createWhatsAppTeamsMessage,
} from '@/lib/event-utils';
import { Event, Participant } from '@/lib/types';

const event: Event = {
  id: 'event-1',
  organizer_id: 'organizer-1',
  name: 'Jogo de sábado',
  date: '2026-10-10',
  time: '10:00',
  location: 'Quadra',
  google_maps_url: null,
  player_limit: 10,
  goalkeeper_limit: 2,
  is_open: true,
  requires_registration: false,
  created_at: '',
  updated_at: '',
};

const participants: Participant[] = [
  {
    id: '1',
    event_id: event.id,
    user_id: null,
    name: 'Ana',
    role: 'PLAYER',
    status: 'CONFIRMED',
    created_at: '',
  },
  {
    id: '2',
    event_id: event.id,
    user_id: null,
    name: 'Bia',
    role: 'PLAYER',
    status: 'CONFIRMED',
    created_at: '',
  },
  {
    id: '3',
    event_id: event.id,
    user_id: null,
    name: 'Caio',
    role: 'GOALKEEPER',
    status: 'CONFIRMED',
    created_at: '',
  },
  {
    id: '4',
    event_id: event.id,
    user_id: null,
    name: 'Davi',
    role: 'PLAYER',
    status: 'WAITING',
    created_at: '',
  },
];

describe('event utilities', () => {
  it('draws the requested number of teams with role limits per team', () => {
    const result = createTeams(
      participants,
      { teamCount: 3, playersPerTeam: 1, goalkeepersPerTeam: 1 },
      () => 0,
    );

    expect(result.teams).toHaveLength(3);
    expect(
      result.teams
        .flat()
        .map(({ id }) => id)
        .sort(),
    ).toEqual(['1', '2', '3']);
    expect(
      result.teams.every(
        (team) => team.filter(({ role }) => role === 'PLAYER').length <= 1,
      ),
    ).toBe(true);
    expect(
      result.teams.every(
        (team) => team.filter(({ role }) => role === 'GOALKEEPER').length <= 1,
      ),
    ).toBe(true);
    expect(result.unassigned).toHaveLength(0);
  });

  it('returns confirmed participants who exceed the configured team capacity', () => {
    const result = createTeams(
      participants,
      { teamCount: 2, playersPerTeam: 1, goalkeepersPerTeam: 0 },
      () => 0,
    );

    expect(result.teams.flat()).toHaveLength(2);
    expect(result.unassigned.map(({ id }) => id)).toEqual(['3']);
  });

  it('formats the drawn teams and unassigned players for WhatsApp', () => {
    const result = createTeams(
      participants,
      { teamCount: 2, playersPerTeam: 1, goalkeepersPerTeam: 0 },
      () => 0,
    );
    const message = createWhatsAppTeamsMessage(event, result, '/event/event-1');

    expect(message).toContain('*Jogo de sábado*');
    expect(message).toContain('*TIME 1*');
    expect(message).toContain('*TIME 2*');
    expect(message).toContain('*Jogadores*');
    expect(message).toContain('*Goleiros*');
    expect(message).toContain('⚠️ *Sem time (limite de vagas)*');
    expect(message).toContain('- Caio (Goleiro)');
    expect(message).toContain('/event/event-1');
  });

  it('includes the current participant list in the WhatsApp message', () => {
    const message = createWhatsAppMessage(
      event,
      participants,
      '/event/event-1',
    );

    expect(message).toContain('Jogadores cadastrados (4)');
    expect(message).toContain('Ana - Jogador');
    expect(message).toContain('Caio - Goleiro');
    expect(message).toContain('Davi - Jogador (espera)');
    expect(message).toContain('/event/event-1');
  });
});
