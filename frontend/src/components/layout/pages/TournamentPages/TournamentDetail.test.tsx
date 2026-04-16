import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TournamentDetail from './TournamentDetailPage';
import { AuthContext } from '../../../../contexts/AuthContext';

vi.mock('../../../../hooks/useTournamentDetail/useTournamentDetail', () => ({
  useTournamentDetail: vi.fn(),
}));

import * as useTournamentDetailModule from '../../../../hooks/useTournamentDetail/useTournamentDetail';

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

const onRegister = async () => {};

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
  registeredTeamNames: ['TEAM_OMEGA', 'TEAM_VOID', 'TEAM_STORM'],
};

const defaultHookReturn = {
  isResponsible: false,
  isAlreadyRegistered: false,
  registrationOpen: false,
  registerSuccess: false,
  registerError: null,
  handleRegister: vi.fn(),
};

const renderWithContext = (component: React.ReactElement) =>
  render(
    <AuthContext.Provider value={mockContextUser}>
      {component}
    </AuthContext.Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  (
    useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
  ).mockReturnValue(defaultHookReturn);
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
        onRegister={onRegister}
      />,
    );
    expect(screen.getByText('Vinci Easter Cup 2026')).toBeTruthy();
  });

  test('affiche "Ouvert" pour PREPARATION + isPublic true', () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
        onRegister={onRegister}
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
        onRegister={onRegister}
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
        onRegister={onRegister}
      />,
    );
    expect(screen.getAllByText('En cours').length).toBeGreaterThan(0);
  });

  test('affiche "Terminé" pour FINISHED', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'FINISHED', isPublic: true }}
        onRegister={onRegister}
      />,
    );
    expect(screen.getAllByText('Terminé').length).toBeGreaterThan(0);
  });

  test('affiche "Annulé" pour CANCELLED', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'CANCELLED', isPublic: false }}
        onRegister={onRegister}
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
        onRegister={onRegister}
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
        onRegister={onRegister}
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
        onRegister={onRegister}
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
          registeredTeamNames: [],
        }}
        onRegister={onRegister}
      />,
    );
    expect(
      screen.getByText('Aucune équipe inscrite pour le moment.'),
    ).toBeTruthy();
  });

  test('affiche la liste des équipes inscrites', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.getByText('TEAM_OMEGA')).toBeTruthy();
    expect(screen.getByText('TEAM_VOID')).toBeTruthy();
    expect(screen.getByText('TEAM_STORM')).toBeTruthy();
  });

  test('affiche les sections du bracket', () => {
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
        onRegister={onRegister}
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
        onRegister={onRegister}
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
          winnerTeamName: 'TEAM_WINNER',
          registeredTeamNames: [],
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.getByText('🏆 Gagnant')).toBeTruthy();
    expect(screen.getByText('TEAM_WINNER')).toBeTruthy();
  });

  test("n'affiche pas le gagnant si FINISHED mais winnerTeamName absent", () => {
    renderWithContext(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'FINISHED', isPublic: true }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText('🏆 Gagnant')).toBeFalsy();
  });

  test("n'affiche pas le bouton S'inscrire si l'utilisateur n'est pas responsable", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
      isResponsible: false,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
  });

  test("affiche le bouton S'inscrire si responsable, inscriptions ouvertes, pas encore inscrit et tournoi non complet", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
      isResponsible: true,
      isAlreadyRegistered: false,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          registeredTeamNames: [],
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText("S'inscrire")).toBeTruthy();
  });

  test("affiche 'déjà inscrits' si registrationOpen et team déjà inscrite", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
      isResponsible: true,
      isAlreadyRegistered: true,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          registeredTeamNames: ['TEAM_ALPHA'],
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeTruthy();
  });

  test("n'affiche pas 'déjà inscrits' si registrationOpen est false", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: false,
      isAlreadyRegistered: true,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
          registeredTeamNames: ['TEAM_ALPHA'],
        }}
        onRegister={onRegister}
      />,
    );
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeFalsy();
  });

  test("n'affiche pas le bouton S'inscrire si le tournoi est complet", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
      isResponsible: true,
      isAlreadyRegistered: false,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          currentParticipants: 8,
          maxParticipants: 8,
          registeredTeamNames: [],
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
    expect(screen.queryByText('Le tournoi est complet.')).toBeTruthy();
  });

  test("n'affiche pas le message complet si la team est déjà inscrite", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: true,
      isAlreadyRegistered: true,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
          currentParticipants: 8,
          maxParticipants: 8,
          registeredTeamNames: ['TEAM_ALPHA'],
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText('Le tournoi est complet.')).toBeFalsy();
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeTruthy();
  });

  test("n'affiche pas le bouton S'inscrire si le tournoi n'est pas en inscriptions ouvertes", () => {
    (
      useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      ...defaultHookReturn,
      registrationOpen: false,
      isResponsible: true,
    });
    renderWithContext(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
        onRegister={onRegister}
      />,
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
  });
});
