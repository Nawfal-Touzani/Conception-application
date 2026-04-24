import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useJoinOrCreateTeam } from '../../../../hooks/useJoinOrCreateTeam/useJoinOrCreateTeam';
import * as teamService from '../../../../services/team/team.service';
import { useAuth } from '../../../../contexts/useAuth';
import { TeamDto } from '../../../../types/team.types';

vi.mock('../../../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../../services/team/team.service', () => {
  const mockGetTeams = vi.fn();
  const mockCreateTeam = vi.fn();
  const mockSendJoinRequest = vi.fn();
  return {
    getTeams: mockGetTeams,
    createTeam: mockCreateTeam,
    sendJoinRequest: mockSendJoinRequest,
  };
});

const mockUser = {
  id: 1,
  email: 'lynx@vinci.be',
  tag: 'Lynx',
  role: 'MEMBER',
  token: 'fake-token',
};

const mockTeams: TeamDto[] = [
  {
    id: 1,
    name: 'Team Alpha',
    responsibleTag: 'Lynx',
    secondResponsibleTag: null,
    creationDate: null,
  },
  {
    id: 2,
    name: 'Team Beta',
    responsibleTag: 'Rogue',
    secondResponsibleTag: null,
    creationDate: null,
  },
];

const onTeamCreated = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(useAuth).mockReturnValue({
    user: mockUser,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    bannedError: null,
  });

  vi.mocked(teamService.getTeams).mockResolvedValue(mockTeams);
  vi.mocked(teamService.createTeam).mockResolvedValue();
  vi.mocked(teamService.sendJoinRequest).mockResolvedValue();
});

describe('useJoinOrCreateTeam - chargement et filtre des équipes', () => {
  test('charge les équipes au montage', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    await waitFor(() => {
      expect(
        vi.mocked(teamService.getTeams).mock.results[0]?.value,
      ).resolves.toBe(mockTeams);
    });

    expect(result.current.teams).toEqual(mockTeams);
    expect(result.current.filteredTeams).toEqual(mockTeams);
  });

  test('filtre les équipes par search', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    await act(async () => {
      result.current.setSearch('beta');
    });

    expect(
      result.current.filteredTeams.every((t) =>
        t.name.toLowerCase().includes('beta'),
      ),
    ).toBe(true);

    expect(
      result.current.filteredTeams.some((t) => t.name === 'Team Beta'),
    ).toBe(true);

    expect(
      result.current.filteredTeams.some((t) => t.name === 'Team Alpha'),
    ).toBe(false);
  });

  test('filtre se réinitialise si search est vide', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    await act(async () => {
      result.current.setSearch('beta');
    });

    expect(
      result.current.filteredTeams.every((t) =>
        t.name.toLowerCase().includes('beta'),
      ),
    ).toBe(true);

    await act(async () => {
      result.current.setSearch('');
    });

    await waitFor(() => {
      expect(result.current.filteredTeams).toEqual(mockTeams);
    });
  });

  test('charge un tableau vide si getTeams échoue', async () => {
    vi.mocked(teamService.getTeams).mockRejectedValue(
      new Error('Erreur serveur'),
    );

    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    await waitFor(() => {
      expect(result.current.teams).toEqual([]);
      expect(result.current.filteredTeams).toEqual([]);
    });
  });
});

