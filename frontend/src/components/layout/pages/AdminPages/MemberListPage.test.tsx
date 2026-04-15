import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MembersListPage from './MemberListPage';
import * as membersHook from '../../../../hooks/useMemberManagement/useMembersManagement';
import * as authContext from '../../../../contexts/useAuth';
import { AuthProvider } from '../../../../contexts/AuthProvider';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../../hooks/useMemberManagement/useMembersManagement');
vi.mock('../../../../contexts/useAuth');

describe('MembersListPage Logic', () => {
  const mockHandleBan = vi.fn();

  const mockActiveMembers = [
    { id: 1, tag: 'Drak', speciality: 'Architecte', isBan: false },
  ];

  const mockBannedMembers = [
    {
      id: 2,
      tag: 'Lynx',
      speciality: 'Gardien',
      isBan: true,
      banReason: 'Triche',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    (authContext.useAuth as Mock).mockReturnValue({
      user: { token: 'fake-token', tag: 'Admin' },
    });

    (membersHook.useMembersManagement as Mock).mockReturnValue({
      activeMembers: mockActiveMembers,
      bannedMembers: mockBannedMembers,
      loading: false,
      handleBan: mockHandleBan,
    });
  });

  it('should navigate back to admin dashboard when clicking return button', () => {
    render(
      <MemoryRouter>
        <MembersListPage />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText(/Retour/i));
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('should show loader when data is fetching', () => {
    (membersHook.useMembersManagement as Mock).mockReturnValue({
      activeMembers: [],
      bannedMembers: [],
      loading: true,
      handleBan: mockHandleBan,
    });

    render(
      <MemoryRouter>
        <MembersListPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('progressbar')).toBeTruthy();
  });

  it('should open BanModal when action is triggered on active member', async () => {
    render(
      <MemoryRouter>
        <MembersListPage />
      </MemoryRouter>,
    );

    const actionButton = screen
      .getByTestId('member-row-Drak')
      .querySelector('button');
    if (actionButton) fireEvent.click(actionButton);

    expect(screen.getByRole('dialog')).toBeTruthy();
  });

  it('should call handleBan and close modal on successful confirmation', async () => {
    mockHandleBan.mockResolvedValueOnce(true);

    render(
      <MemoryRouter>
        <MembersListPage />
      </MemoryRouter>,
    );

    const actionButton = screen
      .getByTestId('member-row-Drak')
      .querySelector('button');
    if (actionButton) fireEvent.click(actionButton);

    const reasonInput = screen.getByLabelText(/Raison/i);
    fireEvent.change(reasonInput, {
      target: { value: 'Comportement toxique' },
    });

    const confirmButton = screen.getByRole('button', { name: /Confirmer/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockHandleBan).toHaveBeenCalledWith(1, expect.any(String));
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('should open BanInfoModal when clicking on a banned member', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <MembersListPage />
        </AuthProvider>
      </MemoryRouter>,
    );

    const detailsButton = screen.getByRole('button', { name: /Détails/i });
    fireEvent.click(detailsButton);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeTruthy();

    const lynxElements = screen.getAllByText('Lynx');
    expect(lynxElements.length).toBeGreaterThan(1);

    expect(dialog.textContent).toContain('Lynx');
    expect(dialog.textContent).toContain('Triche');
  });
});
