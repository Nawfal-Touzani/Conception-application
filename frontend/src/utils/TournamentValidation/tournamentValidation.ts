export const isPowerOfTwo = (n: number) => {
  return n >= 2 && (n & (n - 1)) === 0;
};

export const validateTournament = (data: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number | '';
}) => {
  const errors: string[] = [];

  if (!data.name) errors.push('Le nom est requis.');
  if (!data.description) errors.push('La description est requise.');
  if (!data.startDate) errors.push('La date de début est requise.');
  if (!data.endDate) errors.push('La date de fin est requise.');
  if (!data.registrationDeadline)
    errors.push("La date limite d'inscription est requise.");
  if (!data.maxParticipants || Number(data.maxParticipants) < 3)
    errors.push('Le nombre de participants doit être au minimum 3.');

  if (data.startDate && new Date(data.startDate) < new Date()) {
    errors.push('La date de début ne peut pas être dans le passé.');
  }

  if (
    data.startDate &&
    data.endDate &&
    new Date(data.endDate) <= new Date(data.startDate)
  ) {
    errors.push('La date de fin doit être après la date de début.');
  }

  if (
    data.registrationDeadline &&
    data.startDate &&
    new Date(data.registrationDeadline) >= new Date(data.startDate)
  ) {
    errors.push(
      "La date limite d'inscription doit être avant la date de début.",
    );
  }

  return errors;
};
