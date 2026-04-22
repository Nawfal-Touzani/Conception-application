import { TeamDto } from './team.types';
import { Tournament } from './tournament.types';

export type LineupStatus = 'NOT_SELECTED' | 'HIDDEN' | 'VISIBLE';
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

export interface PlayerSelectionDto {
  id: number;
  tag: string;
  imageUrl: string;
}

export interface MemberSelectionDto {
  id: number;
  tag: string;
  imageUrl: string;
  available: boolean;
}

export interface TeamMatchDto {
  id: number;
  name: string;
  lineupStatus: LineupStatus;
  lineup: PlayerSelectionDto[] | null;
}

export interface TeamBracketDto {
  id: number;
  name: string;
}

export interface MatchDetail {
  id: number;
  tournamentId: number;
  tournamentName: string;
  roundLabel: string;
  dateTime: string;
  state: MatchState;
  resultStatus: ResultStatus;
  teamA: TeamMatchDto | null;
  teamB: TeamMatchDto | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: number | null;
}

export interface MatchBracket {
  id: number;
  roundNumber: number;
  roundLabel: string;
  teamA: TeamBracketDto | null;
  teamB: TeamBracketDto | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: number | null;
  state: MatchState;
}

export interface MatchSelectionStatus {
  id: number;
  roundNumber: number;
  teamAReady: boolean;
  teamBReady: boolean;
}
