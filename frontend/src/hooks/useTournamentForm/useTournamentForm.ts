import { useState } from 'react';
import { validateTournament } from '../../utils/tournamentValidation';

export const useTournamentForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

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

  const validate = () => {
    const newErrors = validateTournament({
      name,
      description,
      startDate,
      endDate,
      registrationDeadline,
      maxParticipants,
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

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
