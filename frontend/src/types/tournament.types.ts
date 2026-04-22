export type TournamentStatus =
  | 'PREPARATION'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CANCELLED';

export interface Tournament {
  id: number;
  status: TournamentStatus;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  maxParticipant?: number;
}

export interface TournamentDetails {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  status: TournamentStatus;
  organizerTag: string;
  isPublic: boolean;
  winnerTeamName?: string | null;
  registeredTeamNames?: string[];
  teams?: string[];
  currentRoundLabel?: string | null;
}

export interface HomepageTournaments {
  lastFinished: TournamentDetails | null;
  inProgress: TournamentDetails | null;
  nextUpcoming: TournamentDetails | null;
}

export interface TournamentCard {
  tournament: TournamentDetails;
}
