import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BanInfoModal } from './BanInfoModal';
import { MemberDto } from '../../../../../types/admin.types';

const mockMember: MemberDto = {
  id: 1,
  tag: 'Terminaor',
  speciality: 'Gardien',
  isBan: true,
  banDate: '2026-04-02',
  banReason: 'Cheating',
  isAvailable: false,
  profileImage: '/images/avatar3.png',
  email: 'termi@vinci.be',
  teamName: null,
  isAdmin: false,
  admin: false,
};

describe('BanInfoModal', () => {
  const onClose = vi.fn();

  it('should not render when open is false', () => {
    render(<BanInfoModal open={false} onClose={onClose} member={mockMember} />);
    expect(screen.queryByText('Détails du bannissement')).toBeNull();
  });

  it('should display member ban details correctly', () => {
    render(<BanInfoModal open={true} onClose={onClose} member={mockMember} />);

    expect(screen.getByText('Terminaor')).toBeTruthy();
    expect(screen.getByText('Cheating')).toBeTruthy();
    expect(screen.getByText('02/04/2026')).toBeTruthy();
  });

  it('should call onClose when close button is clicked', () => {
    render(<BanInfoModal open={true} onClose={onClose} member={mockMember} />);

    fireEvent.click(screen.getByRole('button', { name: /fermer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
