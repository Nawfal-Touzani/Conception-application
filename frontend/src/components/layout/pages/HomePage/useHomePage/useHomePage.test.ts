import { describe, test, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useHomePage } from './useHomePage';
import * as tournamentService from '../../../../../services/tournament/tournament.service';

vi.mock('../../../../../services/tournament/tournament.service', () => ({
  getHomepageTournaments: vi.fn(),
}));

describe('useHomePage', () => {
  afterEach(() => vi.resetAllMocks());

  const mockResponse = {
    lastFinished: {
      id: 1,
      name: 'Winter Cup 2026',
      description: 'Tournoi terminé',
      startDate: '2026-01-05',
      endDate: '2026-01-19',
      registrationDeadline: '2025-12-30',
      maxParticipants: 16,
      currentParticipants: 16,
      status: 'FINISHED' as const,
      organizerTag: 'Admin',
      isPublic: true,
      winnerTeamName: 'Team Alpha',
    },
    inProgress: {
      id: 2,
      name: 'Vinci Bounty 2026',
      description: 'Tournoi en cours',
      startDate: '2026-02-16',
      endDate: '2026-02-23',
      registrationDeadline: '2026-02-10',
      maxParticipants: 8,
      currentParticipants: 8,
      status: 'IN_PROGRESS' as const,
      organizerTag: 'Admin',
      isPublic: true,
      winnerTeamName: null,
    },
    nextUpcoming: {
      id: 3,
      name: 'Vinci Major 2026',
      description: 'Prochain tournoi',
      startDate: '2026-02-25',
      endDate: '2026-03-01',
      registrationDeadline: '2026-02-20',
      maxParticipants: 16,
      currentParticipants: 4,
      status: 'PREPARATION' as const,
      organizerTag: 'Admin',
      isPublic: true,
      winnerTeamName: null,
    },
  };

  test('loads tournaments successfully from the backend', async () => {
    vi.mocked(tournamentService.getHomepageTournaments).mockResolvedValue(
      mockResponse,
    );

    const { result } = renderHook(() => useHomePage());

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments).toEqual([]);

    await waitFor(() => {
      expect(result.current.tournaments).toHaveLength(3);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments[0].name).toBe('Winter Cup 2026');
  });

  test('sets an error when backend loading fails', async () => {
    vi.mocked(tournamentService.getHomepageTournaments).mockRejectedValue(
      new Error('Backend error'),
    );

    const { result } = renderHook(() => useHomePage());

    await waitFor(() => {
      expect(result.current.error).toBe(
        'Erreur lors du chargement des tournois.',
      );
    });

    expect(result.current.tournaments).toEqual([]);
  });

  test('filters out null tournaments from the backend response', async () => {
    vi.mocked(tournamentService.getHomepageTournaments).mockResolvedValue({
      lastFinished: null,
      inProgress: mockResponse.inProgress,
      nextUpcoming: null,
    });

    const { result } = renderHook(() => useHomePage());

    await waitFor(() => {
      expect(result.current.tournaments).toHaveLength(1);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments[0].name).toBe('Vinci Bounty 2026');
  });

  test('filters out CANCELLED tournaments from the backend response', async () => {
    vi.mocked(tournamentService.getHomepageTournaments).mockResolvedValue({
      lastFinished: mockResponse.lastFinished,
      inProgress: {
        ...mockResponse.inProgress,
        status: 'CANCELLED' as const,
      },
      nextUpcoming: mockResponse.nextUpcoming,
    });

    const { result } = renderHook(() => useHomePage());

    await waitFor(() => {
      expect(result.current.tournaments).toHaveLength(2);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments[0].name).toBe('Winter Cup 2026');
    expect(result.current.tournaments[1].name).toBe('Vinci Major 2026');
  });
});
