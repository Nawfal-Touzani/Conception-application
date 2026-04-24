import { describe, test, expect } from 'vitest';
import {
  formatDate,
  getInfoLabel,
  getInfoValue,
  getStateLabel,
  getTeamsValue,
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
    expect(statusLabel['UPCOMING']).toBe('Complet');
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
  test('returns INSCRIPTIONS for UPCOMING', () => {
    expect(getInfoLabel({ ...mockTournament, status: 'UPCOMING' })).toBe(
      'INSCRIPTIONS',
    );
  });

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
  test('returns "À venir" for UPCOMING', () => {
    expect(getStateLabel({ ...mockTournament, status: 'UPCOMING' })).toBe(
      'À venir',
    );
  });

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

  test('returns "En cours" for IN_PROGRESS when currentRoundLabel is undefined', () => {
    expect(getInfoValue({ ...mockTournament, status: 'IN_PROGRESS' })).toBe(
      'En cours',
    );
  });

  test('returns currentRoundLabel for IN_PROGRESS when defined', () => {
    expect(
      getInfoValue({
        ...mockTournament,
        status: 'IN_PROGRESS',
        currentRoundLabel: 'Quarts',
      }),
    ).toBe('Quarts');
  });

  test('returns "Inconnue" as fallback for CANCELLED', () => {
    expect(getInfoValue({ ...mockTournament, status: 'CANCELLED' })).toBe(
      'Inconnue',
    );
  });

  test('returns "Ouvertes" for PREPARATION', () => {
    expect(getInfoValue({ ...mockTournament, status: 'PREPARATION' })).toBe(
      'Ouvertes',
    );
  });

  test('returns "Fermées" for UPCOMING', () => {
    expect(getInfoValue({ ...mockTournament, status: 'UPCOMING' })).toBe(
      'Fermées',
    );
  });
});

describe('getTeamsValue', () => {
  test('returns "current/max" for UPCOMING', () => {
    expect(
      getTeamsValue({
        ...mockTournament,
        status: 'UPCOMING',
        currentParticipants: 8,
        maxParticipants: 8,
      }),
    ).toBe('8/8');
  });

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
