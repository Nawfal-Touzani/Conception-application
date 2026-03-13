/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { UnavailabilitySection } from './UnavailabilitySection';
import * as memberService from '../../services/memberService';
import { AuthContext } from '../../contexts/AuthContext';

vi.mock('../../services/memberService');

describe('UnavailabilitySection', () => {
  const mockAuth = { user: { token: 'fake-token' } } as any;

  test('calls the memberService when input is valid', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(true);

    const { container } = render(
      <AuthContext.Provider value={mockAuth}>
        <UnavailabilitySection />
      </AuthContext.Provider>,
    );

    // On récupère tous les inputs de type date
    const dateInputs = container.querySelectorAll('input[type="date"]');
    const startDateInput = dateInputs[0];
    const endDateInput = dateInputs[1];

    // On simule la saisie
    fireEvent.change(startDateInput, { target: { value: '2026-06-01' } });
    fireEvent.change(endDateInput, { target: { value: '2026-06-10' } });

    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(memberService.addUnavailability).toHaveBeenCalledWith(
        'fake-token',
        '2026-06-01',
        '2026-06-10',
      );
    });
  });
});
