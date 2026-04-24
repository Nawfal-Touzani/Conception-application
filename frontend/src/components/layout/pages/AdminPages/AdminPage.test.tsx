import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AdminPage from './AdminPage';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as adminHook from '../../../../hooks/useAdmin/useAdmin';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockNavigate = vi.fn();
  return { ...actual, useNavigate: vi.fn(() => mockNavigate) };
});

const mockAdmin = {
  id: 1,
  email: 'admin@vinci.be',
  tag: 'AdminTag',
  role: 'ADMIN',
  token: 'fake-token',
};

const regularMember = {
  id: 2,
  email: 'member@vinci.be',
  tag: 'MemberTag',
  speciality: 'Gardien',
  teamName: null,
  profileImage: null,
  isAvailable: false,
  isAdmin: false,
  admin: false,
  isBan: false,
};

const otherAdmin = {
  id: 99,
  email: 'other@vinci.be',
  tag: 'OtherAdmin',
  speciality: 'Gardien',
  teamName: null,
  profileImage: null,
  isAvailable: true,
  isAdmin: true,
  admin: true,
  isBan: false,
};

const mockContextValue = {
  user: mockAdmin,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const buildHookMock = (overrides = {}) => ({
  user: mockAdmin,
  admins: [],
  allMembers: [],
  page: 0,
  setPage: vi.fn(),
  error: null,
  setError: vi.fn(),
  success: null,
  setSuccess: vi.fn(),
  promoteOpen: false,
  setPromoteOpen: vi.fn(),
  demoteTarget: null,
  setDemoteTarget: vi.fn(),
  totalPages: 1,
  paginated: [],
  handlePromote: vi.fn(),
  handleDemote: vi.fn(),
  ...overrides,
});

const renderAdminPage = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextValue}>
        <AdminPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

const getAddButtonInDialog = () => {
  const dialog = screen.getByRole('dialog');
  return dialog.querySelector('[data-testid="AddIcon"]')?.closest('button');
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe('AdminPage', () => {
  test('affiche le titre de la page', async () => {
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(buildHookMock());
    renderAdminPage();
    expect(await screen.findByText('Gestion des administrateurs')).toBeTruthy();
  });

  test('ouvre le dialog ajouter admin en cliquant sur +', async () => {
    const setPromoteOpen = vi.fn();
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ promoteOpen: false, setPromoteOpen }),
    );
    renderAdminPage();
    fireEvent.click(screen.getByText('+'));
    expect(setPromoteOpen).toHaveBeenCalledWith(true);
  });

  test('affiche les membres dans le dialog quand promoteOpen est true', async () => {
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ promoteOpen: true, allMembers: [regularMember] }),
    );
    renderAdminPage();
    expect(await screen.findByText('Ajouter un administrateur')).toBeTruthy();
    expect(
      await screen.findByText(
        `MemberTag#${String(regularMember.id).padStart(3, '0')}`,
      ),
    ).toBeTruthy();
  });

  test('promeut un membre en admin avec succès', async () => {
    const handlePromote = vi.fn();
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({
        promoteOpen: true,
        allMembers: [regularMember],
        handlePromote,
      }),
    );
    renderAdminPage();
    await screen.findByText(
      `MemberTag#${String(regularMember.id).padStart(3, '0')}`,
    );
    const addButton = getAddButtonInDialog();
    if (addButton) fireEvent.click(addButton);
    expect(handlePromote).toHaveBeenCalledWith(regularMember);
  });

  test('affiche message de succès', async () => {
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ success: 'MemberTag est maintenant administrateur.' }),
    );
    renderAdminPage();
    expect(
      await screen.findByText('MemberTag est maintenant administrateur.'),
    ).toBeTruthy();
  });

  test('affiche message erreur', async () => {
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ error: 'Impossible de nommer cet administrateur.' }),
    );
    renderAdminPage();
    expect(
      await screen.findByText('Impossible de nommer cet administrateur.'),
    ).toBeTruthy();
  });

  test('ouvre le dialog de confirmation de révocation', async () => {
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ demoteTarget: otherAdmin, paginated: [otherAdmin] }),
    );
    renderAdminPage();
    expect(await screen.findByText('Révoquer un administrateur')).toBeTruthy();
  });

  test('révoque un admin avec succès', async () => {
    const handleDemote = vi.fn();
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ demoteTarget: otherAdmin, handleDemote }),
    );
    renderAdminPage();
    await screen.findByText('Révoquer un administrateur');
    fireEvent.click(screen.getByText('Confirmer'));
    expect(handleDemote).toHaveBeenCalled();
  });

  test('annule la révocation', async () => {
    const setDemoteTarget = vi.fn();
    vi.spyOn(adminHook, 'useAdmin').mockReturnValue(
      buildHookMock({ demoteTarget: otherAdmin, setDemoteTarget }),
    );
    renderAdminPage();
    await screen.findByText('Révoquer un administrateur');
    fireEvent.click(screen.getByText('Annuler'));
    expect(setDemoteTarget).toHaveBeenCalledWith(null);
  });
});
