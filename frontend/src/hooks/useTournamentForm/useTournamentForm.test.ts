import { describe, test, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTournamentForm } from './useTournamentForm';
import * as validationUtils from '../../../utils/tournamentValidation';

describe('useTournamentForm', () => {
  test('initial state is empty', () => {
    const { result } = renderHook(() => useTournamentForm());

    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
    expect(result.current.registrationDeadline).toBe('');
    expect(result.current.maxParticipants).toBe('');
    expect(result.current.errors).toEqual([]);
    expect(result.current.success).toBeNull();
  });

  test('reset clears all fields', () => {
    const { result } = renderHook(() => useTournamentForm());

    act(() => {
      result.current.setName('Test');
      result.current.setDescription('Desc');
      result.current.setStartDate('2030-01-01');
      result.current.setEndDate('2030-01-02');
      result.current.setRegistrationDeadline('2029-12-30');
      result.current.setMaxParticipants(8);
      result.current.setErrors(['Erreur']);
      result.current.setSuccess('OK');

      result.current.reset();
    });

    expect(result.current.name).toBe('');
    expect(result.current.description).toBe('');
    expect(result.current.startDate).toBe('');
    expect(result.current.endDate).toBe('');
    expect(result.current.registrationDeadline).toBe('');
    expect(result.current.maxParticipants).toBe('');
    expect(result.current.errors).toEqual([]);
    expect(result.current.success).toBeNull();
  });

  test('validate sets errors and returns false when invalid', () => {
    const { result } = renderHook(() => useTournamentForm());

    // Mock validateTournament pour forcer une erreur
    vi.spyOn(validationUtils, 'validateTournament').mockReturnValue([
      'Erreur test',
    ]);

    let isValid: boolean;

    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors).toContain('Erreur test');
  });

  test('validate returns true when no errors', () => {
    const { result } = renderHook(() => useTournamentForm());

    vi.spyOn(validationUtils, 'validateTournament').mockReturnValue([]);

    let isValid: boolean;

    act(() => {
      isValid = result.current.validate();
    });

    expect(isValid!).toBe(true);
    expect(result.current.errors).toEqual([]);
  });
});
