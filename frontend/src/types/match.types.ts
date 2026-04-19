import { TeamDto } from './team.types';
import { Tournament } from './tournament.types';

export type MatchState = 'SCHEDULED' | 'PLAYED' | 'CANCELED' | 'FORFEIT';
export type ResultStatus = 'NOT_ENTERED' | 'PENDING' | 'VALIDATED' | 'REFUSED';

export interface Match {
  id: number;
  tournament: Tournament;
  teamA: TeamDto | null;
  teamB: TeamDto | null;
  roundNumber: number;
  dateTime: string;
  state: MatchState;
  scoreA: number | null;
  scoreB: number | null;
  resultStatus: ResultStatus;
  winner: TeamDto | null;
  nextMatch: Match | null;
}

export interface MatchResponseDto {
  id: number;
  teamA: string | null;
  teamB: string | null;
  roundNumber: number;
  state: MatchState;
  scoreA: number | null;
  scoreB: number | null;
  resultStatus: ResultStatus;
  winner: string | null;
}
