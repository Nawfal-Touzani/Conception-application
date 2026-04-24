import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TournamentDetail from './TournamentDetailPage';
import { AuthContext } from '../../../../contexts/AuthContext';

vi.mock('../../../../hooks/useTournamentDetail/useTournamentDetail', () => ({
  useTournamentDetail: vi.fn(),
}));

vi.mock('./TournamentBracket', () => ({
  default: () => <div>Bracket</div>,
}));

vi.mock('../MatchPage/MatchDetailPage', () => ({
  default: () => <div>Match detail page</div>,
}));

vi.mock('../MatchPage/MatchSelectionPage', () => ({
  default: () => <div>Match selection page</div>,
}));

vi.mock('../../../../services/match/match.service', () => ({
  getMatchById: vi.fn(),
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

const onRegister = vi.fn(async () => {});
const onBack = vi.fn();

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
  myTeam: null,
  isResponsible: false,
  isAlreadyRegistered: false,
  registrationOpen: true,
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

const renderTournamentDetail = (
  tournamentOverrides = {},
  hookOverrides = {},
) => {
  (
    useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
  ).mockReturnValue({
    ...defaultHookReturn,
    ...hookOverrides,
  });

  return renderWithContext(
    <TournamentDetail
      tournament={{
        ...baseTournament,
        status: 'PREPARATION',
        isPublic: true,
        ...tournamentOverrides,
      }}
      onRegister={onRegister}
      onBack={onBack}
    />,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  (
    useTournamentDetailModule.useTournamentDetail as ReturnType<typeof vi.fn>
  ).mockReturnValue(defaultHookReturn);
});

describe('TournamentDetail', () => {
  test('affiche le nom du tournoi', () => {
    renderTournamentDetail();
    expect(screen.getByText('Vinci Easter Cup 2026')).toBeTruthy();
  });

  test('affiche le bouton retour et appelle onBack au clic', () => {
    renderTournamentDetail();
    fireEvent.click(screen.getByRole('button', { name: /tous les tournois/i }));
    expect(onBack).toHaveBeenCalled();
  });

  test('affiche "Ouvert" pour PREPARATION + registrationOpen true', () => {
    renderTournamentDetail({}, { registrationOpen: true });
    expect(screen.getByText('Ouvert')).toBeTruthy();
  });

  test('affiche "En préparation" pour PREPARATION + isPublic false', () => {
    renderTournamentDetail({ isPublic: false }, { registrationOpen: false });
    expect(screen.getAllByText('En préparation').length).toBeGreaterThan(0);
  });

  test('affiche "En cours" pour IN_PROGRESS', () => {
    renderTournamentDetail({ status: 'IN_PROGRESS' });
    expect(screen.getAllByText('En cours').length).toBeGreaterThan(0);
  });

  test('affiche "Terminé" pour FINISHED', () => {
    renderTournamentDetail({ status: 'FINISHED' });
    expect(screen.getAllByText('Terminé').length).toBeGreaterThan(0);
  });

  test('affiche "Annulé" pour CANCELLED', () => {
    renderTournamentDetail({ status: 'CANCELLED', isPublic: false });
    expect(screen.getAllByText('Annulé').length).toBeGreaterThan(0);
  });

  test('affiche la date de début', () => {
    renderTournamentDetail();
    expect(screen.getByText('15/04/2026')).toBeTruthy();
  });

  test('affiche la date limite des inscriptions', () => {
    renderTournamentDetail();
    expect(screen.getByText(/08\/04\/2026/)).toBeTruthy();
  });

  test('affiche le nombre de teams max', () => {
    renderTournamentDetail();
    expect(screen.getByText('8')).toBeTruthy();
  });

  test('affiche "Aucune équipe inscrite" si currentParticipants = 0', () => {
    renderTournamentDetail({
      currentParticipants: 0,
      registeredTeamNames: [],
    });
    expect(
      screen.getByText('Aucune équipe inscrite pour le moment.'),
    ).toBeTruthy();
  });

  test('affiche la liste des équipes inscrites', () => {
    renderTournamentDetail();
    expect(screen.getByText('TEAM_OMEGA')).toBeTruthy();
    expect(screen.getByText('TEAM_VOID')).toBeTruthy();
    expect(screen.getByText('TEAM_STORM')).toBeTruthy();
  });

  test('affiche le panneau "Teams participantes"', () => {
    renderTournamentDetail();
    expect(screen.getByText('Teams participantes')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  test('affiche le gagnant si FINISHED et winnerTeamName présent', () => {
    renderTournamentDetail({
      status: 'FINISHED',
      winnerTeamName: 'TEAM_WINNER',
    });
    expect(screen.getByText('🏆 Gagnant')).toBeTruthy();
    expect(screen.getByText('TEAM_WINNER')).toBeTruthy();
  });

  test("n'affiche pas le gagnant si FINISHED mais winnerTeamName absent", () => {
    renderTournamentDetail({ status: 'FINISHED' });
    expect(screen.queryByText('🏆 Gagnant')).toBeFalsy();
  });

  test("n'affiche pas le bouton S'inscrire si l'utilisateur n'est pas responsable", () => {
    renderTournamentDetail(
      {},
      { registrationOpen: true, isResponsible: false },
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
  });

  test("affiche le bouton S'inscrire si responsable, inscriptions ouvertes, pas encore inscrit et tournoi non complet", () => {
    renderTournamentDetail(
      { registeredTeamNames: [] },
      {
        registrationOpen: true,
        isResponsible: true,
        isAlreadyRegistered: false,
      },
    );
    expect(screen.queryByText("S'inscrire")).toBeTruthy();
  });

  test("affiche 'déjà inscrits' si registrationOpen et team déjà inscrite", () => {
    renderTournamentDetail(
      { registeredTeamNames: ['TEAM_ALPHA'] },
      {
        registrationOpen: true,
        isResponsible: true,
        isAlreadyRegistered: true,
      },
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeTruthy();
  });

  test("n'affiche pas 'déjà inscrits' si registrationOpen est false", () => {
    renderTournamentDetail(
      { status: 'IN_PROGRESS', registeredTeamNames: ['TEAM_ALPHA'] },
      { registrationOpen: false, isAlreadyRegistered: true },
    );
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeFalsy();
  });

  test("n'affiche pas le bouton S'inscrire si le tournoi est complet", () => {
    renderTournamentDetail(
      {
        currentParticipants: 8,
        maxParticipants: 8,
        registeredTeamNames: [],
      },
      {
        registrationOpen: true,
        isResponsible: true,
        isAlreadyRegistered: false,
      },
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
    expect(screen.queryByText('Le tournoi est complet.')).toBeTruthy();
  });

  test("n'affiche pas le message complet si la team est déjà inscrite", () => {
    renderTournamentDetail(
      {
        currentParticipants: 8,
        maxParticipants: 8,
        registeredTeamNames: ['TEAM_ALPHA'],
      },
      {
        registrationOpen: true,
        isAlreadyRegistered: true,
      },
    );
    expect(screen.queryByText('Le tournoi est complet.')).toBeFalsy();
    expect(
      screen.queryByText('Vous êtes déjà inscrits à ce tournoi.'),
    ).toBeTruthy();
  });

  test("n'affiche pas le bouton S'inscrire si le tournoi n'est pas en inscriptions ouvertes", () => {
    renderTournamentDetail(
      { status: 'IN_PROGRESS' },
      { registrationOpen: false, isResponsible: true },
    );
    expect(screen.queryByText("S'inscrire")).toBeFalsy();
  });
});
