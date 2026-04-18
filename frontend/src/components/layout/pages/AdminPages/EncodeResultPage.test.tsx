import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ResultEncodingPage from './EncodeResultPage';
import { useAuth } from '../../../../contexts/useAuth';
import * as encodeResultService from '../../../../services/match/encode-result';
import * as matchService from '../../../../services/match/match-service';
import type { MatchResponseDto } from '../../../../types/match.types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../../contexts/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../../services/match/encode-result', () => ({
  encodeResult: vi.fn(),
}));

vi.mock('../../../../services/match/match-service', () => ({
  getMatchesByTournament: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ tournamentId: '1' }),
  useLocation: () => ({ state: { tournamentName: 'Tournoi Test' } }),
}));

type AuthContextType = ReturnType<typeof useAuth>;

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockAuth: AuthContextType = {
  user: {
    id: 1,
    email: 'admin@test.com',
    tag: 'admin',
    role: 'ADMIN',
    token: 'fake-token',
  },
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  bannedError: null,
};

const mockMatchResponseDto: MatchResponseDto = {
  id: 1,
  roundNumber: 1,
  teamA: 'Nom équipe 1',
  teamB: 'Nom équipe 2',
  scoreA: 3,
  scoreB: 1,
  state: 'PLAYED',
  resultStatus: 'PENDING',
  winner: 'Nom équipe 1',
};

const mockMatches: MatchResponseDto[] = [
  {
    id: 1,
    roundNumber: 1,
    teamA: 'Nom équipe 1',
    teamB: 'Nom équipe 2',
    scoreA: null,
    scoreB: null,
    state: 'SCHEDULED',
    resultStatus: 'NOT_ENTERED',
    winner: null,
  },
  {
    id: 2,
    roundNumber: 1,
    teamA: 'Eagles',
    teamB: 'Tigers',
    scoreA: null,
    scoreB: null,
    state: 'SCHEDULED',
    resultStatus: 'NOT_ENTERED',
    winner: null,
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ResultEncodingPage', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue(mockAuth);
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    vi.clearAllMocks();
  });

  // — Affichage initial ——————————————————————————————————————————————————————

  test('affiche le titre de la page', async () => {
    render(<ResultEncodingPage />);
    expect(screen.getByText('Encodage des résultats')).toBeTruthy();
  });

  test('affiche le nom du tournoi', async () => {
    render(<ResultEncodingPage />);
    expect(screen.getByDisplayValue('Tournoi Test')).toBeTruthy();
  });

  test('affiche la liste des matchs après chargement', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    render(<ResultEncodingPage />);
    await waitFor(() => {
      expect(screen.getByText(/Nom équipe 1/)).toBeTruthy();
      expect(screen.getByText(/Eagles/)).toBeTruthy();
    });
  });

  // — Sélection d'un match ———————————————————————————————————————————————————

  test('affiche le formulaire de score quand on clique sur Encoder résultat', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);

    expect(screen.getByText('Nom équipe 1 vs Nom équipe 2')).toBeTruthy();
  });

  test('cache le formulaire quand on clique sur Annuler', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);
    fireEvent.click(screen.getByText('Annuler'));

    expect(screen.queryByText('Nom équipe 1 vs Nom équipe 2')).toBeNull();
  });

  // — Validation du formulaire ———————————————————————————————————————————————

  test('affiche une erreur si les scores ne sont pas remplis', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);
    fireEvent.click(screen.getByText('Valider'));

    expect(screen.getByText('Veuillez entrer les deux scores.')).toBeTruthy();
  });

  test('appelle encodeResult avec les bons paramètres', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    vi.mocked(encodeResultService.encodeResult).mockResolvedValue(
      mockMatchResponseDto,
    );

    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);

    const inputs = screen.getAllByPlaceholderText('Score');
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Valider'));

    await waitFor(() => {
      expect(encodeResultService.encodeResult).toHaveBeenCalledWith(
        1,
        3,
        1,
        'fake-token',
      );
    });
  });

  test('affiche le message de succès après encodage', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    vi.mocked(encodeResultService.encodeResult).mockResolvedValue(
      mockMatchResponseDto,
    );

    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);

    const inputs = screen.getAllByPlaceholderText('Score');
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Valider'));

    await waitFor(() => {
      expect(screen.getByText('Résultat enregistré : 3 - 1')).toBeTruthy();
    });
  });

  // — Gestion des erreurs du service —————————————————————————————————————————

  test('affiche une erreur si encodeResult échoue', async () => {
    vi.mocked(matchService.getMatchesByTournament).mockResolvedValue(
      mockMatches,
    );
    vi.mocked(encodeResultService.encodeResult).mockRejectedValue(
      new Error('Erreur serveur'),
    );

    render(<ResultEncodingPage />);
    await waitFor(() => screen.getAllByText('Encoder résultat'));

    fireEvent.click(screen.getAllByText('Encoder résultat')[0]);

    const inputs = screen.getAllByPlaceholderText('Score');
    fireEvent.change(inputs[0], { target: { value: '3' } });
    fireEvent.change(inputs[1], { target: { value: '1' } });
    fireEvent.click(screen.getByText('Valider'));

    await waitFor(() => {
      expect(
        screen.getByText("Erreur lors de l'enregistrement du score."),
      ).toBeTruthy();
    });
  });
});
