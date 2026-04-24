export type Match = { team1: string; team2: string };
export type Round = Match[];
export type Phase = 'draft' | 'confirmed' | 'published';
export type TeamPos = { roundIdx: number; matchIdx: number; slot: 0 | 1 };
export type Message = { text: string; type: 'success' | 'warn' | '' };
