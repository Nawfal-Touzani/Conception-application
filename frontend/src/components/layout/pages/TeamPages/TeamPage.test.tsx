import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useTeam } from '../../../../hooks/useTeam/useTeam';
import { useAuth } from '../../../../contexts/useAuth';
import type { TournamentDetails } from '../../../../types/tournament.types';
import * as teamService from '../../../../services/team/team.service';
import * as tournamentService from '../../../../services/tournament/tournament.service';

vi.mock('../../../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../../services/team/team.service', () => ({
  getMyTeamMembers: vi.fn(),
  getMyTeam: vi.fn(),
  leaveTeam: vi.fn(),
  nominateSecondaryManager: vi.fn(),
}));

vi.mock('../../../../services/tournament/tournament.service', () => ({
  getTournaments: vi.fn(),
}));

const mockUser = {
  id: 1,
  email: 'lynx@vinci.be',
  tag: 'Lynx',
  role: 'MEMBER',
  token: 'fake-token',
};

const mockMembers = [
  {
    memberId: 1,
    gameTag: 'Lynx',
    avatarUrl: '/images/avatar1.png',
    isAvailable: true,
  },
  {
    memberId: 2,
    gameTag: 'Rogue',
    avatarUrl: '/images/avatar2.png',
    isAvailable: false,
  },
];

const mockTeam = {
  id: 10,
  name: 'TEAM_ALPHA',
  responsibleTag: 'Lynx',
  secondResponsibleTag: null,
  creationDate: '2026-03-12T00:00:00',
};

const mockTournaments: TournamentDetails[] = [
  {
    id: 100,
    name: 'Spring Cup',
    description: 'Tournoi de printemps',
    startDate: '2026-04-01',
    endDate: '2026-04-10',
    registrationDeadline: '2026-03-25',
    maxParticipants: 16,
    currentParticipants: 8,
    organizerTag: 'Admin',
    status: 'IN_PROGRESS',
    isPublic: true,
  },
  {
    id: 101,
    name: 'Summer Cup',
    description: 'Tournoi d’été',
    startDate: '2026-05-01',
    endDate: '2026-05-10',
    registrationDeadline: '2026-04-20',
    maxParticipants: 32,
    currentParticipants: 12,
    organizerTag: 'Admin',
    status: 'PREPARATION',
    isPublic: true,
  },
  {
    id: 102,
    name: 'Private Cup',
    description: 'Tournoi privé',
    startDate: '2026-06-01',
    endDate: '2026-06-10',
    registrationDeadline: '2026-05-20',
    maxParticipants: 8,
    currentParticipants: 4,
    organizerTag: 'Admin',
    status: 'PREPARATION',
    isPublic: false,
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    bannedError: null,
  });

  vi.mocked(teamService.getMyTeamMembers).mockResolvedValue(mockMembers);
  vi.mocked(teamService.getMyTeam).mockResolvedValue(mockTeam);
  vi.mocked(tournamentService.getTournaments).mockResolvedValue(
    mockTournaments,
  );
});

