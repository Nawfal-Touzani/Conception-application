import { TournamentDetails } from '../../types/tournament.types';

// Enum to a readable
export const statusLabel: Record<string, string> = {
  PREPARATION: 'Prochain',
  IN_PROGRESS: 'À la une',
  FINISHED: 'Dernier',
  CANCELLED: 'Annulé',
};

// Date format
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

// Checks if registration is open
export const isRegistrationOpen = (tournament: TournamentDetails): boolean => {
  if (!tournament.isPublic) return false;
  const deadlinePassed = new Date(tournament.registrationDeadline) < new Date();
  const isFull = tournament.currentParticipants >= tournament.maxParticipants;
  return !deadlinePassed && !isFull;
};

// Differents display possible for a tournament card
export const getInfoLabel = (tournament: TournamentDetails): string => {
  if (tournament.status === 'FINISHED') {
    return 'VAINQUEUR';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return 'PHASE';
  }

  if (tournament.status === 'PREPARATION') {
    return 'INSCRIPTIONS';
  }

  return '';
};

export const getStateLabel = (tournament: TournamentDetails): string => {
  if (tournament.status === 'PREPARATION') {
    return 'À venir';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return 'En cours';
  }

  if (tournament.status === 'FINISHED') {
    return 'Terminé';
  }

  return 'Terminé';
};

export const getInfoValue = (tournament: TournamentDetails): string => {
  if (tournament.status === 'FINISHED') {
    return tournament.winnerTeamName ?? 'Non défini';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return tournament.currentRoundLabel ?? 'En cours';
  }

  if (tournament.status === 'PREPARATION') {
    return isRegistrationOpen(tournament) ? 'Ouvertes' : 'Fermées';
  }

  return 'Inconnue';
};

export const getTeamsValue = (tournament: TournamentDetails): string => {
  if (tournament.status === 'PREPARATION') {
    return `${tournament.currentParticipants}/${tournament.maxParticipants}`;
  }

  return `${tournament.currentParticipants}`;
};
