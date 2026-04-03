import { describe, test, expect, vi, afterEach } from 'vitest';
import { getAll } from './speciality.service';

// Mocking the fetch with a given HTTP status and optional response body
// This avoids repeating the same boilerplate in every test case.
const mockFetch = (status: number, body?: object) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body ?? []),
  });
};

describe('speciality.service', () => {
  // Reset the mock after each test to avoid state leaking between tests
  afterEach(() => vi.resetAllMocks());

  describe('getAll()', () => {
    // Simulated list of specialities returned by the backend
    const mockSpecialities = [
      { id: 1, name: 'One Tap Machine' },
      { id: 2, name: 'Hacker' },
    ];

    test('calls GET /specialities with no extra headers or body', async () => {
      mockFetch(200, mockSpecialities);
      await getAll();
      // The backend endpoint is a GET without any auth required
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/specialities');
    });

    test('returns the full list of specialities on success', async () => {
      mockFetch(200, mockSpecialities);
      const result = await getAll();
      expect(result).toEqual(mockSpecialities);
    });

    test('returns an empty array when the backend has no specialities', async () => {
      mockFetch(200, []);
      const result = await getAll();
      expect(result).toEqual([]);
    });

    test('throws when the backend returns a 500 error', async () => {
      mockFetch(500);
      await expect(getAll()).rejects.toThrow(
        'Erreur lors du chargement des spécialités',
      );
    });

    test('throws when the backend returns a 404 (endpoint not found)', async () => {
      mockFetch(404);
      await expect(getAll()).rejects.toThrow(
        'Erreur lors du chargement des spécialités',
      );
    });
  });
});
