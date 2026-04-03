/* eslint-disable @typescript-eslint/no-explicit-any */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ProfileSidebar } from './ProfileSidebar';
import { AuthContext } from '../../../../contexts/AuthContext';
import * as memberService from '../../../../services/member/member.service';

vi.mock('../../services/memberService');

const reloadSpy = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadSpy },
  writable: true,
});

const mockProfile = {
  profileImage: '/uploads/img.png',
  admin: true,
  speciality: 'architect',
  teamName: 'Vincinho ',
  creationDate: '2024-01-01',
  isAvailable: false,
  tag: 'Player1',
  email: 'test@vinci.com',
};

describe('ProfileSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should display the role and status correctly', () => {
    render(
      <AuthContext.Provider value={{ user: { token: '123' } } as any}>
        <ProfileSidebar profile={mockProfile} />
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Indisponible')).toBeTruthy();
  });

  test('should handle successful avatar change and reload page', async () => {
    const updateSpy = vi
      .spyOn(memberService, 'updateMyProfile')
      .mockResolvedValue({} as any);

    render(
      <AuthContext.Provider value={{ user: { token: 'tok' } } as any}>
        <ProfileSidebar profile={mockProfile as any} />
      </AuthContext.Provider>,
    );

    fireEvent.click(screen.getByText('Changer son avatar'));

    const confirmBtn = screen.getByText('Confirmer');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  test('should display an alert when the service fails', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(memberService, 'updateMyProfile').mockRejectedValue(
      new Error('API Error'),
    );

    render(
      <AuthContext.Provider value={{ user: { token: 'tok' } } as any}>
        <ProfileSidebar profile={mockProfile as any} />
      </AuthContext.Provider>,
    );

    fireEvent.click(screen.getByText('Changer son avatar'));

    const confirmBtn = screen.getByText('Confirmer');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Erreur lors du changement d'avatar",
      );
    });
  });

  test('should correctly handle absolute and relative image URLs', () => {
    const profileWithRelative = { ...mockProfile, profileImage: '/local.png' };

    render(
      <AuthContext.Provider value={{ user: { token: 'tok' } } as any}>
        <ProfileSidebar profile={profileWithRelative as any} />
      </AuthContext.Provider>,
    );

    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain(
      'http://localhost:3000/local.png',
    );
  });
});
