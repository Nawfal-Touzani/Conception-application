import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import LoginPage from './LoginPage';
import { AuthContext } from '../../contexts/AuthContext';

// Mocking the navigation hook from React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('LoginPage', () => {
  const loginMock = vi.fn();
  const navigateMock = vi.fn();

  // Create a fake context to simulate the global state
  const mockContextValue = {
    user: null,
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
  });

  test('Should return an adapted error if the email or the password is empty', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    // Verification
    expect(
      await screen.findByText('Veuillez remplir tous les champs.'),
    ).toBeTruthy();
    expect(loginMock).not.toHaveBeenCalled(); // Context should not be called if the form is invalid
  });

  test('Should redirect to / (Homepage) in case of login success', async () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    const emailInput = screen.getByLabelText(/adresse email/i);
    const passwordInput = screen.getByLabelText(/mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    // Inputs
    fireEvent.change(emailInput, { target: { value: 'vitest@mail.com' } });
    fireEvent.change(passwordInput, { target: { value: 'vitest' } });
    fireEvent.click(submitButton);

    // Network json call verification
    expect(loginMock).toHaveBeenCalledWith(
      { email: 'vitest@mail.com', password: 'vitest' },
      true, // rememberMe is true by default
    );

    // Redirection verification
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('Should show adapted error for incorrect login inputs', async () => {
    // Mock the backend rejection response
    loginMock.mockRejectedValueOnce(new Error('Email or password incorrect'));

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/adresse email/i), {
      target: { value: 'vitest@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'vitest' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Backend error showing
    expect(await screen.findByText('Email or password incorrect')).toBeTruthy();
  });

  test('Should return frontend personalised in case of a non standard error', async () => {
    // Mock special error
    loginMock.mockRejectedValueOnce(
      'Error: the site will explose in 3...2...1...',
    );

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContextValue}>
          <LoginPage />
        </AuthContext.Provider>
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/adresse email/i), {
      target: { value: 'vitest@mail.com' },
    });
    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: 'vitest' },
    });
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Expected message from the frontend
    expect(
      await screen.findByText("Une erreur inattendue s'est produite."),
    ).toBeTruthy();
  });
});
