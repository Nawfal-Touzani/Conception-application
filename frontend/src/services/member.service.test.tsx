import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as memberService from './memberService';

describe('memberService', () => {
  const token = 'fake-token';
  const BASE_URL = 'http://localhost:3000';

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return the profile on success', async () => {
      const mockProfile = { id: 1, tag: 'Player1' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProfile,
      } as Response);

      const result = await memberService.getMyProfile(token);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/members/me`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      expect(result).toEqual(mockProfile);
    });

    it('should throw an error if the response is not ok', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: false } as Response);

      await expect(memberService.getMyProfile(token)).rejects.toThrow(
        'Failed to fecth profile',
      );
    });
  });

  describe('updateMyProfile', () => {
    it('should send a PATCH request to /members/me', async () => {
      const updateData = { speciality: 'Gardien' };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...updateData }),
      } as Response);

      await memberService.updateMyProfile(token, updateData);

      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}/members/me`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        }),
      );
    });
  });

  describe('addUnavailability', () => {
    it('should return true if addition is successful', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);
      const result = await memberService.addUnavailability(
        token,
        '2026-01-01',
        '2026-01-05',
      );
      expect(result).toBe(true);
    });

    it('should throw an error if the API returns an error', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Dates invalides' }),
      } as Response);

      await expect(
        memberService.addUnavailability(token, '', ''),
      ).rejects.toThrow('Dates invalides');
    });

    it('should propagate the error in case of a network crash', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        memberService.addUnavailability(token, 'a', 'b'),
      ).rejects.toThrow('Network error');
    });
  });
});
