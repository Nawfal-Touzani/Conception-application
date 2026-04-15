import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useTournamentDetail } from './useTournamentDetail';
import * as teamService from '../../services/team/team.service';

vi.mock('../../services/team.service', () => ({
  getMyTeam: vi.fn(),
}));

vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      email: 'lea@mail.com',
      tag: 'Lynx',
      role: 'PLAYER',
      token: 'fake-token',
    },
  }),
}));

global.fetch = vi.fn();

const mockTeam = {
  id: 10,
  name: 'Team Lynx',
  responsibleTag: 'Lynx',
  secondResponsibleTag: 'Wolf',
  members: [],
};

const mockTournament = {
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
};

const mockOnRegister = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockTeam,
  );
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
    ok: true,
    text: async () => '',
  });
});

describe('useTournamentDetail - états dérivés', () => {
  test('isResponsible est true si user est responsable de la team', async () => {
    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(true));
  });

  test('isResponsible est false si user nest pas responsable', async () => {
    (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockTeam,
      responsibleTag: 'Other',
      secondResponsibleTag: 'Other2',
    });
    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(false));
  });

  test('isAlreadyRegistered est true si la team est inscrite', async () => {
    const tournament = {
      ...mockTournament,
      registeredTeamNames: ['Team Lynx'],
    };
    const { result } = renderHook(() =>
      useTournamentDetail(tournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isAlreadyRegistered).toBe(true));
  });

  test('isAlreadyRegistered est false si la team nest pas inscrite', async () => {
    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isAlreadyRegistered).toBe(false));
  });

  test('registrationOpen est true si statut PREPARATION et tournoi public', () => {
    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    expect(result.current.registrationOpen).toBe(true);
  });

  test('registrationOpen est false si tournoi non public', () => {
    const tournament = { ...mockTournament, isPublic: false };
    const { result } = renderHook(() =>
      useTournamentDetail(tournament, mockOnRegister),
    );
    expect(result.current.registrationOpen).toBe(false);
  });

  test('registrationOpen est false si statut nest pas PREPARATION', () => {
    const tournament = { ...mockTournament, status: 'IN_PROGRESS' as const };
    const { result } = renderHook(() =>
      useTournamentDetail(tournament, mockOnRegister),
    );
    expect(result.current.registrationOpen).toBe(false);
  });
});

describe('useTournamentDetail - handleRegister succès', () => {
  test('registerSuccess passe à true après inscription réussie', async () => {
    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(true));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.registerSuccess).toBe(true);
    expect(result.current.registerError).toBeNull();
    expect(mockOnRegister).toHaveBeenCalled();
  });
});

describe('useTournamentDetail - handleRegister erreurs', () => {
  const errorCases: { msg: string; expected: string }[] = [
    {
      msg: '4 member required',
      expected: 'Votre équipe doit avoir au moins 4 membres.',
    },
    {
      msg: 'deadline passed',
      expected: "La date limite d'inscription est dépassée.",
    },
    { msg: 'tournament is full', expected: 'Le tournoi est complet.' },
    {
      msg: 'not public yet',
      expected: "Le tournoi n'est pas encore ouvert aux inscriptions.",
    },
    {
      msg: 'not in preparation',
      expected: "Le tournoi n'est plus en phase d'inscription.",
    },
    {
      msg: 'not responsible',
      expected:
        'Seul le responsable ou second responsable peut inscrire la team.',
    },
    { msg: 'unknown error', expected: 'unknown error' },
  ];

  for (const { msg, expected } of errorCases) {
    test(`affiche le bon message pour "${msg}"`, async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: false,
        text: async () => JSON.stringify({ message: msg }),
      });

      const { result } = renderHook(() =>
        useTournamentDetail(mockTournament, mockOnRegister),
      );
      await waitFor(() => expect(result.current.isResponsible).toBe(true));

      await act(async () => {
        await result.current.handleRegister();
      });

      expect(result.current.registerError).toBe(expected);
    });
  }

  test('appelle onRegister si message contient "already"', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      text: async () => JSON.stringify({ message: 'already registered' }),
    });

    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(true));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(mockOnRegister).toHaveBeenCalled();
    expect(result.current.registerError).toBeNull();
  });

  test('affiche erreur générique si fetch throw', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(true));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.registerError).toBe("Erreur lors de l'inscription.");
  });

  test('ne fait rien si myTeam est null', async () => {
    (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error(),
    );

    const { result } = renderHook(() =>
      useTournamentDetail(mockTournament, mockOnRegister),
    );
    await waitFor(() => expect(result.current.isResponsible).toBe(false));

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
