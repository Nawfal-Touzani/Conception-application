import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import TournamentDetail from './TournamentDetailPage';

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

describe('TournamentDetail', () => {
  test('affiche le nom du tournoi', () => {
    render(
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
    render(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: true,
        }}
      />,
    );
    const elements = screen.getAllByText('Inscriptions ouvertes');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('affiche "En préparation" pour PREPARATION + isPublic false', () => {
    render(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'PREPARATION',
          isPublic: false,
        }}
      />,
    );
    const elements = screen.getAllByText('En préparation');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('affiche "En cours" pour IN_PROGRESS', () => {
    render(
      <TournamentDetail
        tournament={{
          ...baseTournament,
          status: 'IN_PROGRESS',
          isPublic: true,
        }}
      />,
    );
    const elements = screen.getAllByText('En cours');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('affiche "Terminé" pour FINISHED', () => {
    render(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'FINISHED', isPublic: true }}
      />,
    );
    const elements = screen.getAllByText('Terminé');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('affiche "Annulé" pour CANCELLED', () => {
    render(
      <TournamentDetail
        tournament={{ ...baseTournament, status: 'CANCELLED', isPublic: false }}
      />,
    );
    const elements = screen.getAllByText('Annulé');
    expect(elements.length).toBeGreaterThan(0);
  });

  test('affiche la date de début', () => {
    render(
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
    render(
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
    render(
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
    render(
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
    render(
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
    render(
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
    render(
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
});
