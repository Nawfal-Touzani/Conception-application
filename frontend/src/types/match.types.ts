type MatchState = 'SCHEDULED' | 'PLAYED' | 'CANCELED' | 'FORFEIT';

type ResultStatus = 'NOT_ENTERED' | 'PENDING' | 'VALIDATED' | 'REFUSED';
export interface MatchResponseDto {
  id: number;
  scoreA: number;
  scoreB: number;
  state: MatchState;
  resultStatus: ResultStatus;
  winnerId: number | null;
}
