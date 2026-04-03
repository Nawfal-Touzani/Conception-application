import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useUnavailability } from './useUnavailability';
import * as memberService from '../../services/member/member.service';
import * as useAuthModule from '../../contexts/useAuth';

vi.mock('../../services/member/member.service');
vi.mock('../../contexts/useAuth');

describe('useUnavailability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { token: 'fake-token' },
    } as ReturnType<typeof useAuthModule.useAuth>);
  });

  test('should call addUnavailability with correct args on valid input', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(true);
    const { result } = renderHook(() => useUnavailability());

    act(() => {
      result.current.setStartDate('2026-06-01');
      result.current.setEndDate('2026-06-10');
    });
    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(memberService.addUnavailability).toHaveBeenCalledWith(
      'fake-token',
      '2026-06-01',
      '2026-06-10',
    );
  });

  test('should set error when service returns false', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(false);
    const { result } = renderHook(() => useUnavailability());

    act(() => {
      result.current.setStartDate('2026-06-01');
      result.current.setEndDate('2026-06-10');
    });
    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(result.current.error).toBe('Erreur : Dates invalides');
  });

  test('should set success, reset dates, then clear success after 3s', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(true);
    vi.useFakeTimers();
    const { result } = renderHook(() => useUnavailability());

    act(() => {
      result.current.setStartDate('2026-06-01');
      result.current.setEndDate('2026-06-02');
    });
    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(result.current.success).toBe(true);
    expect(result.current.dates).toEqual({ startDate: '', endDate: '' });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.success).toBe(false);
  });

  test('should fetch and store unavailabilities on handleShowList', async () => {
    const mockData: memberService.UnavailabilityDto[] = [
      { startDate: '2026-06-01', endDate: '2026-06-10' },
    ];
    vi.mocked(memberService.getMyUnavailabilities).mockResolvedValue(mockData);
    const { result } = renderHook(() => useUnavailability());

    await act(async () => {
      await result.current.handleShowList();
    });

    expect(result.current.openModal).toBe(true);
    expect(result.current.loadingList).toBe(false);
    expect(result.current.unavailabilities).toEqual(mockData);
  });

  test('should close modal on handleCloseModal', () => {
    const { result } = renderHook(() => useUnavailability());

    act(() => {
      result.current.handleCloseModal();
    });

    expect(result.current.openModal).toBe(false);
  });

  test('should not call service when token is missing', async () => {
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
    } as ReturnType<typeof useAuthModule.useAuth>);
    const { result } = renderHook(() => useUnavailability());

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(memberService.addUnavailability).not.toHaveBeenCalled();
  });
});
