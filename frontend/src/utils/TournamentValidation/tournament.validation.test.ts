import { describe, test, expect } from 'vitest';
import { validateTournament } from './tournamentValidation';

const validData = {
  name: 'Tournoi Test',
  description: 'Une description',
  startDate: '2099-06-10',
  endDate: '2099-06-15',
  registrationDeadline: '2099-06-05',
  maxParticipants: 8 as number | '',
};

describe('validateTournament', () => {
  test('retourne aucune erreur pour des données valides', () => {
    expect(validateTournament(validData)).toHaveLength(0);
  });

  test('retourne erreur si nom vide', () => {
    const errors = validateTournament({ ...validData, name: '' });
    expect(errors).toContain('Le nom est requis.');
  });

  test('retourne erreur si description vide', () => {
    const errors = validateTournament({ ...validData, description: '' });
    expect(errors).toContain('La description est requise.');
  });

  test('retourne erreur si date de début vide', () => {
    const errors = validateTournament({ ...validData, startDate: '' });
    expect(errors).toContain('La date de début est requise.');
  });

  test('retourne erreur si date de fin vide', () => {
    const errors = validateTournament({ ...validData, endDate: '' });
    expect(errors).toContain('La date de fin est requise.');
  });

  test('retourne erreur si date limite vide', () => {
    const errors = validateTournament({
      ...validData,
      registrationDeadline: '',
    });
    expect(errors).toContain("La date limite d'inscription est requise.");
  });

  test('retourne erreur si maxParticipants vide', () => {
    const errors = validateTournament({ ...validData, maxParticipants: '' });
    expect(errors).toContain(
      'Le nombre de participants doit être au minimum 3.',
    );
  });

  test('retourne erreur si date de début dans le passé', () => {
    const errors = validateTournament({
      ...validData,
      startDate: '2020-01-01',
      endDate: '2020-01-05',
      registrationDeadline: '2019-12-30',
    });
    expect(errors).toContain(
      'La date de début ne peut pas être dans le passé.',
    );
  });

  test('retourne erreur si date de fin avant date de début', () => {
    const errors = validateTournament({ ...validData, endDate: '2099-06-09' });
    expect(errors).toContain(
      'La date de fin doit être après la date de début.',
    );
  });

  test('retourne erreur si date limite après date de début', () => {
    const errors = validateTournament({
      ...validData,
      registrationDeadline: '2099-06-11',
    });
    expect(errors).toContain(
      "La date limite d'inscription doit être avant la date de début.",
    );
  });

  test('retourne erreur si maxParticipants inférieur à 3', () => {
    const errors = validateTournament({ ...validData, maxParticipants: 2 });
    expect(errors).toContain(
      'Le nombre de participants doit être au minimum 3.',
    );
  });

  test('accepte maxParticipants non puissance de 2 si >= 3', () => {
    const errors = validateTournament({ ...validData, maxParticipants: 5 });
    expect(errors).toHaveLength(0);
  });

  test('retourne plusieurs erreurs si plusieurs champs invalides', () => {
    const errors = validateTournament({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationDeadline: '',
      maxParticipants: '',
    });
    expect(errors.length).toBeGreaterThan(1);
  });
});
