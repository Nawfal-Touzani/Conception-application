import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamInfoColumn } from './TeamInfoColumn';
import type { TeamDto } from '../../../../types/team.types';

vi.mock('../../../../utils/TeamFormat/team.utils', () => ({
  formatDate: (d: string | null | undefined) => d ?? '—',
}));

const baseTeam: TeamDto = {
  id: 1,
  name: 'TEAM_Alpha',
  responsibleTag: 'Lynx',
  secondResponsibleTag: 'Rogue',
  creationDate: '2026-01-01',
};

const defaultProps = {
  leaveError: null,
  setLeaveError: vi.fn(),
  setConfirmOpen: vi.fn(),
};

const renderComponent = (team: TeamDto | null, props = {}) =>
  render(<TeamInfoColumn team={team} {...defaultProps} {...props} />);

beforeEach(() => vi.clearAllMocks());

describe('TeamInfoColumn', () => {
  it('affiche les infos de la team', () => {
    renderComponent(baseTeam);
    expect(screen.getByText('TEAM_Alpha')).toBeTruthy();
    expect(screen.getByText('Lynx')).toBeTruthy();
    expect(screen.getByText('Rogue')).toBeTruthy();
  });

  it('affiche "—" pour chaque champ quand team est null', () => {
    renderComponent(null);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBe(4);
  });

  it('ouvre la confirmation au clic sur Quitter', () => {
    const setConfirmOpen = vi.fn();
    renderComponent(baseTeam, { setConfirmOpen });
    fireEvent.click(screen.getByRole('button', { name: /quitter/i }));
    expect(setConfirmOpen).toHaveBeenCalledWith(true);
  });

  it('affiche et ferme l alerte leaveError', () => {
    const setLeaveError = vi.fn();
    renderComponent(baseTeam, { leaveError: 'Erreur', setLeaveError });
    expect(screen.getByText('Erreur')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(setLeaveError).toHaveBeenCalledWith(null);
  });
});
