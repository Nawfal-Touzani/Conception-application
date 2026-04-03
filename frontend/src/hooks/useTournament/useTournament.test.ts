import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useTournaments } from './useTournaments';
import * as tournamentService from '../../services/tournament/tournament.service';

vi.mock('../../services/tournament/tournament.service', () => ({
  getTournaments: vi.fn(),
  getTournamentById: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams()],
}));

vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'lea@mail.com',
      tag: 'Lynx',
      role: 'ADMIN',
      token: 'fake-token',
    },
  }),
}));

const mockTournaments = [
  {
    id: 1,
    name: 'Vinci Easter Cup 2026',
    description: '',
    startDate: '2026-04-15',
    endDate: '2026-04-25',
    registrationDeadline: '2099-04-08',
    maxParticipants: 8,
    currentParticipants: 3,
    organizerTag: 'Admin',
    registeredTeamNames: [],
    status: 'PREPARATION' as const,
    isPublic: true,
  },
  {
    id: 2,
    name: 'Spring Battle Series 2026',
    description: '',
    startDate: '2026-04-04',
    endDate: '2026-04-11',
    registrationDeadline: '2026-04-01',
    maxParticipants: 8,
    currentParticipants: 8,
    organizerTag: 'Admin',
    registeredTeamNames: [],
    status: 'IN_PROGRESS' as const,
    isPublic: true,
  },
  {
    id: 3,
    name: 'Spring Arena Cup 2025',
    description: '',
    startDate: '2025-04-15',
    endDate: '2025-04-25',
    registrationDeadline: '2025-04-10',
    maxParticipants: 8,
    currentParticipants: 8,
    organizerTag: 'Admin',
    registeredTeamNames: [],
    status: 'FINISHED' as const,
    isPublic: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  (
    tournamentService.getTournaments as ReturnType<typeof vi.fn>
  ).mockResolvedValue(mockTournaments);
});

describe('useTournaments - filtres', () => {
  test('rows retourne tous les tournois sans filtre', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
  });

  test('filtre par nom fonctionne', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setNameSearch('Easter');
    });
    expect(result.current.rows.flat()).toHaveLength(1);
    expect(result.current.rows.flat()[0].name).toBe('Vinci Easter Cup 2026');
  });

  test('filtre par statut IN_PROGRESS fonctionne', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setStatusFilter('IN_PROGRESS');
    });
    expect(result.current.rows.flat()).toHaveLength(1);
    expect(result.current.rows.flat()[0].name).toBe(
      'Spring Battle Series 2026',
    );
  });

  test('filtre par statut FINISHED fonctionne', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setStatusFilter('FINISHED');
    });
    expect(result.current.rows.flat()).toHaveLength(1);
    expect(result.current.rows.flat()[0].name).toBe('Spring Arena Cup 2025');
  });

  test('filtre OPEN exclut les tournois pleins et deadline passée', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setStatusFilter('OPEN');
    });
    expect(result.current.rows.flat()).toHaveLength(1);
    expect(result.current.rows.flat()[0].name).toBe('Vinci Easter Cup 2026');
  });

  test('filtre par date startDate fonctionne', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setStartDate('2026-01-01');
    });
    expect(result.current.rows.flat()).toHaveLength(2);
  });

  test('filtre visibilité private exclut les tournois publics', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setVisibilityFilter('private');
    });
    expect(result.current.rows.flat()).toHaveLength(0);
  });

  test('rows découpe les tournois par groupes de 3', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    expect(result.current.rows).toHaveLength(1);
    expect(result.current.rows[0]).toHaveLength(3);
  });
});

describe('useTournaments - reset', () => {
  test('reset remet tous les filtres à zéro', async () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));
    act(() => {
      result.current.filters.setNameSearch('Easter');
      result.current.filters.setStatusFilter('IN_PROGRESS');
    });
    expect(result.current.rows.flat()).toHaveLength(0);
    act(() => {
      result.current.reset();
    });
    expect(result.current.rows.flat()).toHaveLength(3);
  });
});

describe('useTournaments - isAdmin', () => {
  test('isAdmin est true pour un user ADMIN', () => {
    const { result } = renderHook(() => useTournaments('fake-token'));
    expect(result.current.isAdmin).toBe(true);
  });
});

describe('useTournaments - handleRegister', () => {
  test('handleRegister met à jour le tournoi dans la liste', async () => {
    const updatedTournament = { ...mockTournaments[0], currentParticipants: 4 };
    (
      tournamentService.getTournamentById as ReturnType<typeof vi.fn>
    ).mockResolvedValue(updatedTournament);

    const { result } = renderHook(() => useTournaments('fake-token'));
    await vi.waitFor(() => expect(result.current.rows.flat()).toHaveLength(3));

    await act(async () => {
      await result.current.handleRegister(1);
    });

    expect(result.current.selectedTournament?.currentParticipants).toBe(4);
    expect(
      result.current.rows.flat().find((t) => t.id === 1)?.currentParticipants,
    ).toBe(4);
  });
});
