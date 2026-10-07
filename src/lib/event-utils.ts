import { Event, Participant } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function createTeams(
  participants: Participant[],
  options: TeamDrawOptions,
  random: () => number = Math.random,
): TeamDrawResult {
  const teams = Array.from(
    { length: options.teamCount },
    () => [] as Participant[],
  );
  const confirmedPlayers = shuffle(
    participants.filter(
      (participant) =>
        participant.role === 'PLAYER' && participant.status === 'CONFIRMED',
    ),
    random,
  );
  const confirmedGoalkeepers = shuffle(
    participants.filter(
      (participant) =>
        participant.role === 'GOALKEEPER' && participant.status === 'CONFIRMED',
    ),
    random,
  );
  const unassignedPlayers = confirmedPlayers.slice(
    options.teamCount * options.playersPerTeam,
  );
  const unassignedGoalkeepers = confirmedGoalkeepers.slice(
    options.teamCount * options.goalkeepersPerTeam,
  );
  const playerCounts = Array(options.teamCount).fill(0) as number[];
  const goalkeeperCounts = Array(options.teamCount).fill(0) as number[];

  distributeRole(
    confirmedPlayers.slice(0, options.teamCount * options.playersPerTeam),
    teams,
    playerCounts,
    options.playersPerTeam,
    random,
  );
  distributeRole(
    confirmedGoalkeepers.slice(
      0,
      options.teamCount * options.goalkeepersPerTeam,
    ),
    teams,
    goalkeeperCounts,
    options.goalkeepersPerTeam,
    random,
  );

  return {
    teams,
    unassigned: [...unassignedPlayers, ...unassignedGoalkeepers],
  };
}

export interface TeamDrawOptions {
  teamCount: number;
  playersPerTeam: number;
  goalkeepersPerTeam: number;
}

export interface TeamDrawResult {
  teams: Participant[][];
  unassigned: Participant[];
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.min(Math.floor(random() * (index + 1)), index);
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }
  return shuffled;
}

function distributeRole(
  participants: Participant[],
  teams: Participant[][],
  roleCounts: number[],
  roleLimit: number,
  random: () => number,
) {
  participants.forEach((participant) => {
    const lowestCount = Math.min(...roleCounts);
    const candidates = roleCounts
      .map((count, index) => ({ count, index }))
      .filter(({ count }) => count === lowestCount && count < roleLimit)
      .map(({ index }) => index);
    const teamIndex =
      candidates[
        Math.min(
          Math.floor(random() * candidates.length),
          candidates.length - 1,
        )
      ];
    teams[teamIndex].push(participant);
    roleCounts[teamIndex] += 1;
  });
}

export function createWhatsAppMessage(
  event: Event,
  participants: Participant[],
  eventUrl: string,
): string {
  const participantLines = participants.length
    ? participants
        .map((participant, index) => {
          const role =
            participant.role === 'GOALKEEPER' ? 'Goleiro' : 'Jogador';
          const status = participant.status === 'WAITING' ? ' (espera)' : '';
          return `${index + 1}. ${participant.name} - ${role}${status}`;
        })
        .join('\n')
    : 'Ninguém confirmou presença ainda.';

  return `⚽ ${event.name}
📅 ${format(parseISO(event.date), "dd 'de' MMMM", { locale: ptBR })}
⏰ ${event.time}
📍 ${event.location}

👥 Jogadores cadastrados (${participants.length}):
${participantLines}

👉 Confirme sua presença:
${eventUrl}`;
}

export function createWhatsAppTeamsMessage(
  event: Event,
  result: TeamDrawResult,
  eventUrl: string,
): string {
  const teamSections = result.teams
    .map((team, index) => {
      const formatRole = (role: Participant['role'], label: string) => {
        const names = team
          .filter((participant) => participant.role === role)
          .map(
            (participant, playerIndex) =>
              `${playerIndex + 1}. ${participant.name}`,
          );
        return `*${label}*\n${names.length ? names.join('\n') : 'Nenhum'}`;
      };

      return [
        `*TIME ${index + 1}*`,
        formatRole('PLAYER', 'Jogadores'),
        formatRole('GOALKEEPER', 'Goleiros'),
      ].join('\n');
    })
    .join('\n\n');

  const unassignedSection = result.unassigned.length
    ? `\n\n⚠️ *Sem time (limite de vagas)*\n${result.unassigned
        .map((participant) => {
          const role =
            participant.role === 'GOALKEEPER' ? 'Goleiro' : 'Jogador';
          return `- ${participant.name} (${role})`;
        })
        .join('\n')}`
    : '';

  return `⚽ *${event.name}*
📅 ${format(parseISO(event.date), "dd 'de' MMMM", { locale: ptBR })}
⏰ ${event.time}
📍 ${event.location}

🎲 *Times sorteados*

${teamSections}${unassignedSection}

👉 ${eventUrl}`;
}
