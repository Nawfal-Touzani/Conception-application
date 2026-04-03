import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BanModal } from './BanModal';
import { MemberDto } from '../../../../../types/admin.types';

const mockMember: MemberDto = {
  id: 1,
  tag: 'Terminaor',
  speciality: 'Gardien',
  isBan: false,
  banDate: '',
  banReason: '',
  isAvailable: true,
  profileImage: '/images/avatar6.png',
  email: 'termi@vinci.be',
  teamName: null,
  isAdmin: false,
  admin: false,
};

describe('BanModal', () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display the target member tag', () => {
    render(
      <BanModal
        open={true}
        onClose={onClose}
        member={mockMember}
        onConfirm={onConfirm}
      />,
    );
    expect(screen.getByText('Terminaor')).toBeTruthy();
  });

  it('should show validation error if reason is empty', async () => {
    render(
      <BanModal
        open={true}
        onClose={onClose}
        member={mockMember}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText('Confirmer'));

    const errorMsg = await screen.findByText(
      'Veuillez indiquer une raison pour le bannissement.',
    );
    expect(errorMsg).toBeTruthy();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('should call onConfirm with the correct reason and close on success', async () => {
    onConfirm.mockResolvedValueOnce(undefined);
    render(
      <BanModal
        open={true}
        onClose={onClose}
        member={mockMember}
        onConfirm={onConfirm}
      />,
    );

    const input = screen.getByLabelText(/raison du bannissement/i);
    fireEvent.change(input, { target: { value: 'Cheating' } });
    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('Cheating');
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('should display error message when onConfirm fails', async () => {
    onConfirm.mockRejectedValueOnce(new Error('API Error'));
    render(
      <BanModal
        open={true}
        onClose={onClose}
        member={mockMember}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.change(screen.getByLabelText(/raison du bannissement/i), {
      target: { value: 'Spam' },
    });
    fireEvent.click(screen.getByText('Confirmer'));

    const errorMsg = await screen.findByText(
      'Erreur lors du bannissement du membre.',
    );
    expect(errorMsg).toBeTruthy();
  });

  it('should call onClose when cancel button is clicked', () => {
    render(
      <BanModal
        open={true}
        onClose={onClose}
        member={mockMember}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