describe('useJoinOrCreateTeam - createTeam', () => {
  test('ne crée pas si teamName est vide', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    expect(result.current.teamName).toBe('');

    await act(async () => {
      await result.current.createTeam();
    });

    expect(teamService.createTeam).not.toHaveBeenCalled();
    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('create');
    expect(result.current.snack.msg).toBe("Veuillez entrer un nom d'équipe.");
  });

  test('crée une équipe avec succès', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('NewTeam');
    });

    expect(result.current.teamName).toBe('NewTeam');

    await act(async () => {
      await result.current.createTeam();
    });

    expect(teamService.createTeam).toHaveBeenCalledWith(
      'fake-token',
      'NewTeam',
    );
    expect(onTeamCreated).toHaveBeenCalledTimes(1);
    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('success');
    expect(result.current.snack.section).toBe('create');
    expect(result.current.snack.msg).toBe('Équipe créée avec succès !');
    expect(result.current.teamName).toBe('');
  });

  test('crée une équipe avec succès après modification du nom', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('Old');
    });

    expect(result.current.teamName).toBe('Old');

    await act(async () => {
      result.current.setTeamName('New');
    });

    expect(result.current.teamName).toBe('New');

    await act(async () => {
      await result.current.createTeam();
    });

    expect(teamService.createTeam).toHaveBeenCalledWith('fake-token', 'New');
    expect(onTeamCreated).toHaveBeenCalledTimes(1);
  });

  test('traite une erreur 409 (nom existe déjà)', async () => {
    const errorMessage = "Ce nom d'équipe existe déjà.";
    vi.mocked(teamService.createTeam).mockRejectedValueOnce(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('ExistingTeam');
    });

    await act(async () => {
      await result.current.createTeam();
    });

    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('create');
    expect(result.current.snack.msg).toBe(errorMessage);
  });

  test('traite une erreur 400 (nom invalide)', async () => {
    const errorMessage = "Nom d'équipe invalide.";
    vi.mocked(teamService.createTeam).mockRejectedValueOnce(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('!');
    });

    await act(async () => {
      await result.current.createTeam();
    });

    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('create');
    expect(result.current.snack.msg).toBe(errorMessage);
  });

  test('traite une autre erreur de création (500, etc.)', async () => {
    const backendError = 'Erreur serveur';
    vi.mocked(teamService.createTeam).mockRejectedValueOnce(
      new Error(backendError),
    );

    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('SomeTeam');
    });

    await act(async () => {
      await result.current.createTeam();
    });

    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('create');
    expect(result.current.snack.msg).toBe(backendError);
  });

  test('ferme le snack sur closeSnack', () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setTeamName('NewTeam');
    });

    act(() => {
      result.current.closeSnack();
    });

    expect(result.current.snack.open).toBe(false);
  });
});

describe('useJoinOrCreateTeam - joinTeam', () => {
  test('ne peut pas rejoindre si aucune équipe sélectionnée', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    expect(result.current.selectedTeamId).toBe('');

    await act(async () => {
      await result.current.joinTeam();
    });

    expect(teamService.sendJoinRequest).not.toHaveBeenCalled();
    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('join');
    expect(result.current.snack.msg).toBe('Veuillez sélectionner une équipe.');
  });

  test('envoie une demande de rejoindre une équipe avec succès', async () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setSelectedTeamId(1);
    });

    expect(result.current.selectedTeamId).toBe(1);

    await act(async () => {
      await result.current.joinTeam();
    });

    expect(teamService.sendJoinRequest).toHaveBeenCalledWith('fake-token', 1);
    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('success');
    expect(result.current.snack.section).toBe('join');
    expect(result.current.snack.msg).toBe('Demande envoyée avec succès !');
    expect(result.current.selectedTeamId).toBe('');
  });

  test('traite une erreur lors de l’envoi de la demande', async () => {
    const errorMessage = 'Erreur lors de la demande.';
    vi.mocked(teamService.sendJoinRequest).mockRejectedValueOnce(
      new Error(errorMessage),
    );

    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.setSelectedTeamId(1);
    });

    await act(async () => {
      await result.current.joinTeam();
    });

    expect(result.current.snack.open).toBe(true);
    expect(result.current.snack.severity).toBe('error');
    expect(result.current.snack.section).toBe('join');
    expect(result.current.snack.msg).toBe(errorMessage);
  });

  test('ferme le snack pour la section "join"', () => {
    const { result } = renderHook(() => useJoinOrCreateTeam(onTeamCreated));

    act(() => {
      result.current.joinTeam();
    });

    expect(result.current.snack.open).toBe(true);

    act(() => {
      result.current.closeSnack();
    });

    expect(result.current.snack.open).toBe(false);
  });
});
