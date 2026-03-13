/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { ProfileSidebar } from './ProfileSidebar';
import { AuthContext } from '../../contexts/AuthContext';

describe('ProfileSidebar', () => {
  const mockProfile = {
    profileImage: '/uploads/avatar.png',
    admin: true,
    speciality: 'Architect',
    creationDate: '2024-01-01',
    available: true,
  } as any;

  test('displays the role and status correctly', () => {
    render(
      <AuthContext.Provider value={{ user: { token: '123' } } as any}>
        <ProfileSidebar profile={mockProfile} />
      </AuthContext.Provider>,
    );

    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Disponible')).toBeTruthy();
  });
});
