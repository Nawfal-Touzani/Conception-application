import { MatchDetail } from '../../types/match.types';

// recupere le dernier match joue si il existe
export const getLastPlayedMatch = (past: MatchDetail[]): MatchDetail | null => {
  return past.length > 0 ? past[0] : null;
};

// recupere le prochain match si il existe
export const getNextMatch = (upcoming: MatchDetail[]): MatchDetail | null => {
  return upcoming.length > 0 ? upcoming[0] : null;
};

// dit si le score est visible
export const isScorePublic = (match: MatchDetail): boolean => {
  return match.scoreA !== null && match.scoreB !== null;
};

// dit si l'equipe a gagne
export const isTeamAWinner = (match: MatchDetail): boolean => {
  return match.winnerId === match.teamA?.id;
};

// dit si l'equipe b a gagne
export const isTeamBWinner = (match: MatchDetail): boolean => {
  return match.winnerId === match.teamB?.id;
};

// genere le libelle du compteur avec pluriel
export const getMatchCountLabel = (count: number): string => {
  return `${count} match${count > 1 ? 's' : ''}`;
};
