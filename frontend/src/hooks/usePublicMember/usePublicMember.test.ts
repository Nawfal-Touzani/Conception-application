import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePublicMember } from './usePublicMember';
import * as memberService from '../../services/memberService';
import { MemoryRouter } from 'react-router-dom';
import { PublicMember } from '../../types/publicMember';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/memberService', () => ({
  getPublicMemberById: vi.fn(),
}));

describe('usePublicMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with loading: true and member: null', () => {
    vi.mocked(memberService.getPublicMemberById).mockReturnValue(
      new Promise(() => {}),
    );

    const { result } = renderHook(() => usePublicMember('1'), {
      wrapper: MemoryRouter,
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.member).toBe(null);
  });

  it('should fetch member successfully', async () => {
    const mockMember: PublicMember = {
      id: 1,
      tag: 'Vinci',
      speciality: 'Architecte',
      profileImage: '/images/avatar5.png',
      teamName: null,
      profileCreationDate: '2026-01-01',
    };

    vi.mocked(memberService.getPublicMemberById).mockResolvedValue(mockMember);

    const { result } = renderHook(() => usePublicMember('1'), {
      wrapper: MemoryRouter,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.member).toEqual(mockMember);
    expect(memberService.getPublicMemberById).toHaveBeenCalledWith('1');
  });

  it('should redirect to "/" on API error', async () => {
    vi.mocked(memberService.getPublicMemberById).mockRejectedValue(
      new Error('404'),
    );

    renderHook(() => usePublicMember('999'), { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should stop loading if no id is provided', async () => {
    const { result } = renderHook(() => usePublicMember(undefined), {
      wrapper: MemoryRouter,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.member).toBe(null);
    expect(memberService.getPublicMemberById).not.toHaveBeenCalled();
  });
});
