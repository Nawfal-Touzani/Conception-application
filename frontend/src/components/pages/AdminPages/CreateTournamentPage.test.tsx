import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import CreateTournamentPage from './CreateTournamentPage';
import { useAuth } from '../../../contexts/useAuth';
import * as tournamentService from '../../../services/tournament/tournament.service';
import * as hook from '../../../hooks/useTournamentForm/useTournamentForm';
import type { TournamentStatus } from '../../../types/tournament.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../services/tournament/tournament.service', () => ({
  createTournament: vi.fn(),
}));

type AuthContextType = ReturnType<typeof useAuth>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

type MockUser = {
  id: number;
  email: string;
  tag: string;
  role: string;
  token: string;
};

type MockTournament = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  status: TournamentStatus;
};

const mockUser: MockUser = {
  id: 1,
  email: 'test@test.com',
  tag: 'tester',
  role: 'USER',
  token: 'fake-token',
};

const mockTournament: MockTournament = {
  id: 1,
  name: 'Tournoi test',
  description: 'desc',
  startDate: '2030-01-10',
  endDate: '2030-01-12',
  registrationDeadline: '2030-01-05',
  maxParticipants: 8,
  status: 'PREPARATION',
};

const mockAuth: AuthContextType = {
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const buildHookMock = (
  overrides: Partial<ReturnType<typeof hook.useTournamentForm>> = {},
) => ({
  name: 'Tournoi',
  setName: vi.fn(),
  description: 'Desc',
  setDescription: vi.fn(),
  startDate: '2030-01-10',
  setStartDate: vi.fn(),
  endDate: '2030-01-12',
  setEndDate: vi.fn(),
  registrationDeadline: '2030-01-05',
  setRegistrationDeadline: vi.fn(),
  maxParticipants: 8,
  setMaxParticipants: vi.fn(),
  errors: [],
  setErrors: vi.fn(),
  success: null,
  setSuccess: vi.fn(),
  reset: vi.fn(),
  validate: vi.fn(() => true),
  ...overrides,
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('CreateTournamentPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    vi.clearAllMocks();
  });

  // — Soumission du formulaire ————————————————————————————————————————————————

  test('appelle createTournament quand le formulaire est valide', async () => {
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(buildHookMock());
    vi.mocked(tournamentService.createTournament).mockResolvedValue(
      mockTournament,
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Créer le tournoi'));

    await waitFor(() => {
      expect(tournamentService.createTournament).toHaveBeenCalled();
    });
  });

  test("n'appelle pas createTournament si la validation échoue", async () => {
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ validate: vi.fn(() => false) }),
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Créer le tournoi'));

    await waitFor(() => {
      expect(tournamentService.createTournament).not.toHaveBeenCalled();
    });
  });

  test('appelle setSuccess après une création réussie', async () => {
    const setSuccessMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ setSuccess: setSuccessMock }),
    );
    vi.mocked(tournamentService.createTournament).mockResolvedValue(
      mockTournament,
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Créer le tournoi'));

    await waitFor(() => {
      expect(setSuccessMock).toHaveBeenCalled();
    });
  });

  // — Affichage conditionnel —————————————————————————————————————————————————

  test('affiche le message de succès dans le DOM', () => {
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({
        success: 'Le tournoi "Tournoi" a été créé avec succès !',
      }),
    );

    render(<CreateTournamentPage />);

    expect(
      screen.getByText('Le tournoi "Tournoi" a été créé avec succès !'),
    ).toBeTruthy();
  });

  test('affiche les erreurs dans le DOM', () => {
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ errors: ['Nom requis', 'Date invalide'] }),
    );

    render(<CreateTournamentPage />);

    expect(screen.getByText('Nom requis')).toBeTruthy();
    expect(screen.getByText('Date invalide')).toBeTruthy();
  });

  test("n'affiche pas d'alerte si pas d'erreur ni de succès", () => {
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(buildHookMock());

    render(<CreateTournamentPage />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  // — Gestion des erreurs du service —————————————————————————————————————————

  test('appelle setErrors avec le message quand le service échoue', async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ setErrors: setErrorsMock }),
    );
    vi.mocked(tournamentService.createTournament).mockRejectedValue(
      new Error('Erreur serveur'),
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Créer le tournoi'));

    await waitFor(() => {
      expect(setErrorsMock).toHaveBeenCalledWith(['Erreur serveur']);
    });
  });

  test("appelle setErrors avec 'Erreur inconnue' si l'erreur n'est pas une instance d'Error", async () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ setErrors: setErrorsMock }),
    );
    vi.mocked(tournamentService.createTournament).mockRejectedValue('oops');

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Créer le tournoi'));

    await waitFor(() => {
      expect(setErrorsMock).toHaveBeenCalledWith(['Erreur inconnue']);
    });
  });

  // — Bouton Annuler ——————————————————————————————————————————————————————————

  test('le bouton Annuler appelle reset', () => {
    const resetMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({ reset: resetMock }),
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByText('Annuler'));

    expect(resetMock).toHaveBeenCalledOnce();
  });

  // — Fermeture des alertes ——————————————————————————————————————————————————

  test("fermer l'alerte succès appelle setSuccess(null)", () => {
    const setSuccessMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({
        success: 'Tournoi créé !',
        setSuccess: setSuccessMock,
      }),
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByTitle('Close'));

    expect(setSuccessMock).toHaveBeenCalledWith(null);
  });

  test("fermer l'alerte erreur appelle setErrors([])", () => {
    const setErrorsMock = vi.fn();
    vi.spyOn(hook, 'useTournamentForm').mockReturnValue(
      buildHookMock({
        errors: ['Une erreur'],
        setErrors: setErrorsMock,
      }),
    );

    render(<CreateTournamentPage />);
    fireEvent.click(screen.getByTitle('Close'));

    expect(setErrorsMock).toHaveBeenCalledWith([]);
  });
});
