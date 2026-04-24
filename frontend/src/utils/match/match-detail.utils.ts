import { MatchDetail, TeamMatchDto } from '../../types/match.types';

// dit si le score est disponible pour etre affiche
export const isScorePublic = (match: MatchDetail): boolean => {
  return match.scoreA !== null && match.scoreB !== null;
};

// dit si le resultat est en attente de validation
export const isPendingResult = (match: MatchDetail): boolean => {
  return match.resultStatus === 'PENDING';
};

// dit si le match est encore planifie
export const isScheduledMatch = (match: MatchDetail): boolean => {
  return match.state === 'SCHEDULED';
};

// retrouve l'equipe de l'utilisateur dans le match
export const getMyTeam = (
  match: MatchDetail,
  userTeamId?: number | null,
): TeamMatchDto | null => {
  if (userTeamId == null) return null;

  if (match.teamA?.id === userTeamId) return match.teamA;
  if (match.teamB?.id === userTeamId) return match.teamB;

  return null;
};

// dit si l'equipe a deja une composition
export const hasExistingSelection = (team: TeamMatchDto | null): boolean => {
  if (!team) return false;

  return team.lineupStatus !== 'NOT_SELECTED';
};

// construit une url complete pour l'avatar si besoin
export const getPlayerAvatarUrl = (
  imageUrl?: string | null,
  baseUrl = 'http://localhost:3000',
): string | undefined => {
  if (!imageUrl) return undefined;

  if (imageUrl.startsWith('/')) {
    return `${baseUrl}${imageUrl}`;
  }

  return imageUrl;
};
