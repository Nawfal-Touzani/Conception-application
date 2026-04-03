import { render, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SpecialityMenu } from './SpecialityMenu.utils';
import * as specialityService from '../../services/speciality/speciality.service';

const specialityMenuUIMock = vi.fn();

vi.mock('../../services/speciality/speciality.service');

vi.mock('../../components/layout/Speciality/SpecialityMenu', () => ({
  SpecialityMenuUI: (props: unknown) => {
    specialityMenuUIMock(props);
    return <div data-testid="speciality-menu-ui" />;
  },
}));

describe('SpecialityMenu', () => {
  const mockSpecs = [
    { id: 1, name: 'Architect' },
    { id: 2, name: 'Gardien' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(specialityService.getAll).mockResolvedValue(mockSpecs);
  });

  test('charge les spécialités et transmet les bonnes props au composant UI', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <SpecialityMenu currentSpeciality="Architect" onUpdate={mockUpdate} />,
    );

    await waitFor(() => expect(specialityService.getAll).toHaveBeenCalled());

    await waitFor(() => {
      expect(specialityMenuUIMock).toHaveBeenCalledWith(
        expect.objectContaining({
          specialities: mockSpecs,
          selectedId: 1,
          onChange: expect.any(Function),
        }),
      );
    });
  });

  test('appelle onUpdate avec le nom correspondant quand onChange est déclenché', async () => {
    const mockUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <SpecialityMenu currentSpeciality="Architect" onUpdate={mockUpdate} />,
    );

    await waitFor(() => expect(specialityMenuUIMock).toHaveBeenCalled());

    const lastCall =
      specialityMenuUIMock.mock.calls[
        specialityMenuUIMock.mock.calls.length - 1
      ][0];

    await lastCall.onChange(2);

    expect(mockUpdate).toHaveBeenCalledWith('Gardien');
  });

  test('log une erreur dans la console si le service échoue', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(specialityService.getAll).mockRejectedValue(
      new Error('API Failure'),
    );

    render(<SpecialityMenu currentSpeciality="any" onUpdate={vi.fn()} />);

    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });
});
