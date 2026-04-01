import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TournamentDetail from './TournamentDetailPage';
import { AuthContext } from '../../../../contexts/AuthContext';

vi.mock('../../../services/team.service', () => ({
  getMyTeam: vi.fn(),
}));

import * as teamService from '../../../../services/team.service';

const mockUser = {
  id: 1,
  email: 'lea@mail.com',
  tag: 'Lynx',
  role: 'USER',
  token: 'fake-token',
};

const mockContextUser = {
  user: mockUser,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const myTeamResponsible = {
  id: 1,
  name: 'TEAM_ALPHA',
  responsibleTag: 'Lynx',
  secondResponsibleTag: null,
  creationDate: null,
};

const myTeamNotResponsible = {
  id: 1,
  name: 'TEAM_ALPHA',
  responsibleTag: 'Rogue',
  secondResponsibleTag: null,
  creationDate: null,
};

const baseTournament = {
  id: 1,
  name: 'Vinci Easter Cup 2026',
  description: 'Tournoi de Pâques ouvert à toutes les teams actives',
  startDate: '2026-04-15',
  endDate: '2026-04-25',
  registrationDeadline: '2026-04-08',
  maxParticipants: 8,
  currentParticipants: 3,
  organizerTag: 'Admin',
};

const renderWithContext = (component: React.ReactElement) =>
  render(
    <AuthContext.Provider value={mockContextUser}>
      {component}
    </AuthContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error('no team'),
  );
});

describe('TournamentDetail', () => {
  test('affiche le nom du tournoi', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('Vinci Easter Cup 2026')).toBeTruthy();
  });

  test('affiche "Inscriptions ouvertes" pour PREPARATION + isPublic true', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('Ouvert')).toBeTruthy();
  });

  test('affiche "En préparation" pour PREPARATION + isPublic false', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: false,
        }}
      />,
    );
    expect(screen.getAllByText('En préparation').length).toBeGreaterThan(0);
  });

  test('affiche "En cours" pour IN_PROGRESS', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getAllByText('En cours').length).toBeGreaterThan(0);
  });

  test('affiche "Terminé" pour FINISHED', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'FINISHED', isPublic: true }}
      />,
    );
    expect(screen.getAllByText('Terminé').length).toBeGreaterThan(0);
  });

  test('affiche "Annulé" pour CANCELLED', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'CANCELLED', isPublic: false }}
      />,
    );
    expect(screen.getAllByText('Annulé').length).toBeGreaterThan(0);
  });

  test('affiche la date de début', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('15/04/2026')).toBeTruthy();
  });

  test('affiche la date limite des inscriptions', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText(/08\/04\/2026/)).toBeTruthy();
  });

  test('affiche le nombre de teams max', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('8')).toBeTruthy();
  });

  test('affiche "Aucune équipe inscrite" si currentParticipants = 0', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          currentParticipants: 0,
        }}
      />,
    );
    expect(
      screen.getByText('Aucune équipe inscrite pour le moment.'),
    ).toBeTruthy();
  });

  test("affiche le nombre d'équipes inscrites si > 0", () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          currentParticipants: 3,
        }}
      />,
    );
    expect(screen.getByText('3 équipe(s) inscrite(s).')).toBeTruthy();
  });

  test('affiche les sections du bracket', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('Quarts')).toBeTruthy();
    expect(screen.getByText('Demi')).toBeTruthy();
    expect(screen.getByText('Finale')).toBeTruthy();
  });

  test('affiche le panneau "Teams participantes"', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    expect(screen.getByText('Teams participantes')).toBeTruthy();
    expect(screen.getByText('3 sur 8')).toBeTruthy();
  });

  test('affiche le gagnant si FINISHED et winnerTeamName présent', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'FINISHED',
          isPublic: true,
          winnerTeamName: 'TEAM_NOVA',
        }}
      />,
    );
    expect(screen.getByText('🏆 Gagnant')).toBeTruthy();
    expect(screen.getByText('TEAM_NOVA')).toBeTruthy();
  });

  test("n'affiche pas le gagnant si FINISHED mais winnerTeamName absent", () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'FINISHED', isPublic: true }}
      />,
    );
    expect(screen.queryByText('🏆 Gagnant')).toBeFalsy();
  });

  test("n'affiche pas le bouton S'inscrire si l'utilisateur n'est pas responsable", async () => {
    (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockResolvedValue(
      myTeamNotResponsible,
    );
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByText("S'inscrire")).toBeFalsy();
    });
  });

  test("affiche le bouton S'inscrire si l'utilisateur est responsable et inscriptions ouvertes", async () => {
    (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockResolvedValue(
      myTeamResponsible,
    );
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByText("S'inscrire")).toBeTruthy();
    });
  });

  test("n'affiche pas le bouton S'inscrire si le tournoi n'est pas en inscriptions ouvertes", async () => {
    (teamService.getMyTeam as ReturnType<typeof vi.fn>).mockResolvedValue(
      myTeamResponsible,
    );
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
      />,
    );
    await waitFor(() => {
      expect(screen.queryByText("S'inscrire")).toBeFalsy();
    });
  });
});
