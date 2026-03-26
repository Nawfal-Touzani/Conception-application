import { describe, test, expect, vi, afterEach } from 'vitest';
import { register, login, getMe } from './auth.service';

// Mocking the fetch with a given HTTP status and optional response body.
// This avoids repeating the same boilerplate in every test case.
const mockFetch = (status: number, body?: object) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body ?? {}),
  });
};

describe('auth.service', () => {
  // Reset the mock after each test to avoid state leaking between tests
  afterEach(() => vi.resetAllMocks());

  // register tests
  describe('register()', () => {
    const credentials = {
      email: 'test@mail.com',
      password: 'Valid1@Password',
      tag: 'Test',
      imageId: 1,
      specialityId: 1,
    };

    test('calls POST /auths/register with the correct method, headers and body', async () => {
      mockFetch(201);
      await register(credentials);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/auths/register',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }),
      );
    });

    test('returns nothing on success (201 Created)', async () => {
      mockFetch(201);
      const result = await register(credentials);
      // register() is a void function, so no data expected on success
      expect(result).toBeUndefined();
    });

    test('throws on 400 on invalid email format (rejected by @Valid on the backend)', async () => {
      mockFetch(400);
      await expect(register(credentials)).rejects.toThrow(
        // Backend error messsage
        "Format des données invalide (Vérifiez que l'email est correct).",
      );
    });

    test('throws on 409 when email already in use (backend returns CONFLICT)', async () => {
      mockFetch(409);
      await expect(register(credentials)).rejects.toThrow(
        // Backend error messsage
        'Cet email est déjà utilisé par un autre joueur.',
      );
    });

    test('throws a generic error for any other unexpected status code', async () => {
      mockFetch(500);
      await expect(register(credentials)).rejects.toThrow(
        // Backend error messsage
        "Une erreur est survenue lors de l'inscription.",
      );
    });
  });

  // login tests
  describe('login()', () => {
    const credentials = { email: 'test@test.com', password: 'Password1!' };
    // Simulated response matching the AuthenticatedMember DTO from the backend
    const mockAuthenticatedMember = {
      id: 1,
      email: 'test@mail.com',
      token: 'toooken',
    };

    test('calls POST /auths/login with the correct method, headers and body', async () => {
      mockFetch(200, mockAuthenticatedMember);
      await login(credentials);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/auths/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        }),
      );
    });

    test('returns the authenticated member (with JWT token) on success', async () => {
      mockFetch(200, mockAuthenticatedMember);
      const result = await login(credentials);
      expect(result).toEqual(mockAuthenticatedMember);
    });

    test('throws on 400 when invalid email format (rejected by @Valid on the backend)', async () => {
      mockFetch(400);
      await expect(login(credentials)).rejects.toThrow(
        "Le format de l'email est invalide.",
      );
    });

    test('throws on 401 when wrong email or password (matches backend message exactly)', async () => {
      mockFetch(401);
      await expect(login(credentials)).rejects.toThrow(
        // Backend error message, this exact string is hardcoded in AuthController.java
        'Email ou mot de passe incorrect.',
      );
    });

    test('throws a generic error for any other unexpected status code', async () => {
      mockFetch(500);
      await expect(login(credentials)).rejects.toThrow(
        'Une erreur est survenue lors de la connexion.',
      );
    });

    test('throws on 403 when account is banned', async () => {
      mockFetch(403);
      await expect(login(credentials)).rejects.toThrow(
        'Votre compte a été banni.',
      );
    });
  });

  // getMe tests
  describe('getMe()', () => {
    const token = 'kentooo';
    const mockAuthenticatedMember = {
      id: 1,
      email: 'test@mail.com',
      token: 'toooken',
    };

    test('calls GET /auths/me with the Bearer token in the Authorization header', async () => {
      mockFetch(200, mockAuthenticatedMember);
      await getMe(token);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/auths/me',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // The token is passed as a Bearer token, that means Spring Security validates it on the backend
            Authorization: `Bearer ${token}`,
          },
        }),
      );
    });

    test('returns a fresh authenticated member (new 24h token) on success', async () => {
      mockFetch(200, mockAuthenticatedMember);
      const result = await getMe(token);
      expect(result).toEqual(mockAuthenticatedMember);
    });

    test('throws when the token is expired or invalid (backend returns 401)', async () => {
      mockFetch(401);
      await expect(getMe(token)).rejects.toThrow('Jeton invalide ou expiré.');
    });

    test('throws when backend returns 403 for a banned user', async () => {
      mockFetch(403);
      await expect(getMe(token)).rejects.toThrow('Votre compte a été banni.');
    });
  });
});
