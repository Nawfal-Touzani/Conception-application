import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as imageService from '../../services/image/image.service';
import { ProfileImage } from '../../types/image.types';
import { useAvatar } from './useAvatar';

vi.mock('../../services/image/image.service', () => ({
  getAll: vi.fn(),
}));

describe('useAvatar', () => {
  const mockImages: ProfileImage[] = [
    { id: 1, url: '/avatar1.png' },
    { id: 2, url: '/avatar2.png' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with current image and an empty images list', () => {
    const currentImage = 'http://localhost:3000/avatar_old.png';
    const { result } = renderHook(() => useAvatar(false, currentImage));

    expect(result.current.selectedImage).toBe(currentImage);
    expect(result.current.images).toEqual([]);
  });

  it('should fetch images when open passes to true', async () => {
    vi.mocked(imageService.getAll).mockResolvedValue(mockImages);

    const { result } = renderHook(() => useAvatar(true, ''));

    await waitFor(() => {
      expect(result.current.images).toEqual(mockImages);
    });

    expect(imageService.getAll).toHaveBeenCalledTimes(1);
  });

  it('should not fetch images if open is false', () => {
    renderHook(() => useAvatar(false, ''));
    expect(imageService.getAll).not.toHaveBeenCalled();
  });

  it('should allow updating the selected image', () => {
    const { result } = renderHook(() => useAvatar(false, 'old.png'));

    act(() => {
      result.current.setSelectedImage('new.png');
    });

    expect(result.current.selectedImage).toBe('new.png');
  });

  it('should log an error to the console if the service fails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(imageService.getAll).mockRejectedValue(new Error('API Error'));

    renderHook(() => useAvatar(true, ''));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erreur lors du chargement des avatars:',
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });
});
