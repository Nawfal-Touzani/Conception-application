/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { UnavailabilitySection } from './UnavailabilitySection';
import * as memberService from '../../services/memberService';
import { AuthContext } from '../../contexts/AuthContext';
import { act } from 'react';

vi.mock('../../services/memberService');

const mockAuth = {
  user: { token: 'fake-token' },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

describe('UnavailabilitySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  test('should call memberService when input is valid', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(true);

    const { container } = render(
      <AuthContext.Provider value={mockAuth as any}>
        <UnavailabilitySection />
      </AuthContext.Provider>,
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-06-01' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026-06-10' } });

    fireEvent.click(screen.getByText('Confirmer'));

    await waitFor(() => {
      expect(memberService.addUnavailability).toHaveBeenCalledWith(
        'fake-token',
        '2026-06-01',
        '2026-06-10',
      );
    });
  });

  test('should show validation errors for invalid date scenarios', async () => {
    const { container } = render(
      <AuthContext.Provider value={mockAuth as any}>
        <UnavailabilitySection />
      </AuthContext.Provider>,
    );

    const btn = screen.getByText('Confirmer');
    const inputs = container.querySelectorAll('input[type="date"]');

    fireEvent.click(btn);
    expect(
      await screen.findByText(/Veuillez sélectionner une date/),
    ).toBeTruthy();

    fireEvent.change(inputs[0], { target: { value: '2000-01-01' } });
    fireEvent.change(inputs[1], { target: { value: '2026-12-31' } });
    fireEvent.click(btn);
    expect(
      await screen.findByText(/ne peut pas être dans le passé/),
    ).toBeTruthy();

    fireEvent.change(inputs[0], { target: { value: '2026-12-31' } });
    fireEvent.change(inputs[1], { target: { value: '2026-01-01' } });
    fireEvent.click(btn);
    expect(await screen.findByText(/doit être postérieure/)).toBeTruthy();
  });

  test('should handle success and reset state after 3 seconds', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(true);
    vi.useFakeTimers();

    const { container } = render(
      <AuthContext.Provider value={mockAuth as any}>
        <UnavailabilitySection />
      </AuthContext.Provider>,
    );

    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2026-06-01' } });
    fireEvent.change(inputs[1], { target: { value: '2026-06-02' } });

    fireEvent.click(screen.getByText('Confirmer'));

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.queryByText(/enregistrée/)).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByText(/enregistrée/)).toBeNull();

    vi.useRealTimers();
  });

  test('should display error message when service returns false', async () => {
    vi.mocked(memberService.addUnavailability).mockResolvedValue(false);

    const { container } = render(
      <AuthContext.Provider value={mockAuth as any}>
        <UnavailabilitySection />
      </AuthContext.Provider>,
    );

    const inputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(inputs[0], { target: { value: '2026-06-01' } });
    fireEvent.change(inputs[1], { target: { value: '2026-06-10' } });

    fireEvent.click(screen.getByText('Confirmer'));

    expect(await screen.findByText('Erreur : Dates invalides')).not.toBeNull();
  });
});
