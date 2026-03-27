import { Tournament, TournamentDetails } from '../../types/tournament.types';

export interface TournamentFilters {
  tournamentName?: string;
  teamName?: string;
  memberTag?: string;
}

const API_URL = '/api/tournaments';

// Post create a tournament

export const createTournament = async (
  organizerId: number,
  tournament: Omit<Tournament, 'id' | 'status'>,
  token: string,
): Promise<Tournament> => {
  const response = await fetch(`${API_URL}/${organizerId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tournament),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors de la creation du tournoi');
  }
  return response.json();
};

// GET /api/tournaments — récupère tous les tournois
export const getTournaments = async (
  token: string,
  filters?: TournamentFilters,
): Promise<TournamentDetails[]> => {
  const params = new URLSearchParams();
  if (filters?.tournamentName)
    params.append('tournamentName', filters.tournamentName);
  if (filters?.teamName) params.append('teamName', filters.teamName);
  if (filters?.memberTag) params.append('memberTag', filters.memberTag);

  const query = params.toString();
  const url = query ? `/api/tournaments?${query}` : '/api/tournaments';

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des tournois.');
  return response.json();
};

// GET /api/tournaments/{id} — récupère un tournoi par son id
export const getTournamentById = async (
  token: string,
  id: number,
): Promise<Tournament> => {
  const response = await fetch(`/api/tournaments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Tournoi introuvable.');
  return response.json();
};
