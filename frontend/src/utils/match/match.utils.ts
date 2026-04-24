import { MatchState, ResultStatus } from '../../types/match.types';

// Formate une date ISO en format lisible fr-BE (ex: "mardi 21 avril 2026 à 18:30")
export const formatMatchDateTime = (dateTime: string): string => {
  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(dateTime));
};

// Retourne le libellé français de l'état d'un match
export const formatMatchState = (state: MatchState): string => {
  if (state === 'SCHEDULED') return 'Planifié';
  if (state === 'PLAYED') return 'Joué';
  if (state === 'CANCELED') return 'Annulé';
  if (state === 'FORFEIT') return 'Forfait';
  return state;
};

// Retourne le libellé français du statut du résultat d'un match
export const formatResultStatus = (status: ResultStatus): string => {
  if (status === 'NOT_ENTERED') return 'Score non saisi';
  if (status === 'PENDING') return 'En attente de validation';
  if (status === 'VALIDATED') return 'Validé';
  if (status === 'REFUSED') return 'Contesté';
  return status;
};

// Retourne la couleur associée à l'état d'un match (utilisée pour les badges et indicateurs)
export const getStateColor = (state: MatchState): string => {
  if (state === 'SCHEDULED') return '#3a7bd5';
  if (state === 'PLAYED') return '#2ecc71';
  if (state === 'CANCELED') return '#e74c3c';
  if (state === 'FORFEIT') return '#e67e22';
  return '#ffffff';
};
