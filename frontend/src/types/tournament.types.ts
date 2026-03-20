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
  maxParticipants?: number;
}
