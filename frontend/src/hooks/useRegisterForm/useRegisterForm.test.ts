import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { useRegisterForm } from './useRegisterForm';

const navigateMock = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

const registerMock = vi.fn();
vi.mock('../../contexts/useAuth', () => ({
  useAuth: () => ({ register: registerMock }),
}));

// Mock both services to avoid real network calls
vi.mock('../../services/speciality/speciality.service');
vi.mock('../../services/image/image.service');

import * as specialityService from '../../services/speciality/speciality.service';
import * as imageService from '../../services/image/image.service';

const mockSpecialities = [{ id: 1, name: 'tacticien' }];
const mockAvatars = [{ id: 1, url: '/images/avatar01.png' }];

describe('useRegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Provide default mock data for every test
    vi.mocked(specialityService.getAll).mockResolvedValue(mockSpecialities);
    vi.mocked(imageService.getAll).mockResolvedValue(mockAvatars);
  });

  test('fetches specialities and avatars on mount', async () => {
    const { result } = renderHook(() => useRegisterForm());

    await waitFor(() => {
      expect(result.current.specialities).toEqual(mockSpecialities);
      expect(result.current.avatars).toEqual(mockAvatars);
    });
  });

  test('sets an error if fetching specialities or avatars fails', async () => {
    vi.mocked(specialityService.getAll).mockRejectedValueOnce(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useRegisterForm());

    await waitFor(() => {
      expect(result.current.error).toBe(
        'Impossible de charger les spécialités et les avatars.',
      );
    });
  });

  test('sets an error and does not call register if any field is missing', async () => {
    const { result } = renderHook(() => useRegisterForm());

    // Only fill email
    act(() => result.current.setEmail('test@test.com'));

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(
      'Veuillez remplir tous les champs et choisir un avatar.',
    );
    expect(registerMock).not.toHaveBeenCalled();
  });

  test('calls register with correct data and navigates to /login on success', async () => {
    registerMock.mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useRegisterForm());

    // Fill all fields
    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
      result.current.setTag('Test');
      result.current.setSpecialityId(1);
      result.current.setImageId(1);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(registerMock).toHaveBeenCalledWith({
      email: 'test@mail.com',
      password: 'test',
      tag: 'Test',
      imageId: 1,
      specialityId: 1,
    });
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'));
  });

  test('sets backend error message on register failure', async () => {
    registerMock.mockRejectedValueOnce(
      new Error('Cet email est déjà utilisé par un autre joueur.'),
    );
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
      result.current.setTag('Test');
      result.current.setSpecialityId(1);
      result.current.setImageId(1);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe(
      'Cet email est déjà utilisé par un autre joueur.',
    );
  });

  test('sets a generic error for non-standard errors', async () => {
    registerMock.mockRejectedValueOnce('not an Error instance');
    const { result } = renderHook(() => useRegisterForm());

    act(() => {
      result.current.setEmail('test@mail.com');
      result.current.setPassword('test');
      result.current.setTag('Test');
      result.current.setSpecialityId(1);
      result.current.setImageId(1);
    });

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: vi.fn(),
      } as unknown as React.FormEvent);
    });

    expect(result.current.error).toBe("Une erreur inattendue s'est produite.");
  });
});
