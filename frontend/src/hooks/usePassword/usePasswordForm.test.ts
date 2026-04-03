import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePasswordForm } from './usePasswordForm';
import * as memberService from '../../services/member/member.service';
import * as validator from '../../utils/Password/passwordValidator.utils';

vi.mock('../../services/member/member.service', () => ({
  changePassword: vi.fn(),
}));

vi.mock('../../utils/Password/passwordValidator.utils', () => ({
  validatePassword: vi.fn(),
}));

describe('usePasswordForm', () => {
  const mockToken = 'fake-token';
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('should initialize with empty values', () => {
    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    expect(result.current.passwordData).toEqual({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    expect(result.current.error).toBeNull();
    expect(result.current.success).toBe(false);
  });

  it('should update passwordData on change', () => {
    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    const event = {
      target: { name: 'newPassword', value: 'Password13!' },
    } as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleChange(event);
    });

    expect(result.current.passwordData.newPassword).toBe('Password13!');
  });

  it('should not call the service if validation fails', async () => {
    vi.mocked(validator.validatePassword).mockReturnValue('Validation error');

    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(validator.validatePassword).toHaveBeenCalled();
    expect(memberService.changePassword).not.toHaveBeenCalled();
    expect(result.current.error).toBe('Validation error');
  });

  it('should display an error if the old password is incorrect', async () => {
    vi.mocked(validator.validatePassword).mockReturnValue(null);
    vi.mocked(memberService.changePassword).mockResolvedValue(false);

    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe("L'ancien mot de passe est incorrect");
    expect(result.current.success).toBe(false);
  });

  it('should display an error if the old password is incorrect', async () => {
    vi.mocked(validator.validatePassword).mockReturnValue(null);
    vi.mocked(memberService.changePassword).mockResolvedValue(false);

    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe("L'ancien mot de passe est incorrect");
    expect(result.current.success).toBe(false);
  });

  it('should handle server communication errors (catch)', async () => {
    vi.mocked(validator.validatePassword).mockReturnValue(null);
    vi.mocked(memberService.changePassword).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() =>
      usePasswordForm(mockToken, mockOnClose),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.error).toBe(
      'Erreur de communication avec le serveur',
    );
  });
});
