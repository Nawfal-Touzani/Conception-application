import { TournamentDetails } from '../../types/tournament.types';

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export const formatDateShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

export const formatDateFull = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

export function formatStatus(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'UPCOMING') return 'Complet';
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

export function getStateLabel(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    if (!tournament.isPublic) return 'En préparation';
    const deadlinePassed =
      new Date(tournament.registrationDeadline) < new Date();
    const isFull = tournament.currentParticipants >= tournament.maxParticipants;
    if (deadlinePassed || isFull) return 'En préparation';
    return 'Inscriptions ouvertes';
  }
  if (tournament.status === 'UPCOMING') return 'Complet';
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}
