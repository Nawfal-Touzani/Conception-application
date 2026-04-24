import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { TeamTournamentColumn } from './TeamTournamentsColumn';

const mockInProgress = [
  { id: 1, name: 'Vinci Cup', startDate: '2026-01-01', endDate: '2026-01-05' },
];
const mockUpcoming = [
  {
    id: 2,
    name: 'League Vinci',
    startDate: '2026-06-01',
    endDate: '2026-06-05',
  },
];

describe('TeamTournamentColumn', () => {
  test('affiche les tournois en cours par défaut', () => {
    render(
      <TeamTournamentColumn
        tabIndex={0}
        setTabIndex={vi.fn()}
        tournamentsInProgress={mockInProgress}
        tournamentsUpcoming={mockUpcoming}
      />,
    );
    expect(screen.getByText('Vinci Cup')).toBeTruthy();
    expect(screen.queryByText('League Vinci')).toBeFalsy();
  });

  test('affiche les tournois à venir quand tabIndex est 1', () => {
    render(
      <TeamTournamentColumn
        tabIndex={1}
        setTabIndex={vi.fn()}
        tournamentsInProgress={mockInProgress}
        tournamentsUpcoming={mockUpcoming}
      />,
    );
    expect(screen.getByText('League Vinci')).toBeTruthy();
    expect(screen.queryByText('Vinci Cup')).toBeFalsy();
  });

  test('appel setTabIndex lors du clic sur un onglet', () => {
    const setTabIndex = vi.fn();
    render(
      <TeamTournamentColumn
        tabIndex={0}
        setTabIndex={setTabIndex}
        tournamentsInProgress={mockInProgress}
        tournamentsUpcoming={mockUpcoming}
      />,
    );

    fireEvent.click(screen.getByText(/À venir/));
    expect(setTabIndex).toHaveBeenCalledWith(1);
  });
});
