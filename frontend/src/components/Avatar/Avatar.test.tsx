import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarModal } from './Avatar';
import * as imageService from '../../services/image/image.service';
import { describe, expect, test, vi, beforeEach } from 'vitest';

vi.mock('../../services/image/image.service');

const mockImages = [
  { id: 1, url: '/img1.png' },
  { id: 2, url: '/img2.png' },
];

describe('AvatarModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('displays images and allows selection', async () => {
    const getAllMock = vi.mocked(imageService.getAll);
    getAllMock.mockResolvedValue(mockImages);

    const mockConfirm = vi.fn();

    render(
      <AvatarModal
        open={true}
        onClose={vi.fn()}
        onConfirm={mockConfirm}
        currentImage="http://localhost:3000/img1.png"
      />,
    );

    const images = await screen.findAllByAltText(/avatar \d+/i);
    expect(images).toHaveLength(2);

    fireEvent.click(images[1]);

    const confirmButton = screen.getByText('Confirmer');
    fireEvent.click(confirmButton);

    expect(mockConfirm).toHaveBeenCalledWith('http://localhost:3000/img2.png');
  });
});
