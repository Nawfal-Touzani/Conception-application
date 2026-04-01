import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import TournamentCard from './TournamentCard';
import { TournamentDetails } from '../../../types/tournament.types';

const mockTournament: TournamentDetails = {
  id: 1,
  status: 'IN_PROGRESS',
  name: 'Vinci Bounty 2026',
  description: 'Tournoi test',
  startDate: '2026-02-16T00:00:00',
  endDate: '2026-02-23T00:00:00',
  registrationDeadline: '2026-02-10T00:00:00',
  maxParticipants: 8,
  currentParticipants: 3,
  organizerTag: 'Admin',
  isPublic: true,
  winnerTeamName: null,
};

describe('TournamentCard', () => {
  test('renders the tournament name', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('Vinci Bounty 2026')).toBeTruthy();
  });

  test('renders the correct status label from the enum', () => {
    render(<TournamentCard tournament={mockTournament} />);
    // IN_PROGRESS → "À la une"
    expect(screen.getByText('À la une')).toBeTruthy();
  });

  test('renders the correct state label from the enum', () => {
    render(<TournamentCard tournament={mockTournament} />);
    // IN_PROGRESS → "En cours"
    expect(screen.getByText('En cours')).toBeTruthy();
  });

  // "TEAMS" and "8" are two separate Typography components in the card
  test('renders TEAMS and current/max participants', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('TEAMS')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  test('renders PHASE for an in progress tournament', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('PHASE')).toBeTruthy();
    expect(screen.getByText('Inconnue')).toBeTruthy();
  });

  test('renders VAINQUEUR and winnerTeamName for FINISHED tournament', () => {
    const finishedTournament: TournamentDetails = {
      ...mockTournament,
      status: 'FINISHED',
      winnerTeamName: 'Team Alpha',
    };

    render(<TournamentCard tournament={finishedTournament} />);

    expect(screen.getByText('VAINQUEUR')).toBeTruthy();
    expect(screen.getByText('Team Alpha')).toBeTruthy();
  });

  test('renders "Non défini" when winnerTeamName is null for FINISHED', () => {
    const finishedTournament: TournamentDetails = {
      ...mockTournament,
      status: 'FINISHED',
      winnerTeamName: null,
    };

    render(<TournamentCard tournament={finishedTournament} />);

    expect(screen.getByText('VAINQUEUR')).toBeTruthy();
    expect(screen.getByText('Non défini')).toBeTruthy();
  });

  test('renders INSCRIPTIONS ouvertes for public PREPARATION tournament', () => {
    const preparationTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: true,
    };

    render(<TournamentCard tournament={preparationTournament} />);

    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Ouvertes')).toBeTruthy();
    expect(screen.getByText('3/8')).toBeTruthy(); // current/max
    expect(screen.getByText('Ouvert')).toBeTruthy();
  });

  test('renders INSCRIPTIONS fermées for private PREPARATION tournament', () => {
    const preparationTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: false,
    };

    render(<TournamentCard tournament={preparationTournament} />);

    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Fermées')).toBeTruthy();
    expect(screen.getByText('Fermé')).toBeTruthy();
  });

  test('renders formatted dates correctly', () => {
    render(<TournamentCard tournament={mockTournament} />);

    const dateText = screen.getByText('16 févr. - 23 févr.');
    expect(dateText).toBeTruthy();
  });
});
