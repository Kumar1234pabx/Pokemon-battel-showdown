export type AnnouncementType = 'Update' | 'Agenda' | 'Poll';

export interface PollOption {
  text: string;
  count: number;
}

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title?: string;
  body?: string;
  ts: string;
  options?: string[]; // stored as original pipe-separated or raw array
  votes?: PollOption[];
  total?: number;
  myChoice?: string;
}

export interface Delegate {
  phone: string;
  name: string;
  committee: string;
  portfolio: string;
  class: string;
  section: string;
}

export interface Attendance {
  "Day 1 In"?: string;
  "Day 1 Out"?: string;
  "Day 2 In"?: string;
  "Day 2 Out"?: string;
  "Day 3 In"?: string;
  "Day 3 Out"?: string;
}

export interface RoomAllotment {
  committee: string;
  rooms: string[]; // [Day 1, Day 2, Day 3]
}

// Pokémon Game Types
export type PokemonType = 'Electric' | 'Fire' | 'Water' | 'Flying' | 'Psychic' | 'Fighting' | 'Steel' | 'Ghost' | 'Poison' | 'Normal' | 'Ground' | 'Rock' | 'Bug' | 'Grass' | 'Ice' | 'Dragon' | 'Dark' | 'Fairy';

export interface Move {
  name: string;
  type: PokemonType;
  power: number;
  accuracy: number;
  category: 'Physical' | 'Special' | 'Status';
  effect?: 'burn' | 'paralyze' | 'heal' | 'stat_up';
  description: string;
}

export interface Pokemon {
  id: string;
  name: string;
  type: PokemonType[];
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
  moves: Move[];
  status?: 'None' | 'Burned' | 'Paralyzed' | 'Poisoned' | 'Healed';
  dexNumber?: number;
  region?: string;
}

export interface BattleState {
  id: string;
  player1Phone: string;
  player1Name: string;
  player1Team: Pokemon[];
  player1ActiveIndex: number;
  player2Phone: string;
  player2Name: string;
  player2Team: Pokemon[];
  player2ActiveIndex: number;
  turn: number;
  player1MoveName: string | null;
  player2MoveName: string | null;
  log: string[];
  winnerPhone: string | null;
  status: 'active' | 'completed';
}

export interface LeaderboardEntry {
  phone: string;
  name: string;
  committee: string;
  wins: number;
  losses: number;
  rank?: number;
}
