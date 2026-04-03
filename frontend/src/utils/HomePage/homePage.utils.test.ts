import { describe, test, expect } from 'vitest';
import { filterDisplayedTournaments } from './homePage.utils';
import { TournamentDetails } from '../../types/tournament.types';

describe('homePageLogic', () => {
  const finishedTournament: TournamentDetails = {
    id: 1,
    name: 'Winter Cup 2026',
    description: 'Tournoi de fou',
    startDate: '2026-01-05',
    endDate: '2026-01-19',
    registrationDeadline: '2025-12-30',
    maxParticipants: 16,
    currentParticipants: 16,
    status: 'FINISHED',
    organizerTag: 'Admin',
    isPublic: true,
    winnerTeamName: 'TEAM_ALPHA',
  };

  const inProgressTournament: TournamentDetails = {
    id: 2,
    name: 'Vinci Bounty 2026',
    description: 'Tournoi de malade',
    startDate: '2026-02-16',
    endDate: '2026-02-23',
    registrationDeadline: '2026-02-10',
    maxParticipants: 8,
    currentParticipants: 8,
    status: 'IN_PROGRESS',
    organizerTag: 'Admin',
    isPublic: true,
    winnerTeamName: null,
  };

  const nextTournament: TournamentDetails = {
    id: 3,
    name: 'Vinci Major 2026',
    description: 'Tournoi de ouf',
    startDate: '2026-02-25',
    endDate: '2026-03-01',
    registrationDeadline: '2026-02-20',
    maxParticipants: 16,
    currentParticipants: 4,
    status: 'PREPARATION',
    organizerTag: 'Admin',
    isPublic: true,
    winnerTeamName: null,
  };

  test('returns the 3 tournaments when all 3 exist', () => {
    const result = filterDisplayedTournaments(
      finishedTournament,
      inProgressTournament,
      nextTournament,
    );

    expect(result).toEqual([
      finishedTournament,
      inProgressTournament,
      nextTournament,
    ]);
  });

  test('returns an empty array when all tournaments are null', () => {
    const result = filterDisplayedTournaments(null, null, null);

    expect(result).toEqual([]);
  });

  test('removes null tournaments and keeps the correct order', () => {
    const result = filterDisplayedTournaments(
      finishedTournament,
      null,
      nextTournament,
    );

    expect(result).toEqual([finishedTournament, nextTournament]);
  });

  test('returns only the in progress tournament when the other two are null', () => {
    const result = filterDisplayedTournaments(null, inProgressTournament, null);

    expect(result).toEqual([inProgressTournament]);
  });
});
