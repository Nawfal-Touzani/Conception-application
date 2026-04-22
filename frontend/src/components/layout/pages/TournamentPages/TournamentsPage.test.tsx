import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TournamentsPage from './TournamentPage';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as matchService from '../../../../services/match/match.service';

vi.mock('../../../../services/tournament/tournament.service', () => ({
  getTournaments: vi.fn(),
}));

vi.mock('../../../../services/tournament/tournament.service', () => ({
  updateTournament: vi.fn(),
  publishTournament: vi.fn(),
  getTournaments: vi.fn(),
}));

vi.mock('../../../../services/match/match.service', () => ({
  getBracketByTournament: vi.fn(),
  getMatchById: vi.fn(),
}));

import * as tournamentService from '../../../../services/tournament/tournament.service';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAdmin = {
  id: 1,
  email: 'admin@vinci.be',
  tag: 'Admin',
  role: 'ADMIN',
  token: 'fake-token',
};

const mockUser = {
  id: 2,
  email: 'lea@mail.com',
  tag: 'Lynx',
  role: 'USER',
  token: 'fake-token-user',
};

const mockContextAdmin = {
  user: mockAdmin,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const mockContextUser = {
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const tournamentOpen = {
  id: 1,
  name: 'Vinci Easter Cup 2026',
  description: 'Tournoi de Pâques',
  startDate: '2026-04-15',
  endDate: '2026-04-25',
  registrationDeadline: '2099-12-31',
  maxParticipants: 8,
  currentParticipants: 3,
  status: 'PREPARATION' as const,
  isPublic: true,
  organizerTag: 'Admin',
};

const tournamentInProgress = {
  id: 2,
  name: 'Spring Battle Series 2026',
  description: 'Série printanière',
  startDate: '2026-04-04',
  endDate: '2026-04-11',
  registrationDeadline: '2026-04-01',
  maxParticipants: 8,
  currentParticipants: 8,
  status: 'IN_PROGRESS' as const,
  isPublic: true,
  organizerTag: 'Admin',
};

const tournamentFinished = {
  id: 3,
  name: 'Spring Arena Cup 2025',
  description: 'Compétition printanière',
  startDate: '2025-04-15',
  endDate: '2025-04-25',
  registrationDeadline: '2025-04-10',
  maxParticipants: 8,
  currentParticipants: 8,
  status: 'FINISHED' as const,
  isPublic: true,
  organizerTag: 'Admin',
};

const tournamentPrivate = {
  id: 4,
  name: 'Tournoi Privé',
  description: 'Tournoi en préparation',
  startDate: '2026-06-01',
  endDate: '2026-06-10',
  registrationDeadline: '2026-05-25',
  maxParticipants: 8,
  currentParticipants: 0,
  status: 'PREPARATION' as const,
  isPublic: false,
  organizerTag: 'Admin',
};

const renderAsAdmin = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextAdmin}>
        <TournamentsPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

const renderAsUser = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextUser}>
        <TournamentsPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TournamentsPage', () => {
  test('affiche le titre de la page', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsUser();
    expect(await screen.findByText('Tournois')).toBeTruthy();
  });

  test('affiche les tournois chargés', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      tournamentOpen,
      tournamentInProgress,
      tournamentFinished,
    ]);
    renderAsUser();
    expect(await screen.findByText('Vinci Easter Cup 2026')).toBeTruthy();
    expect(await screen.findByText('Spring Battle Series 2026')).toBeTruthy();
    expect(await screen.findByText('Spring Arena Cup 2025')).toBeTruthy();
  });

  test('affiche "Inscriptions ouvertes" pour un tournoi PREPARATION + isPublic', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsUser();
    expect(await screen.findByText('Inscriptions ouvertes')).toBeTruthy();
  });

  test('affiche "En cours" pour un tournoi IN_PROGRESS', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentInProgress]);
    renderAsUser();
    expect(await screen.findByText('En cours')).toBeTruthy();
  });

  test('affiche "Terminé" pour un tournoi FINISHED', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentFinished]);
    renderAsUser();
    expect(await screen.findByText('Terminé')).toBeTruthy();
  });

  test('affiche "En préparation" pour un tournoi PREPARATION + isPublic false (admin)', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentPrivate]);
    renderAsAdmin();
    expect(await screen.findByText('En préparation')).toBeTruthy();
  });

  test('affiche le message si aucun tournoi trouvé', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([]);
    renderAsUser();
    expect(await screen.findByText('Aucun tournoi trouvé.')).toBeTruthy();
  });

  test('affiche une erreur si le chargement échoue', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Erreur réseau'));
    renderAsUser();
    expect(
      await screen.findByText('Erreur lors du chargement des tournois.'),
    ).toBeTruthy();
  });

  test('filtre les tournois par nom', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen, tournamentInProgress]);
    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');

    fireEvent.change(screen.getAllByPlaceholderText('Rechercher...')[0], {
      target: { value: 'Spring' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Vinci Easter Cup 2026')).toBeFalsy();
      expect(screen.queryByText('Spring Battle Series 2026')).toBeTruthy();
    });
  });

  test('filtre par statut "Inscriptions ouvertes"', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen, tournamentInProgress]);
    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');

    fireEvent.click(screen.getByLabelText('Inscriptions ouvertes'));

    await waitFor(() => {
      expect(screen.queryByText('Vinci Easter Cup 2026')).toBeTruthy();
      expect(screen.queryByText('Spring Battle Series 2026')).toBeFalsy();
    });
  });

  test('filtre par statut "En Cours"', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen, tournamentInProgress]);
    renderAsUser();
    await screen.findByText('Spring Battle Series 2026');

    fireEvent.click(screen.getByLabelText('En Cours'));

    await waitFor(() => {
      expect(screen.queryByText('Spring Battle Series 2026')).toBeTruthy();
      expect(screen.queryByText('Vinci Easter Cup 2026')).toBeFalsy();
    });
  });

  test('réinitialise les filtres', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen, tournamentInProgress]);
    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');

    fireEvent.change(screen.getAllByPlaceholderText('Rechercher...')[0], {
      target: { value: 'Spring' },
    });

    await waitFor(() => {
      expect(screen.queryByText('Vinci Easter Cup 2026')).toBeFalsy();
    });

    fireEvent.click(screen.getByText('Réinitialiser'));

    await waitFor(() => {
      expect(screen.queryByText('Vinci Easter Cup 2026')).toBeTruthy();
    });
  });

  test('affiche le bouton Administrer pour les admins', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsAdmin();
    expect(await screen.findByText('Administrer')).toBeTruthy();
  });

  test("n'affiche pas le bouton Administrer pour les non-admins", async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');
    expect(screen.queryByText('Administrer')).toBeFalsy();
  });

  test('le bouton Administrer est désactivé pour un tournoi terminé', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentFinished]);
    renderAsAdmin();
    const btn = await screen.findByText('Administrer');
    const button = btn.closest('button');
    expect(button).not.toBeNull();
    expect(button!.disabled).toBe(true);
  });

  test('affiche les filtres Annulés et Visibilité uniquement pour les admins', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsAdmin();
    await screen.findByText('Vinci Easter Cup 2026');
    expect(screen.queryByLabelText('Annulés')).toBeTruthy();
    expect(screen.queryByText('Visibilité')).toBeTruthy();
  });

  test("n'affiche pas les filtres Annulés et Visibilité pour les non-admins", async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');
    expect(screen.queryByLabelText('Annulés')).toBeFalsy();
    expect(screen.queryByText('Visibilité')).toBeFalsy();
  });

  test('navigue vers le détail en cliquant sur le bouton info', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);

    (
      matchService.getBracketByTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue([
      {
        id: 10,
        roundNumber: 1,
        roundLabel: 'Quarts',
        teamA: { id: 1, name: 'Team A' },
        teamB: { id: 2, name: 'Team B' },
        scoreA: null,
        scoreB: null,
        winnerId: null,
        state: 'SCHEDULED',
      },
    ]);

    renderAsUser();
    await screen.findByText('Vinci Easter Cup 2026');

    const infoButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg'));
    fireEvent.click(infoButtons[0]);

    expect(await screen.findByText('Quarts')).toBeTruthy();
  });

  test('clique sur Administrer navigue vers TournamentAdminPage', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsAdmin();
    await screen.findByText('Vinci Easter Cup 2026');

    fireEvent.click(screen.getByText('Administrer'));

    expect(await screen.findByText('Gestion du tournoi')).toBeTruthy();
  });

  test('la flèche retour depuis TournamentAdminPage revient à la liste', async () => {
    (
      tournamentService.getTournaments as ReturnType<typeof vi.fn>
    ).mockResolvedValue([tournamentOpen]);
    renderAsAdmin();
    await screen.findByText('Vinci Easter Cup 2026');

    fireEvent.click(screen.getByText('Administrer'));
    await screen.findByText('Gestion du tournoi');

    const backButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.querySelector('svg'));
    fireEvent.click(backButtons[0]);

    expect(await screen.findByText('Vinci Easter Cup 2026')).toBeTruthy();
  });
});
