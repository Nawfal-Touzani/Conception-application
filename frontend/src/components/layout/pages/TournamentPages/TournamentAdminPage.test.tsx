import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import TournamentAdminPage from './TournamentAdminPage';
import { AuthContext } from '../../../../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../../services/tournament/tournament.service', () => ({
  updateTournament: vi.fn(),
  publishTournament: vi.fn(),
}));

import * as tournamentService from '../../../../services/tournament/tournament.service';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAdmin = {
  id: 1,
  email: 'admin@vinci.be',
  tag: 'Admin',
  role: 'ADMIN',
  token: 'fake-token',
};

const mockContext = {
  user: mockAdmin,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const baseTournament = {
  id: 1,
  name: 'Tournoi Test',
  description: 'Description test',
  startDate: '2026-05-01',
  endDate: '2026-05-10',
  registrationDeadline: '2026-04-25',
  maxParticipants: 8,
  currentParticipants: 2,
  organizerTag: 'Admin',
  isPublic: false,
  status: 'PREPARATION' as 'PREPARATION' | 'IN_PROGRESS',
};

const onBack = vi.fn();
const onUpdated = vi.fn();
const onNavigateToPlanning = vi.fn();

const renderComponent = (tournament = baseTournament) =>
  render(
    <MemoryRouter>
      <AuthContext.Provider value={mockContext}>
        <TournamentAdminPage
          tournament={tournament}
          onBack={onBack}
          onUpdated={onUpdated}
          onNavigateToPlanning={onNavigateToPlanning}
          onNavigateToEncodeResult={vi.fn()}
        />
      </AuthContext.Provider>
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('TournamentAdminPage', () => {
  // ── Affichage ──

  test('affiche le titre "Gestion du tournoi"', () => {
    renderComponent();
    expect(screen.getByText('Gestion du tournoi')).toBeTruthy();
  });

  test('affiche le badge "En préparation" pour PREPARATION + isPublic false', () => {
    renderComponent();
    expect(screen.getByText('En préparation')).toBeTruthy();
  });

  test('affiche le badge "Inscriptions ouvertes" pour PREPARATION + isPublic true', () => {
    renderComponent({ ...baseTournament, isPublic: true });
    expect(screen.getByText('Inscriptions ouvertes')).toBeTruthy();
  });

  test('affiche le badge "En cours" pour IN_PROGRESS', () => {
    renderComponent({
      ...baseTournament,
      status: 'IN_PROGRESS',
      isPublic: true,
    });
    expect(screen.getByText('En cours')).toBeTruthy();
  });

  test('affiche les champs pré-remplis avec les valeurs du tournoi', () => {
    renderComponent();
    expect(screen.getByDisplayValue('Tournoi Test')).toBeTruthy();
    expect(screen.getByDisplayValue('Description test')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-05-01')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-05-10')).toBeTruthy();
    expect(screen.getByDisplayValue('2026-04-25')).toBeTruthy();
  });

  test('affiche le bouton "Confirmer les modifications"', () => {
    renderComponent();
    expect(screen.getByText('Confirmer les modifications')).toBeTruthy();
  });

  // ── Bouton Rendre public ──

  test('affiche le bouton "Rendre public" si PREPARATION + isPublic false', () => {
    renderComponent();
    expect(screen.getByText('Rendre public')).toBeTruthy();
  });

  test('n\'affiche pas le bouton "Rendre public" si déjà public', () => {
    renderComponent({ ...baseTournament, isPublic: true });
    expect(screen.queryByText('Rendre public')).toBeFalsy();
  });

  test('affiche "Déjà public" si PREPARATION + isPublic true', () => {
    renderComponent({ ...baseTournament, isPublic: true });
    expect(screen.getByText('Déjà public')).toBeTruthy();
  });

  test('n\'affiche pas le bouton "Rendre public" si IN_PROGRESS', () => {
    renderComponent({
      ...baseTournament,
      status: 'IN_PROGRESS',
      isPublic: true,
    });
    expect(screen.queryByText('Rendre public')).toBeFalsy();
  });

  // ── handleUpdate ──

  test('appelle updateTournament et affiche le succès en cliquant sur Confirmer', async () => {
    (
      tournamentService.updateTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      ...baseTournament,
      name: 'Tournoi Modifié',
    });
    renderComponent();
    fireEvent.click(screen.getByText('Confirmer les modifications'));
    await waitFor(() => {
      expect(tournamentService.updateTournament).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Tournoi mis à jour avec succès !')).toBeTruthy();
    });
  });

  test('appelle onUpdated avec le tournoi mis à jour après confirmation', async () => {
    const updated = { ...baseTournament, name: 'Tournoi Modifié' };
    (
      tournamentService.updateTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue(updated);
    renderComponent();
    fireEvent.click(screen.getByText('Confirmer les modifications'));
    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalledTimes(1);
    });
  });

  test("affiche un message d'erreur si updateTournament échoue", async () => {
    (
      tournamentService.updateTournament as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Erreur serveur'));
    renderComponent();
    fireEvent.click(screen.getByText('Confirmer les modifications'));
    await waitFor(() => {
      expect(screen.getByText('Erreur serveur')).toBeTruthy();
    });
  });

  // ── handlePublish ──

  test('appelle publishTournament et affiche le succès en cliquant sur Rendre public', async () => {
    (
      tournamentService.publishTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      ...baseTournament,
      isPublic: true,
    });
    renderComponent();
    fireEvent.click(screen.getByText('Rendre public'));
    await waitFor(() => {
      expect(tournamentService.publishTournament).toHaveBeenCalledWith(
        baseTournament.id,
        'fake-token',
      );
      expect(screen.getByText('Tournoi rendu public !')).toBeTruthy();
    });
  });

  test('appelle onUpdated avec isPublic true après publication', async () => {
    (
      tournamentService.publishTournament as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      ...baseTournament,
      isPublic: true,
    });
    renderComponent();
    fireEvent.click(screen.getByText('Rendre public'));
    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ isPublic: true }),
      );
    });
  });

  test("affiche un message d'erreur si publishTournament échoue", async () => {
    (
      tournamentService.publishTournament as ReturnType<typeof vi.fn>
    ).mockRejectedValue(new Error('Publication impossible'));
    renderComponent();
    fireEvent.click(screen.getByText('Rendre public'));
    await waitFor(() => {
      expect(screen.getByText('Publication impossible')).toBeTruthy();
    });
  });
});
