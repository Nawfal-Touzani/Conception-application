import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import TournamentCard from './TournamentCard';
import { TournamentDetails } from '../../../types/tournament.types';

const mockTournament: TournamentDetails = {
  id: 1,
  status: 'IN_PROGRESS',
  name: 'Vinci Bounty 2026',
  description: 'Tournoi test',
  startDate: '2026-02-16',
  endDate: '2026-02-23',
  registrationDeadline: '2026-02-10',
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
    expect(screen.getByText('À la une')).toBeTruthy();
  });

  test('renders the correct state label from the enum', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('En cours')).toBeTruthy();
  });

  test('renders TEAMS', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('TEAMS')).toBeTruthy();
  });

  test('renders current participants', () => {
    render(<TournamentCard tournament={mockTournament} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  // TODO: add phase in ite3
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

  test('renders formatted dates correctly', () => {
    render(<TournamentCard tournament={mockTournament} />);

    const dateText = screen.getByText('16 févr. - 23 févr.');
    expect(dateText).toBeTruthy();
  });

  test('renders max participants for PREPARATION tournament', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prepTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      registrationDeadline: tomorrow.toISOString().split('T')[0],
    };

    render(<TournamentCard tournament={prepTournament} />);
    expect(screen.getByText('3/8')).toBeTruthy();
  });

  test('renders INSCRIPTIONS ouvertes when deadline not passed and not full', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const openTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: true,
      registrationDeadline: tomorrow.toISOString().split('T')[0],
      currentParticipants: 3,
      maxParticipants: 8,
    };

    render(<TournamentCard tournament={openTournament} />);
    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Ouvertes')).toBeTruthy();
  });

  test('renders inscriptions fermées when registration deadline has passed', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const deadlinePastTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: true,
      registrationDeadline: yesterday.toISOString().split('T')[0],
      currentParticipants: 3,
      maxParticipants: 8,
    };

    render(<TournamentCard tournament={deadlinePastTournament} />);
    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Fermées')).toBeTruthy();
  });

  test('renders inscriptions fermées when tournament is not public', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const notPublicTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: false,
      registrationDeadline: tomorrow.toISOString().split('T')[0],
      currentParticipants: 3,
      maxParticipants: 8,
    };

    render(<TournamentCard tournament={notPublicTournament} />);
    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Fermées')).toBeTruthy();
  });

  test('renders inscriptions fermées when tournament is full', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const fullTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: true,
      registrationDeadline: tomorrow.toISOString().split('T')[0],
      currentParticipants: 8,
      maxParticipants: 8,
    };

    render(<TournamentCard tournament={fullTournament} />);
    expect(screen.getByText('INSCRIPTIONS')).toBeTruthy();
    expect(screen.getByText('Fermées')).toBeTruthy();
  });

  test('renders teams count with slash for PREPARATION tournament', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const prepTournament: TournamentDetails = {
      ...mockTournament,
      status: 'PREPARATION',
      isPublic: true,
      registrationDeadline: tomorrow.toISOString().split('T')[0],
      currentParticipants: 5,
      maxParticipants: 8,
    };

    render(<TournamentCard tournament={prepTournament} />);
    expect(screen.getByText('5/8')).toBeTruthy();
  });

  test('handles CANCELLED tournaments correctly (coverage only)', () => {
    const cancelledTournament: TournamentDetails = {
      ...mockTournament,
      status: 'CANCELLED',
    };

    render(<TournamentCard tournament={cancelledTournament} />);

    expect(screen.getByText('Vinci Bounty 2026')).toBeTruthy();
    expect(screen.getByText('TEAMS')).toBeTruthy();
  });
});
