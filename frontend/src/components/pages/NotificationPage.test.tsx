import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import NotificationsPage from './NotificationsPage';
import * as AuthContext from '../../contexts/AuthContext';
import * as notificationService from '../../services/notifications.service';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock useAuth
vi.mock('../../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../../contexts/AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock notification service
vi.mock('../../services/notifications.service', () => ({
  getNotifications: vi.fn(),
  markAsRead: vi.fn(),
}));

// Mock user
const mockUser = {
  id: 1,
  email: 'test@test.com',
  tag: 'TestUser',
  role: 'MEMBER',
  token: 'fake-token',
};

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    type: 'MEMBERSHIP_REQUEST',
    message: "Votre demande d'adhésion à TeamTest a été acceptée !",
    sendDate: '2026-03-10T12:00:00',
    read: false,
    membershipRequestId: 1,
  },
  {
    id: 2,
    type: 'MEMBERSHIP_REQUEST',
    message:
      "Votre demande d'adhésion à TeamTest a été refusée : La team ne recrute pas actuellement",
    sendDate: '2026-03-10T13:00:00',
    read: true,
    membershipRequestId: 2,
  },
];

describe('NotificationsPage', () => {
  test('displays "Aucune notification." when list is empty', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Aucune notification.')).toBeTruthy();
    });
  });

  test('displays notifications when list is not empty', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue(
      mockNotifications,
    );

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Votre demande d'adhésion à TeamTest a été acceptée !",
        ),
      ).toBeTruthy();
      expect(
        screen.getByText(
          "Votre demande d'adhésion à TeamTest a été refusée : La team ne recrute pas actuellement",
        ),
      ).toBeTruthy();
    });
  });

  test('calls getNotifications with false when clicking "Non lues"', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue([
      mockNotifications[0],
    ]);

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Non lues'));

    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.token,
        false,
      );
    });
  });

  test('calls markAsRead when clicking the image', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue([
      mockNotifications[0],
    ]);
    vi.mocked(notificationService.markAsRead).mockResolvedValue({
      ...mockNotifications[0],
      read: true,
    });

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByAltText('Marquer comme lu')).toBeTruthy();
    });

    fireEvent.click(screen.getByAltText('Marquer comme lu'));

    await waitFor(() => {
      expect(notificationService.markAsRead).toHaveBeenCalledWith(
        mockUser.id,
        1,
        mockUser.token,
      );
    });
  });

  test('does not fetch notifications when user is not logged in', async () => {
    vi.clearAllMocks();
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(notificationService.getNotifications).not.toHaveBeenCalled();
    });
  });

  test('calls getNotifications with true when clicking "Lues"', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue([
      mockNotifications[1],
    ]);

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByText('Lues'));

    await waitFor(() => {
      expect(notificationService.getNotifications).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.token,
        true,
      );
    });
  });

  test('does not call markAsRead when user is not logged in', async () => {
    vi.clearAllMocks();
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(notificationService.markAsRead).not.toHaveBeenCalled();
    });
  });

  test('updates notification list after marking as read', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    vi.mocked(notificationService.getNotifications).mockResolvedValue([
      mockNotifications[0],
    ]);
    vi.mocked(notificationService.markAsRead).mockResolvedValue({
      ...mockNotifications[0],
      read: true,
    });

    render(
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByAltText('Marquer comme lu')).toBeTruthy();
    });

    fireEvent.click(screen.getByAltText('Marquer comme lu'));

    await waitFor(() => {
      expect(screen.queryByAltText('Marquer comme lu')).toBeFalsy();
    });
  });
});
