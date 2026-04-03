import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import NavBarContainer from './useNavBar';
import { AuthContext } from '../../contexts/AuthContext';
import * as notifService from '../../services/notifications.service';
import { Notification } from '../../types/notifications.types';

// Mock du hook de navigation
const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

// Mock notifications service
vi.mock('../../../services/notifications.service');

describe('NavBarContainer', () => {
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

  test('Should not fetch notifications for visitors', () => {
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
          <NavBarContainer />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // No user, so notifications must not be fetched
    expect(notifService.getNotifications).not.toHaveBeenCalled();
  });

  test('Should fetch notifications for connected members', async () => {
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
          <NavBarContainer />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Notifications fetch verifications
    await waitFor(() => {
      expect(notifService.getNotifications).toHaveBeenCalledWith(
        1,
        'toooken',
        false,
      );
    });
  });

  test('Should logout and navigate to /login only on personal profile page (/members/me)', () => {
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
          <NavBarContainer />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Logout function call verification
    fireEvent.click(screen.getByRole('button', { name: /se déconnecter/i }));
    expect(logoutMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
