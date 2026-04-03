import { describe, test, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  formatDateFull,
  formatStatus,
  getStateLabel,
} from './tournament.utils';
import { TournamentDetails } from '../../types/tournament.types';

const base: TournamentDetails = {
  id: 1,
  name: 'Test',
  description: '',
  startDate: '2026-04-15',
  endDate: '2026-04-25',
  registrationDeadline: '2099-01-01',
  maxParticipants: 8,
  currentParticipants: 3,
  organizerTag: 'Admin',
  registeredTeamNames: [],
  status: 'PREPARATION',
  isPublic: true,
};

describe('formatDate', () => {
  test('formate une date en jj/mm/aaaa', () => {
    expect(formatDate('2026-04-15')).toBe('15/04/2026');
  });

  test('formate une date en janvier', () => {
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });
});

describe('formatDateShort', () => {
  test('formate une date en format court', () => {
    const result = formatDateShort('2026-04-15');
    expect(result).toContain('15');
    expect(result).toContain('avr');
  });
});

describe('formatDateFull', () => {
  test('formate une date en jj/mm/aaaa', () => {
    expect(formatDateFull('2026-04-15')).toBe('15/04/2026');
  });
});

describe('formatStatus', () => {
  test('retourne "Inscriptions ouvertes" pour PREPARATION public', () => {
    expect(
      formatStatus({ ...base, status: 'PREPARATION', isPublic: true }),
    ).toBe('Inscriptions ouvertes');
  });

  test('retourne "En préparation" pour PREPARATION non public', () => {
    expect(
      formatStatus({ ...base, status: 'PREPARATION', isPublic: false }),
    ).toBe('En préparation');
  });

  test('retourne "En cours" pour IN_PROGRESS', () => {
    expect(formatStatus({ ...base, status: 'IN_PROGRESS' })).toBe('En cours');
  });

  test('retourne "Terminé" pour FINISHED', () => {
    expect(formatStatus({ ...base, status: 'FINISHED' })).toBe('Terminé');
  });

  test('retourne "Annulé" pour CANCELLED', () => {
    expect(formatStatus({ ...base, status: 'CANCELLED' })).toBe('Annulé');
  });
});

describe('getStateLabel', () => {
  test('retourne "Inscriptions ouvertes" pour PREPARATION public non plein deadline future', () => {
    expect(
      getStateLabel({
        ...base,
        status: 'PREPARATION',
        isPublic: true,
        currentParticipants: 3,
        maxParticipants: 8,
        registrationDeadline: '2099-01-01',
      }),
    ).toBe('Inscriptions ouvertes');
  });

  test('retourne "En préparation" pour PREPARATION non public', () => {
    expect(
      getStateLabel({ ...base, status: 'PREPARATION', isPublic: false }),
    ).toBe('En préparation');
  });

  test('retourne "En préparation" pour PREPARATION public mais plein', () => {
    expect(
      getStateLabel({
        ...base,
        status: 'PREPARATION',
        isPublic: true,
        currentParticipants: 8,
        maxParticipants: 8,
      }),
    ).toBe('En préparation');
  });

  test('retourne "En préparation" pour PREPARATION public mais deadline passée', () => {
    expect(
      getStateLabel({
        ...base,
        status: 'PREPARATION',
        isPublic: true,
        registrationDeadline: '2020-01-01',
      }),
    ).toBe('En préparation');
  });

  test('retourne "En cours" pour IN_PROGRESS', () => {
    expect(getStateLabel({ ...base, status: 'IN_PROGRESS' })).toBe('En cours');
  });

  test('retourne "Terminé" pour FINISHED', () => {
    expect(getStateLabel({ ...base, status: 'FINISHED' })).toBe('Terminé');
  });

  test('retourne "Annulé" pour CANCELLED', () => {
    expect(getStateLabel({ ...base, status: 'CANCELLED' })).toBe('Annulé');
  });
});
