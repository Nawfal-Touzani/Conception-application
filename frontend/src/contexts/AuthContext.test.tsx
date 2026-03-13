import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';
import * as authService from '../services/auth.service';

// Mock AuthService
vi.mock('../services/auth.service');

describe('AuthContext', () => {
  const mockUser = {
    id: 1,
    email: 'vitest@mail.com',
    tag: 'Vitest',
    role: 'MEMBER',
    token: 'toooken',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Clean all possible token storages
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Should return an error if useAuth is used outside of an AuthProvider', () => {
    // Mock console.error to avoid polluting the test output with the expected error message
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth needs to be used inside an AuthProvider',
    );
    consoleError.mockRestore();
  });

  test('autoLogin (useEffect) : retrive the user if token in localStorage is present', async () => {
    localStorage.setItem('jwt_token', 'old-jwt-token');
    vi.mocked(authService.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(authService.getMe).toHaveBeenCalledWith('old-jwt-token');
      expect(result.current.user).toEqual(mockUser);
      expect(localStorage.getItem('jwt_token')).toBe('toooken'); // New 24h token
    });
  });

  test('autoLogin (useEffect) : delete token if invalid (security)', async () => {
    localStorage.setItem('jwt_token', 'bad-jwt-token');
    sessionStorage.setItem('jwt_token', 'bad-jwt-token');
    vi.mocked(authService.getMe).mockRejectedValue(new Error('Invalid token'));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('jwt_token')).toBeNull();
      expect(sessionStorage.getItem('jwt_token')).toBeNull();
    });
  });

  test('Login + remeberMe=true => save token in localStorage', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login(
        { email: 'vitest@mail.com', password: 'vitest' },
        true,
      );
    });

    // Network json test
    expect(authService.login).toHaveBeenCalledWith({
      email: 'vitest@mail.com',
      password: 'vitest',
    });
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('jwt_token')).toBe('toooken');
    expect(sessionStorage.getItem('jwt_token')).toBeNull(); // rememberMe=true should not save in sessionStorage
  });

  test('Login + rememberMe=false => save token in sessionStorage', async () => {
    vi.mocked(authService.login).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login(
        { email: 'vitest@mail.com', password: 'vitest' },
        false,
      );
    });

    expect(result.current.user).toEqual(mockUser);
    expect(sessionStorage.getItem('jwt_token')).toBe('toooken');
    expect(localStorage.getItem('jwt_token')).toBeNull(); // rememberMe=false should not save in localStorage
  });

  test('Register should call the register service', async () => {
    vi.mocked(authService.register).mockResolvedValue();
    const mockCredentials = {
      email: 'vitest@mail.com',
      password: 'vitest',
      tag: 'Vitest',
      imageId: 1,
      specialityId: 1,
    };

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.register(mockCredentials);
    });

    expect(authService.register).toHaveBeenCalledWith(mockCredentials);
  });

  test('Logout should empty the user and the storages', async () => {
    localStorage.setItem('jwt_token', 'toooken');
    sessionStorage.setItem('jwt_token', 'toooken');

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Force one user in the state
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('jwt_token')).toBeNull();
    expect(sessionStorage.getItem('jwt_token')).toBeNull();
  });
});
