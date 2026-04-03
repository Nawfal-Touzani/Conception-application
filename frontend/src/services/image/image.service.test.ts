import { describe, test, expect, vi, afterEach } from 'vitest';
import { getAll } from './image.service';

// Mocking the fetch with a given HTTP status and optional response body
// This avoids repeating the same boilerplate in every test case.
const mockFetch = (status: number, body?: object) => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body ?? []),
  });
};

describe('image.service', () => {
  // Reset the mock after each test to avoid state leaking between tests
  afterEach(() => vi.resetAllMocks());

  describe('getAll()', () => {
    // Simulated list of profile images returned by the backend
    const mockImages = [
      { id: 1, url: 'http://example.com/avatar1.png' },
      { id: 2, url: 'http://example.com/avatar2.png' },
    ];

    test('calls GET /images with no extra headers or body', async () => {
      mockFetch(200, mockImages);
      await getAll();
      // The backend endpoint is a GET without any auth required
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/images');
    });

    test('returns the full list of profile images on success', async () => {
      mockFetch(200, mockImages);
      const result = await getAll();
      expect(result).toEqual(mockImages);
    });

    test('returns an empty array when the backend has no images', async () => {
      mockFetch(200, []);
      const result = await getAll();
      expect(result).toEqual([]);
    });

    test('throws when the backend returns a 500 error', async () => {
      mockFetch(500);
      await expect(getAll()).rejects.toThrow(
        'Erreur lors du chargement des avatars',
      );
    });

    test('throws when the backend returns a 404 (endpoint not found)', async () => {
      mockFetch(404);
      await expect(getAll()).rejects.toThrow(
        'Erreur lors du chargement des avatars',
      );
    });
  });
});
