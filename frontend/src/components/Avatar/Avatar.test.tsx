import { render, screen, fireEvent } from '@testing-library/react';
import { AvatarModal } from './Avatar';
import * as imageService from '../../services/image/image.service';
import { describe, expect, test, vi } from 'vitest';

vi.mock('../../services/image/image.service');

const mockImages = [
  { id: 1, url: '/img1.png' },
  { id: 2, url: '/img2.png' },
];

describe('AvatarModal', () => {
  test('displays image and allows selection', async () => {
    vi.mocked(imageService.getAll).mockResolvedValue(mockImages);
    const mockConfirm = vi.fn();

    render(
      <AvatarModal
        open={true}
        onClose={vi.fn()}
        onConfirm={mockConfirm}
        currentImage="/img1.png"
      />,
    );

    const img = await screen.findByAltText('Avatar 2');
    fireEvent.click(img);

    fireEvent.click(screen.getByText('Confirmer'));
    expect(mockConfirm).toHaveBeenCalledWith('http://localhost:3000/img2.png');
  });
});
