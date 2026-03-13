import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SpecialityMenu } from './SpecialityMenu';
import * as specialityService from '../../services/speciality.service';

vi.mock('../../services/speciality.service');

describe('SpecialityMenu', () => {
  const mockSpecs = [
    { id: 1, name: 'Architect' },
    { id: 2, name: 'Gardien' },
  ];

  beforeEach(() => {
    vi.mocked(specialityService.getAll).mockResolvedValue(mockSpecs);
  });

  test('shows the current speciality and available options', async () => {
    const mockUpdate = vi.fn();
    render(
      <SpecialityMenu currentSpeciality="Architect" onUpdate={mockUpdate} />,
    );

    const select = await screen.findByRole('combobox');
    fireEvent.mouseDown(select);

    const options = await screen.findAllByRole('option');

    expect(options.some((opt) => opt.textContent === 'Architect')).toBeTruthy();
    expect(options.some((opt) => opt.textContent === 'Gardien')).toBeTruthy();
  });
});
