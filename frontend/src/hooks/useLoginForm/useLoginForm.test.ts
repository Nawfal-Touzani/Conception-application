import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useLoginForm } from './useLoginForm';

// Mock the entire react-router-dom to control navigation
const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

// Mock the AuthContext to control the login function
const loginMock = vi.fn();
vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({ login: loginMock }),
}));

describe('useLoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('initializes with empty fields and no error', () => {
    const { result } = renderHook(() => useLoginForm());

    expect(result.current.email).toBe('');
    expect(result.current.password).toBe('');
    expect(result.current.rememberMe).toBe(true); // Default is true
    expect(result.current.error).toBeNull();
  });

  test('updates email and password when setters are called', () => {
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
    });

    expect(result.current.email).toBe('test@mail.com');
    expect(result.current.password).toBe('test');
  });

  test('sets an error and does not call login if fields are empty', async () => {
    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe('Veuillez remplir tous les champs.');
    expect(loginMock).not.toHaveBeenCalled();
  });

  test('calls login with correct credentials and navigates to / on success', async () => {
    loginMock.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(loginMock).toHaveBeenCalledWith(
      { email: 'test@mail.com', password: 'test' },
      true, // rememberMe default
    );
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/'));
  });

  test('sets backend error message on login failure', async () => {
    loginMock.mockRejectedValueOnce(
      new Error('Email ou mot de passe incorrect.'),
    );
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe('Email ou mot de passe incorrect.');
    // Password should be cleared after a failed attempt
    expect(result.current.password).toBe('');
  });

  test('sets a generic error for non-standard errors', async () => {
    loginMock.mockRejectedValueOnce('not an Error instance');
    const { result } = renderHook(() => useLoginForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Une erreur inattendue s'est produite.");
  });
});
