import { useState } from 'react';
import { validateTournament } from '../../utils/TournamentValidation/tournamentValidation';

// hook pour gérer le formulaire de création de tournoi
export const useTournamentForm = () => {
  // champs du formulaire
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  // reset tous les champs
  const reset = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setRegistrationDeadline('');
    setMaxParticipants('');
    setErrors([]);
    setSuccess(null);
  };

  // validation du formulaire
  const validate = () => {
    // appelle la fonction de validation
    const newErrors = validateTournament({
      name,
      description,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
    });

    // met à jour les erreurs
    setErrors(newErrors);

    // retourne true si aucune erreur
    return newErrors.length === 0;
  };

  // expose les données et fonctions
  return {
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    registrationDeadline,
    setRegistrationDeadline,
    maxParticipants,
    setMaxParticipants,
    errors,
    setErrors,
    success,
    setSuccess,
    reset,
    validate,
  };
};
