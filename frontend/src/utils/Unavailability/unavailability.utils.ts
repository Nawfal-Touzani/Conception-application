import type { UnavailabilityDates } from '../../types/unavailability.types';

export const validateUnavailabilityDates = ({
  startDate,
  endDate,
}: UnavailabilityDates): string | null => {
  if (!startDate || !endDate)
    return 'Veuillez sélectionner une date de début et de fin';

  const today = new Date().toISOString().split('T')[0];
  if (startDate < today)
    return 'La date de début ne peut pas être dans le passé';

  if (endDate < startDate)
    return 'La date de fin doit être postérieure à la date de début';

  return null;
};
