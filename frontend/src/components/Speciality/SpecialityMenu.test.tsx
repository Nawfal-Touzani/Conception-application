import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    vi.clearAllMocks();
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

  test('should load specialities and call onUpdate when a new one is selected', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <SpecialityMenu currentSpeciality="Architect" onUpdate={mockUpdate} />,
    );

    await waitFor(() => expect(specialityService.getAll).toHaveBeenCalled());

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    const option = await screen.findByText('Gardien');
    fireEvent.click(option);

    expect(mockUpdate).toHaveBeenCalledWith('Gardien');
  });

  test('should log an error to console if the service fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(specialityService.getAll).mockRejectedValue(
      new Error('API Failure'),
    );

    render(<SpecialityMenu currentSpeciality="any" onUpdate={vi.fn()} />);

    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });
});
