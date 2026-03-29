import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import AdminPage from './AdminPage';
import { AuthContext } from '../../../contexts/AuthContext';

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

const adminMember = {
  id: 1,
  email: 'admin@vinci.be',
  tag: 'AdminTag',
  speciality: 'Architecte',
  teamName: null,
  profileImage: '/images/avatar1.png',
  isAvailable: true,
  isAdmin: true,
  admin: true,
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
};

const mockContextValue = {
  user: mockAdmin,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const renderAdminPage = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContextValue}>
        <AdminPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

// Helpers pour les boutons par icône
const getDeleteButtonFor = (tag: string) => {
  const row = screen.getByText(tag).closest('.MuiBox-root');
  return row?.querySelector('[data-testid="DeleteIcon"]')?.closest('button');
};

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
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, regularMember],
      });

    renderAdminPage();
    expect(await screen.findByText('Gestion des administrateurs')).toBeTruthy();
  });

  test('affiche la liste des admins', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, regularMember],
      });

    renderAdminPage();
    expect(await screen.findByText('AdminTag')).toBeTruthy();
  });

  test('ouvre le dialog ajouter admin en cliquant sur +', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, regularMember],
      });

    renderAdminPage();
    await screen.findByText('AdminTag');
    fireEvent.click(screen.getByText('+'));

    expect(await screen.findByText('Ajouter un administrateur')).toBeTruthy();
    expect(await screen.findByText('MemberTag')).toBeTruthy();
  });

  test('promeut un membre en admin avec succès', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, regularMember],
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, { ...regularMember, isAdmin: true }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderAdminPage();
    await screen.findByText('AdminTag');
    fireEvent.click(screen.getByText('+'));
    await screen.findByText('MemberTag');

    const addButton = getAddButtonInDialog();
    if (addButton) fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.queryByText('MemberTag est maintenant administrateur.'),
      ).toBeTruthy();
    });
  });

  test('affiche une erreur si la promotion échoue', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, regularMember],
      })
      .mockResolvedValueOnce({ ok: false });

    renderAdminPage();
    await screen.findByText('AdminTag');
    fireEvent.click(screen.getByText('+'));

    const addButton = getAddButtonInDialog();
    if (addButton) fireEvent.click(addButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Impossible de nommer cet administrateur.'),
      ).toBeTruthy();
    });
  });

  test('ouvre le dialog de confirmation de révocation', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, otherAdmin],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [regularMember] });

    renderAdminPage();
    await screen.findByText('OtherAdmin');

    const deleteBtn = getDeleteButtonFor('OtherAdmin');
    if (deleteBtn) fireEvent.click(deleteBtn);

    expect(await screen.findByText('Révoquer un administrateur')).toBeTruthy();
  });

  test('révoque un admin avec succès', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, otherAdmin],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [regularMember] })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => [adminMember] })
      .mockResolvedValueOnce({ ok: true, json: async () => [regularMember] });

    renderAdminPage();
    await screen.findByText('OtherAdmin');

    const deleteBtn = getDeleteButtonFor('OtherAdmin');
    if (deleteBtn) fireEvent.click(deleteBtn);

    await screen.findByText('Révoquer un administrateur');
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(
        screen.queryByText("OtherAdmin n'est plus administrateur."),
      ).toBeTruthy();
    });
  });

  test('affiche erreur si la révocation échoue', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, otherAdmin],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [regularMember] })
      .mockResolvedValueOnce({ ok: false });

    renderAdminPage();
    await screen.findByText('OtherAdmin');

    const deleteBtn = getDeleteButtonFor('OtherAdmin');
    if (deleteBtn) fireEvent.click(deleteBtn);

    await screen.findByText('Révoquer un administrateur');
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(
        screen.queryByText('Impossible de révoquer cet administrateur.'),
      ).toBeTruthy();
    });
  });

  test('annule la révocation', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [adminMember, otherAdmin],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [regularMember] });

    renderAdminPage();
    await screen.findByText('OtherAdmin');

    const deleteBtn = getDeleteButtonFor('OtherAdmin');
    if (deleteBtn) fireEvent.click(deleteBtn);

    await screen.findByText('Révoquer un administrateur');
    fireEvent.click(screen.getByText('Annuler'));

    await waitFor(() => {
      expect(screen.queryByText('Révoquer un administrateur')).toBeFalsy();
    });
  });

  test('affiche la pagination correctement', async () => {
    const manyAdmins = Array.from({ length: 6 }, (_, i) => ({
      ...adminMember,
      id: i + 1,
      email: `admin${i}@vinci.be`,
      tag: `Admin${i}`,
    }));

    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ ok: true, json: async () => manyAdmins })
      .mockResolvedValueOnce({ ok: true, json: async () => manyAdmins });

    renderAdminPage();

    expect(await screen.findByText('Page 1 sur 2')).toBeTruthy();
    fireEvent.click(screen.getByText('Suivant'));
    expect(screen.getByText('Page 2 sur 2')).toBeTruthy();
  });
});