describe('useTeam', () => {
  test('charge les données de l’équipe au montage', async () => {
    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    expect(teamService.getMyTeamMembers).toHaveBeenCalledWith('fake-token');
    expect(teamService.getMyTeam).toHaveBeenCalledWith('fake-token');
    expect(tournamentService.getTournaments).toHaveBeenCalledWith(
      'fake-token',
      'TEAM_ALPHA',
    );

    expect(result.current.team).toEqual(mockTeam);
    expect(result.current.members).toEqual(mockMembers);
  });

  test('met hasTeam à false si getMyTeamMembers échoue', async () => {
    vi.mocked(teamService.getMyTeamMembers).mockRejectedValueOnce(
      new Error('boom'),
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(false);
    });

    expect(result.current.team).toBeNull();
    expect(result.current.members).toEqual([]);
  });

  test('calcule isSolo à true si un seul membre', async () => {
    vi.mocked(teamService.getMyTeamMembers).mockResolvedValueOnce([
      mockMembers[0],
    ]);

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    expect(result.current.isSolo).toBe(true);
  });

  test('calcule isResponsible à true si user est responsable principal', async () => {
    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    expect(result.current.isResponsible).toBe(true);
  });

  test('calcule isResponsible à true si user est second responsable', async () => {
    vi.mocked(teamService.getMyTeam).mockResolvedValueOnce({
      ...mockTeam,
      responsibleTag: 'Other',
      secondResponsibleTag: 'Lynx',
    });

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    expect(result.current.isResponsible).toBe(true);
  });

  test('calcule isResponsible à false si user n’est pas responsable', async () => {
    vi.mocked(teamService.getMyTeam).mockResolvedValueOnce({
      ...mockTeam,
      responsibleTag: 'Other',
      secondResponsibleTag: 'Another',
    });

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    expect(result.current.isResponsible).toBe(false);
  });

  test('filtre correctement les tournois en cours et à venir', async () => {
    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    expect(result.current.tournamentsInProgress).toHaveLength(1);
    expect(result.current.tournamentsInProgress[0].name).toBe('Spring Cup');

    expect(result.current.tournamentsUpcoming).toHaveLength(1);
    expect(result.current.tournamentsUpcoming[0].name).toBe('Summer Cup');
  });

  test('handleLeave appelle leaveTeam puis recharge les données', async () => {
    vi.mocked(teamService.leaveTeam).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    await act(async () => {
      await result.current.handleLeave();
    });

    expect(teamService.leaveTeam).toHaveBeenCalledWith('fake-token');
    expect(teamService.getMyTeamMembers).toHaveBeenCalledTimes(2);
    expect(teamService.getMyTeam).toHaveBeenCalledTimes(2);
  });

  test('handleLeave ferme la popup après succès', async () => {
    vi.mocked(teamService.leaveTeam).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    act(() => {
      result.current.setConfirmOpen(true);
    });

    expect(result.current.confirmOpen).toBe(true);

    await act(async () => {
      await result.current.handleLeave();
    });

    expect(result.current.confirmOpen).toBe(false);
  });

  test('handleLeave stocke le message d’erreur si leaveTeam échoue avec Error', async () => {
    vi.mocked(teamService.leaveTeam).mockRejectedValueOnce(
      new Error('Désignez un second responsable avant de quitter.'),
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    await act(async () => {
      await result.current.handleLeave();
    });

    expect(result.current.leaveError).toBe(
      'Désignez un second responsable avant de quitter.',
    );
    expect(result.current.confirmOpen).toBe(false);
    expect(result.current.leaveLoading).toBe(false);
  });

  test('handleLeave stocke une erreur générique si rejet non Error', async () => {
    vi.mocked(teamService.leaveTeam).mockRejectedValueOnce('fail');

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    await act(async () => {
      await result.current.handleLeave();
    });

    expect(result.current.leaveError).toBe('Une erreur est survenue.');
  });

  test('handleNominate nomme un second responsable avec succès', async () => {
    vi.mocked(teamService.nominateSecondaryManager).mockResolvedValueOnce(
      undefined,
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleNominate(2);
    });

    expect(teamService.nominateSecondaryManager).toHaveBeenCalledWith(
      'fake-token',
      10,
      2,
    );
    expect(result.current.nominateSuccess).toBe(
      'Second responsable nommé avec succès.',
    );
    expect(result.current.nominateError).toBeNull();
    expect(teamService.getMyTeamMembers).toHaveBeenCalledTimes(2);
  });

  test('handleNominate stocke une erreur si la nomination échoue avec Error', async () => {
    vi.mocked(teamService.nominateSecondaryManager).mockRejectedValueOnce(
      new Error('Impossible de nommer ce membre.'),
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleNominate(2);
    });

    expect(result.current.nominateError).toBe(
      'Impossible de nommer ce membre.',
    );
    expect(result.current.nominateSuccess).toBeNull();
  });

  test('handleNominate stocke "Erreur réseau." si rejet non Error', async () => {
    vi.mocked(teamService.nominateSecondaryManager).mockRejectedValueOnce(
      'fail',
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleNominate(2);
    });

    expect(result.current.nominateError).toBe('Erreur réseau.');
  });

  test('handleNominate ne fait rien si team est null', async () => {
    vi.mocked(teamService.getMyTeamMembers).mockResolvedValueOnce(mockMembers);
    vi.mocked(teamService.getMyTeam).mockImplementationOnce(
      () => new Promise(() => {}),
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.members).toEqual(mockMembers);
    });

    await act(async () => {
      await result.current.handleNominate(2);
    });

    expect(teamService.nominateSecondaryManager).not.toHaveBeenCalled();
  });

  test('ne charge rien si user est null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      bannedError: null,
    });

    renderHook(() => useTeam());

    expect(teamService.getMyTeamMembers).not.toHaveBeenCalled();
    expect(teamService.getMyTeam).not.toHaveBeenCalled();
    expect(tournamentService.getTournaments).not.toHaveBeenCalled();
  });

  test('permet de changer tabIndex', async () => {
    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    act(() => {
      result.current.setTabIndex(1);
    });

    expect(result.current.tabIndex).toBe(1);
  });

  test('permet de reset leaveError', async () => {
    vi.mocked(teamService.leaveTeam).mockRejectedValueOnce(
      new Error('Erreur leave'),
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.hasTeam).toBe(true);
    });

    await act(async () => {
      await result.current.handleLeave();
    });

    expect(result.current.leaveError).toBe('Erreur leave');

    act(() => {
      result.current.setLeaveError(null);
    });

    expect(result.current.leaveError).toBeNull();
  });

  test('permet de reset nominateError et nominateSuccess', async () => {
    vi.mocked(teamService.nominateSecondaryManager).mockResolvedValueOnce(
      undefined,
    );

    const { result } = renderHook(() => useTeam());

    await waitFor(() => {
      expect(result.current.team).not.toBeNull();
    });

    await act(async () => {
      await result.current.handleNominate(2);
    });

    expect(result.current.nominateSuccess).toBe(
      'Second responsable nommé avec succès.',
    );

    act(() => {
      result.current.setNominateSuccess(null);
      result.current.setNominateError(null);
    });

    expect(result.current.nominateSuccess).toBeNull();
    expect(result.current.nominateError).toBeNull();
  });
});
