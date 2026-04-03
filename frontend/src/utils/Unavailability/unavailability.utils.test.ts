import { describe, test, expect } from 'vitest';
import { validateUnavailabilityDates } from './unavailability.utils';

describe('validateUnavailabilityDates', () => {
  test('should return error when both dates are missing', () => {
    expect(validateUnavailabilityDates({ startDate: '', endDate: '' })).toMatch(
      /Veuillez sélectionner/,
    );
  });

  test('should return error when end date is missing', () => {
    expect(
      validateUnavailabilityDates({ startDate: '2026-06-01', endDate: '' }),
    ).toMatch(/Veuillez sélectionner/);
  });

  test('should return error when start date is missing', () => {
    expect(
      validateUnavailabilityDates({ startDate: '', endDate: '2026-06-10' }),
    ).toMatch(/Veuillez sélectionner/);
  });

  test('should return error when start date is in the past', () => {
    expect(
      validateUnavailabilityDates({
        startDate: '2000-01-01',
        endDate: '2026-12-31',
      }),
    ).toMatch(/ne peut pas être dans le passé/);
  });

  test('should return error when end date is before start date', () => {
    expect(
      validateUnavailabilityDates({
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      }),
    ).toMatch(/doit être postérieure/);
  });

  test('should return null for valid dates', () => {
    expect(
      validateUnavailabilityDates({
        startDate: '2026-06-01',
        endDate: '2026-06-10',
      }),
    ).toBeNull();
  });

  test('should return null when start and end date are the same day', () => {
    expect(
      validateUnavailabilityDates({
        startDate: '2026-06-01',
        endDate: '2026-06-01',
      }),
    ).toBeNull();
  });
});
