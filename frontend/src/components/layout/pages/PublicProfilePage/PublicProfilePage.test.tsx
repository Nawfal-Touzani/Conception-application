/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PublicProfilePage from './PublicProfilePage';
import * as memberService from '../../../../services/member/member.service';

vi.mock('../../../../services/member/member.service', () => ({
  getPublicMemberById: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockMember = {
  id: 1,
  tag: 'Lynx',
  profileImage: '/images/avatar1.png',
  speciality: 'tacticien',
  teamName: 'TEAM_ALPHA',
  profileCreationDate: '2025-11-12T10:00:00Z',
};

const renderComponent = (id = '1') => {
  render(
    <MemoryRouter initialEntries={[`/profile/${id}`]}>
      <Routes>
        <Route path="/profile/:id" element={<PublicProfilePage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('PublicProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays member information', async () => {
    (memberService.getPublicMemberById as any).mockResolvedValue(mockMember);

    renderComponent();

    expect(await screen.findByText('Lynx')).toBeTruthy();
    expect(screen.getByText('Tacticien')).toBeTruthy();
    expect(screen.getByText('TEAM_ALPHA')).toBeTruthy();
    expect(screen.getByText(/12 novembre 2025/i)).toBeTruthy();
    const avatar = screen.getByRole('img');
    expect(avatar.getAttribute('src')).toContain(
      'http://localhost:3000/images/avatar1.png',
    );
  });

  test('displays "/" if the member does not have team', async () => {
    (memberService.getPublicMemberById as any).mockResolvedValue({
      ...mockMember,
      teamName: null,
    });

    renderComponent();

    expect(await screen.findByText('/')).toBeTruthy();
  });

  test('Redirect to homepage if member does not exist', async () => {
    (memberService.getPublicMemberById as any).mockRejectedValue(
      new Error('Not Found'),
    );

    renderComponent('999');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('The back button calls navigate', async () => {
    (memberService.getPublicMemberById as any).mockResolvedValue(mockMember);

    renderComponent();

    const backButton = await screen.findByText('←');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('returns null during initial load', () => {
    (memberService.getPublicMemberById as any).mockReturnValue(
      new Promise(() => {}),
    );

    const { container } = render(
      <MemoryRouter initialEntries={['/profile/1']}>
        <Routes>
          <Route path="/profile/:id" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(container.firstChild).toBeNull();
  });
});
