import {
  AuthenticatedMember,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';

const API_URL = 'http://localhost:3000/auths';

// Send a registration request to the backend.
// Throws an error if the registration fails (e.g., email already in use).
// Returns nothing on success. The user will then be redirected to the login page.
export const register = async (
  credentials: RegisterCredentials,
): Promise<void> => {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // 400 Bad Request (@Valid) email format
    if (response.status === 400) {
      throw new Error(
        "Format des données invalide (Vérifiez que l'email est correct).",
      );
    }
    // 409 Conflict (email already in use)
    if (response.status === 409) {
      throw new Error('Cet email est déjà utilisé par un autre joueur.');
    }
    // Base error message for other cases
    throw new Error("Une erreur est survenue lors de l'inscription.");
  }
};

// Send a login request to the backend.
// Returns the user information and the JWT token.
export const login = async (
  credentials: LoginCredentials,
): Promise<AuthenticatedMember> => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // 400 Bad Request (@Valid) email format
    if (response.status === 400) {
      throw new Error("Le format de l'email est invalide.");
    }
    // 401 Unauthorized email or password incorrect
    if (response.status === 401) {
      throw new Error('Email ou mot de passe incorrect.');
    }
    // Base error message for other cases
    throw new Error('Une erreur est survenue lors de la connexion.');
  }

  return response.json();
};

// Take user data based on their current token (Auto-login).
export const getMe = async (token: string): Promise<AuthenticatedMember> => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Token is sent in the Authorization header as a Bearer token
    },
  });

  if (!response.ok) {
    throw new Error('Jeton invalide ou expiré.');
  }

  return response.json();
};
