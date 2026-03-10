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
    throw new Error('Error when registering (email might already be in use)');
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
    throw new Error('Email or password incorrect');
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
    throw new Error('Invalid or expired token');
  }

  return response.json();
};
