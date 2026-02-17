export type ParticipantRole = 'PLAYER' | 'GOALKEEPER';

export interface ParticipantProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string;
  cellphone: string | null;
  created_at: string;
  updated_at: string;
}
export type ParticipantStatus = 'CONFIRMED' | 'WAITING';

export interface Event {
  id: string;
  organizer_id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  google_maps_url: string | null;
  player_limit: number;
  goalkeeper_limit: number;
  is_open: boolean;
  requires_registration: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  user_id: string | null;
  name: string;
  role: ParticipantRole;
  status: ParticipantStatus;
  created_at: string;
}

export interface EventRule {
  id: string;
  event_id: string;
  rule_text: string;
  order_index: number;
  created_at: string;
}

export interface EventWithParticipants extends Event {
  participants: Participant[];
  rules: EventRule[];
}
