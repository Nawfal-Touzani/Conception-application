import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './RegisterPage';
import { AuthContext } from '../../../contexts/AuthContext';
import * as specialityService from '../../../services/speciality.service';
import * as imageService from '../../../services/image.service';

// Mocking the router & API calls (isolations)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: vi.fn() };
});
vi.mock('../../services/speciality.service');
vi.mock('../../services/image.service');

describe('RegisterPage', () => {
  const registerMock = vi.fn();
  const navigateMock = vi.fn();

  const mockContextValue = {
    user: null,
    login: vi.fn(),
    register: registerMock,
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    // Mock backend data for specialities and images
    vi.mocked(specialityService.getAll).mockResolvedValue([
      { id: 1, name: 'tacticien' },
    ]);
    vi.mocked(imageService.getAll).mockResolvedValue([
      { id: 1, url: '/images/avatar01.png' },
    ]);
  });

  test('Should return an adapted error if labels are empty', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(
        'Veuillez remplir tous les champs et choisir un avatar.',
      ),
    ).toBeTruthy();
    expect(registerMock).not.toHaveBeenCalled();
  });

  test('Should redirect to /login in case of register success', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Wait for the mocked API calls to resolve and the component to update
    await waitFor(() => {
      expect(specialityService.getAll).toHaveBeenCalled();
    });

    // Inputs
    fireEvent.change(screen.getByLabelText(/adresse email/i), {
      target: { value: 'vitest@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'vitest' },
    });
    fireEvent.change(screen.getByLabelText(/tag en jeu/i), {
      target: { value: 'Vitest' },
    });

    // Special case selection because of MUI
    const specialitySelect = screen.getByRole('combobox', {
      name: /spécialité/i,
    });
    fireEvent.mouseDown(specialitySelect); // Opening the menu
    const specialityOption = await screen.findByRole('option', {
      name: 'Tacticien',
    });
    fireEvent.click(specialityOption); // Speciality election

    // Avatar
    const avatarImage = await screen.findByAltText('Avatar 1'); // Alt
    fireEvent.click(avatarImage);

    // Button
    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Network json verifications
    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'vitest@mail.com',
        password: 'vitest',
        tag: 'Vitest',
        specialityId: 1,
        imageId: 1,
      });
    });

    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  test('Should throw error in case of the backend is not sending correctly the specialities/avatars ', async () => {
    // Mock useEffect error
    vi.mocked(specialityService.getAll).mockRejectedValueOnce(
      new Error('Imaginary Error'),
    );

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    // Frontend error handling verification
    expect(
      await screen.findByText(
        'Impossible de charger les spécialités et les avatars.',
      ),
    ).toBeTruthy();
  });

  test('Backend error', async () => {
    // Mock backend error
    registerMock.mockRejectedValueOnce(new Error('Email already taken'));

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(specialityService.getAll).toHaveBeenCalled();
    });

    // Inputs
    fireEvent.change(screen.getByLabelText(/adresse email/i), {
      target: { value: 'vitest@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'vitest' },
    });
    fireEvent.change(screen.getByLabelText(/tag en jeu/i), {
      target: { value: 'Vitest' },
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /spécialité/i }));
    fireEvent.click(await screen.findByRole('option', { name: 'Tacticien' }));
    fireEvent.click(await screen.findByAltText('Avatar 1'));

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Backend error verification
    expect(await screen.findByText('Email already taken')).toBeTruthy();
  });

  test('Should return frontend personalised in case of a non standard error', async () => {
    // Mock special error, not an instance of Error
    registerMock.mockRejectedValueOnce('Erreur inconnue');

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <RegisterPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(specialityService.getAll).toHaveBeenCalled();
    });

    // Remplissage complet
    fireEvent.change(screen.getByLabelText(/adresse email/i), {
      target: { value: 'vitest@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'vitest' },
    });
    fireEvent.change(screen.getByLabelText(/tag en jeu/i), {
      target: { value: 'Vitest' },
    });

    fireEvent.mouseDown(screen.getByRole('combobox', { name: /spécialité/i }));
    fireEvent.click(await screen.findByRole('option', { name: 'Tacticien' }));
    fireEvent.click(await screen.findByAltText('Avatar 1'));

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Expected message from the frontend
    expect(
      await screen.findByText("Une erreur inattendue s'est produite."),
    ).toBeTruthy();
  });
});
