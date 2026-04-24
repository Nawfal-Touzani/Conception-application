import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { TeamDto, TeamMember } from '../../../../types/team.types';
import { TeamMemberColumn } from './TeamMembersColum';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseTeam: TeamDto = {
  id: 1,
  name: 'Team Alpha',
  responsibleTag: 'Lynx',
  secondResponsibleTag: 'Pulse',
  creationDate: '2024-01-01',
};

const makeMember = (overrides: Partial<TeamMember> = {}): TeamMember => ({
  memberId: 1,
  gameTag: 'Rogue',
  avatarUrl: '/avatar1.png',
  isAvailable: true,
  ...overrides,
});

const defaultProps = {
  team: baseTeam,
  isResponsible: false,
  nominateError: null,
  setNominateError: vi.fn(),
  nominateSuccess: null,
  setNominateSuccess: vi.fn(),
  handleNominate: vi.fn(),
};

const renderComponent = (members: TeamMember[], props = {}) =>
  render(
    <MemoryRouter>
      <TeamMemberColumn members={members} {...defaultProps} {...props} />
    </MemoryRouter>,
  );

beforeEach(() => vi.clearAllMocks());

describe('Affichage', () => {
  it('affiche le bon nombre de membres', () => {
    const members = [
      makeMember(),
      makeMember({ memberId: 2, gameTag: 'Leon' }),
    ];
    renderComponent(members);
    expect(screen.getByText('Tous (2)')).toBeTruthy();
  });

  it('affiche Disponible / Indisponible selon isAvailable', () => {
    renderComponent([
      makeMember({ isAvailable: true }),
      makeMember({ memberId: 2, gameTag: 'p2', isAvailable: false }),
    ]);
    expect(screen.getByText('Disponible')).toBeTruthy();
    expect(screen.getByText('Indisponible')).toBeTruthy();
  });
});

describe('Bouton Nommer', () => {
  it("n'apparaît pas si isResponsible est false", () => {
    renderComponent([makeMember({ gameTag: 'regular' })], {
      isResponsible: false,
    });
    expect(screen.queryByRole('button', { name: /nommer/i })).toBeFalsy();
  });

  it("n'apparaît pas pour le responsable principal ou second", () => {
    const members = [
      makeMember({ gameTag: 'Lynx' }),
      makeMember({ memberId: 2, gameTag: 'Pulse' }),
    ];
    renderComponent(members, { isResponsible: true });
    expect(screen.queryByRole('button', { name: /nommer/i })).toBeFalsy();
  });

  it('apparaît pour un membre ordinaire quand isResponsible est true', () => {
    renderComponent([makeMember({ gameTag: 'regular' })], {
      isResponsible: true,
    });
    expect(screen.queryByRole('button', { name: /nommer/i })).toBeTruthy();
  });

  it('appelle handleNominate avec le bon memberId', () => {
    const handleNominate = vi.fn();
    renderComponent([makeMember({ memberId: 42, gameTag: 'regular' })], {
      isResponsible: true,
      handleNominate,
    });
    fireEvent.click(screen.getByRole('button', { name: /nommer/i }));
    expect(handleNominate).toHaveBeenCalledWith(42);
  });
});

describe('Navigation', () => {
  it('navigue vers le profil au clic sur le gameTag', () => {
    renderComponent([makeMember({ memberId: 7, gameTag: 'clicker' })]);
    fireEvent.click(screen.getByText('clicker#007'));
    expect(mockNavigate).toHaveBeenCalledWith('/members/7');
  });
});

describe('Alertes', () => {
  it('affiche et ferme l" alerte erreur', () => {
    const setNominateError = vi.fn();
    renderComponent([makeMember()], {
      nominateError: 'Erreur serveur',
      setNominateError,
    });
    expect(screen.getByText('Erreur serveur')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(setNominateError).toHaveBeenCalledWith(null);
  });

  it('affiche et ferme l" alerte succès', () => {
    const setNominateSuccess = vi.fn();
    renderComponent([makeMember()], {
      nominateSuccess: 'Membre nommé !',
      setNominateSuccess,
    });
    expect(screen.getByText('Membre nommé !')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(setNominateSuccess).toHaveBeenCalledWith(null);
  });
});
