import { describe, test, expect } from 'vitest';
import {
  formatDate,
  getInfoLabel,
  getInfoValue,
  getStateLabel,
  getTeamsValue,
  isRegistrationOpen,
  statusLabel,
} from './TournamentCard.utils';
import { TournamentDetails } from '../../types/tournament.types';

const mockTournament: TournamentDetails = {
  id: 1,
  status: 'IN_PROGRESS',
  name: 'Vinci Bounty 2026',
  description: 'Tournoi test',
  startDate: '2026-02-16',
  endDate: '2026-02-23',
  registrationDeadline: '2026-02-10',
  maxParticipants: 8,
  currentParticipants: 3,
  organizerTag: 'Admin',
  isPublic: true,
  winnerTeamName: null,
};

describe('statusLabel', () => {
  test('maps each status to its readable label', () => {
    expect(statusLabel['PREPARATION']).toBe('Prochain');
    expect(statusLabel['IN_PROGRESS']).toBe('À la une');
    expect(statusLabel['FINISHED']).toBe('Dernier');
    expect(statusLabel['CANCELLED']).toBe('Annulé');
  });
});

describe('formatDate', () => {
  test('formats date correctly in French (fr-BE)', () => {
    expect(formatDate('2026-02-16')).toBe('16 févr.');
    expect(formatDate('2026-02-23')).toBe('23 févr.');
  });
});

describe('getInfoLabel', () => {
  test('returns VAINQUEUR for FINISHED', () => {
    expect(getInfoLabel({ ...mockTournament, status: 'FINISHED' })).toBe(
      'VAINQUEUR',
    );
  });

  test('returns PHASE for IN_PROGRESS', () => {
    expect(getInfoLabel({ ...mockTournament, status: 'IN_PROGRESS' })).toBe(
      'PHASE',
    );
  });

  test('returns INSCRIPTIONS for PREPARATION', () => {
    expect(getInfoLabel({ ...mockTournament, status: 'PREPARATION' })).toBe(
      'INSCRIPTIONS',
    );
  });

  test('returns empty string for CANCELLED', () => {
    expect(getInfoLabel({ ...mockTournament, status: 'CANCELLED' })).toBe('');
  });
});

describe('getStateLabel', () => {
  test('returns "À venir" for PREPARATION', () => {
    expect(getStateLabel({ ...mockTournament, status: 'PREPARATION' })).toBe(
      'À venir',
    );
  });

  test('returns "En cours" for IN_PROGRESS', () => {
    expect(getStateLabel({ ...mockTournament, status: 'IN_PROGRESS' })).toBe(
      'En cours',
    );
  });

  test('returns "Terminé" for FINISHED', () => {
    expect(getStateLabel({ ...mockTournament, status: 'FINISHED' })).toBe(
      'Terminé',
    );
  });

  test('returns "Terminé" as fallback for CANCELLED', () => {
    expect(getStateLabel({ ...mockTournament, status: 'CANCELLED' })).toBe(
      'Terminé',
    );
  });
});

describe('getInfoValue', () => {
  test('returns winnerTeamName for FINISHED', () => {
    expect(
      getInfoValue({
        ...mockTournament,
        status: 'FINISHED',
        winnerTeamName: 'Team Alpha',
      }),
    ).toBe('Team Alpha');
  });

  test('returns "Non défini" when winnerTeamName is null for FINISHED', () => {
    expect(
      getInfoValue({
        ...mockTournament,
        status: 'FINISHED',
        winnerTeamName: null,
      }),
    ).toBe('Non défini');
  });

  test('returns "Inconnue" for IN_PROGRESS', () => {
    expect(getInfoValue({ ...mockTournament, status: 'IN_PROGRESS' })).toBe(
      'Inconnue',
    );
  });

  test('returns "Ouvertes" when registration is open for PREPARATION', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    expect(
      getInfoValue({
        ...mockTournament,
        status: 'PREPARATION',
        isPublic: true,
        registrationDeadline: tomorrow.toISOString().split('T')[0],
        currentParticipants: 3,
        maxParticipants: 8,
      }),
    ).toBe('Ouvertes');
  });

  test('returns "Fermées" when deadline has passed for PREPARATION', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(
      getInfoValue({
        ...mockTournament,
        status: 'PREPARATION',
        registrationDeadline: yesterday.toISOString().split('T')[0],
      }),
    ).toBe('Fermées');
  });

  test('returns "Inconnue" as fallback for CANCELLED', () => {
    expect(getInfoValue({ ...mockTournament, status: 'CANCELLED' })).toBe(
      'Inconnue',
    );
  });
});

describe('isRegistrationOpen', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deadlineOpen = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const deadlinePassed = yesterday.toISOString().split('T')[0];

  test('returns true when public, deadline not passed and not full', () => {
    expect(
      isRegistrationOpen({
        ...mockTournament,
        isPublic: true,
        registrationDeadline: deadlineOpen,
        currentParticipants: 3,
        maxParticipants: 8,
      }),
    ).toBe(true);
  });

  test('returns false when not public', () => {
    expect(
      isRegistrationOpen({
        ...mockTournament,
        isPublic: false,
        registrationDeadline: deadlineOpen,
      }),
    ).toBe(false);
  });

  test('returns false when deadline has passed', () => {
    expect(
      isRegistrationOpen({
        ...mockTournament,
        isPublic: true,
        registrationDeadline: deadlinePassed,
      }),
    ).toBe(false);
  });

  test('returns false when tournament is full', () => {
    expect(
      isRegistrationOpen({
        ...mockTournament,
        isPublic: true,
        registrationDeadline: deadlineOpen,
        currentParticipants: 8,
        maxParticipants: 8,
      }),
    ).toBe(false);
  });
});

describe('getTeamsValue', () => {
  test('returns "current/max" for PREPARATION', () => {
    expect(
      getTeamsValue({
        ...mockTournament,
        status: 'PREPARATION',
        currentParticipants: 5,
        maxParticipants: 8,
      }),
    ).toBe('5/8');
  });

  test('returns only current participants for IN_PROGRESS', () => {
    expect(
      getTeamsValue({
        ...mockTournament,
        status: 'IN_PROGRESS',
        currentParticipants: 3,
      }),
    ).toBe('3');
  });

  test('returns only current participants for FINISHED', () => {
    expect(
      getTeamsValue({
        ...mockTournament,
        status: 'FINISHED',
        currentParticipants: 8,
      }),
    ).toBe('8');
  });
});
