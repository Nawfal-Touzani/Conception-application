import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import TournamentCard from './TournamentCard';
import { Tournament } from '../../../types/tournament.types';

const mockTournament: Tournament = {
  id: 1,
  status: 'IN_PROGRESS',
  name: 'Vinci Bounty 2026',
  startDate: '2026-02-16T00:00:00',
  endDate: '2026-02-23T00:00:00',
  maxParticipant: 8,
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

  test('renders TEAMS and maxParticipants in separate elements', () => {
    render(<TournamentCard tournament={mockTournament} />);
    // "TEAMS" and "8" are two separate Typography components in the card
    expect(screen.getByText('TEAMS')).toBeTruthy();
    expect(screen.getByText('8')).toBeTruthy();
  });

  test('does not render TEAMS when maxParticipants is not provided', () => {
    const withoutMax = { ...mockTournament, maxParticipants: undefined };
    render(<TournamentCard tournament={withoutMax} />);
    expect(screen.queryByText('TEAMS')).toBeNull();
  });
});
