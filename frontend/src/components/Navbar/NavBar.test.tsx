import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavBar from './index'; // Assure-toi que c'est le bon chemin vers ton composant NavBar
import { AuthContext } from '../../contexts/AuthContext';
import * as notifService from '../../services/notifications.service';
import { Notification } from '../../types/notifications.types';

// Mock du hook de navigation
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock notifications service
vi.mock('../../services/notifications.service');

describe('NavBar', () => {
  const mockUser = {
    id: 1,
    email: 'vitest@mail.com',
    tag: 'Vitest',
    role: 'MEMBER',
    token: 'toooken',
  };

  const logoutMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Should show "Se connecter" et "S\'inscrire" pnly for visitors', () => {
    const mockContextValue = {
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      bannedError: null,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={mockContextValue}>
          <NavBar />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Verify buttons presentation
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /s'inscrire/i })).toBeTruthy();

    // Only for members elements are not present
    expect(screen.queryByText('Vitest')).toBeNull();
    expect(screen.queryByText('Mon équipe')).toBeNull();
  });

  test('Should show profil, notifications images/buttons for members', async () => {
    const mockContextValue = {
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      bannedError: null,
    };

    // Mock 2 notifications sended
    vi.mocked(notifService.getNotifications).mockResolvedValue([
      { id: 1, type: '', message: 'Notification 1', read: false, sendDate: '' },
      { id: 2, type: '', message: 'Notification 2', read: false, sendDate: '' },
    ] as Notification[]);

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={mockContextValue}>
          <NavBar />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Tag verification
    expect(screen.getByText('Vitest')).toBeTruthy();
    expect(screen.getByRole('button', { name: /mon équipe/i })).toBeTruthy();

    // Profile verification
    expect(screen.getByAltText('Profile picture')).toBeTruthy(); // alt

    // Notifications fetch verifications
    await waitFor(() => {
      expect(notifService.getNotifications).toHaveBeenCalledWith(
        1,
        'toooken',
        false,
      );
    });

    // "Mon équipe" button test
    fireEvent.click(screen.getByRole('button', { name: /mon équipe/i }));
    expect(navigateMock).toHaveBeenCalledWith('/team');
  });

  test('Should show the logout button only on the personnal profil page (/members/me)', () => {
    const mockContextValue = {
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      bannedError: null,
    };

    render(
      // Mock we are in "/members/me"
      <MemoryRouter initialEntries={['/members/me']}>
        <AuthContext.Provider value={mockContextValue}>
          <NavBar />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Logout verification
    const logoutBtn = screen.getByRole('button', { name: /se déconnecter/i });
    expect(logoutBtn).toBeTruthy();

    // No more profile image/button
    expect(screen.queryByAltText('Profile picture')).toBeNull();

    // Logout function call verification
    fireEvent.click(logoutBtn);
    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('Clics & redirections verifications', () => {
    const mockContextValue = {
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      bannedError: null,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={mockContextValue}>
          <NavBar />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByAltText('Logo site'));
    expect(navigateMock).toHaveBeenCalledWith('/');

    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));
    expect(navigateMock).toHaveBeenCalledWith('/login');

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));
    expect(navigateMock).toHaveBeenCalledWith('/register');
  });
});
