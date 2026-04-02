import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMembersManagement } from './useMembersManagement';
import { MemberDto } from '../../types/admin.types';

const mockMembers: MemberDto[] = [
  {
    id: 1,
    tag: 'Vinci',
    isBan: false,
    speciality: 'Architecte',
    isAvailable: true,
    profileImage: '/images/avatar3.png',
    email: 'vinci@vinci.be',
    teamName: null,
    isAdmin: false,
    admin: false,
  },
  {
    id: 2,
    tag: 'Vincinho',
    isBan: true,
    speciality: 'Gardien',
    isAvailable: false,
    profileImage: '/images/avatar8.png',
    email: 'vincinho@vinci.be',
    teamName: null,
    isAdmin: false,
    admin: false,
  },
  {
    id: 3,
    tag: 'Admin',
    isBan: false,
    speciality: 'Catalyseur',
    isAvailable: true,
    profileImage: '/images/avatar5.png',
    email: 'admin@vinci.be',
    teamName: null,
    isAdmin: true,
    admin: true,
  },
];

describe('useMembersManagement', () => {
  const token = 'fake-token';
  const currentUserTag = 'Admin';

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('should fetch members and filter them correctly', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockMembers,
    });

    const { result } = renderHook(() =>
      useMembersManagement(token, currentUserTag),
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.activeMembers).toHaveLength(1);
    expect(result.current.activeMembers[0].tag).toBe('Vinci');

    expect(result.current.bannedMembers).toHaveLength(1);
    expect(result.current.bannedMembers[0].tag).toBe('Vincinho');
  });

  it('should call fetchMembers again after a successful ban', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      })
      .mockResolvedValueOnce({
        ok: true,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      });

    const { result } = renderHook(() =>
      useMembersManagement(token, currentUserTag),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleBan(1, 'Spam');
    });

    expect(global.fetch).toHaveBeenCalledTimes(3);

    const banCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls.find(
      (call) =>
        call[1]?.body && JSON.parse(call[1].body as string).reason === 'Spam',
    );
    expect(banCall).toBeDefined();
  });

  it('should throw an error if banMember fails', async () => {
    (global.fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMembers,
      })
      .mockResolvedValueOnce({
        ok: false,
      });

    const { result } = renderHook(() =>
      useMembersManagement(token, currentUserTag),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => {
        await result.current.handleBan(1, 'Reason');
      }),
    ).rejects.toThrow('Erreur lors du bannissement');
  });
});
