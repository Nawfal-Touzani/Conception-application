import {
  Tournament,
  TournamentDetails,
  HomepageTournaments,
} from '../../types/tournament.types';

const API_URL = '/api/tournaments';

// POST — créer un tournoi (admin seulement)
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
// token optionnel — un visiteur non connecté peut voir les tournois publics
export const getTournaments = async (
  token: string,
  teamName?: string,
  memberTag?: string,
): Promise<TournamentDetails[]> => {
  const params = new URLSearchParams();
  if (teamName) params.append('teamName', teamName);
  if (memberTag) params.append('memberTag', memberTag);

  const query = params.toString();
  const url = query ? `${API_URL}?${query}` : API_URL;

  const headers: Record<string, string> = {};
  if (token && token.length > 0) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Erreur lors du chargement des tournois.');
  return response.json();
};

// GET /api/tournaments/{id}
export const getTournamentById = async (
  token: string,
  id: number,
): Promise<Tournament> => {
  const response = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Tournoi introuvable.');
  return response.json();
};

<<<<<<< HEAD
// PUT — modifier un tournoi (admin seulement)
export const updateTournament = async (
  id: number,
  tournament: Omit<Tournament, 'id' | 'status'>,
  token: string,
): Promise<Tournament> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tournament),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors de la modification du tournoi');
  }
  return response.json();
};

// PATCH — rendre un tournoi public (admin seulement)
export const publishTournament = async (
  id: number,
  token: string,
): Promise<Tournament> => {
  const response = await fetch(`${API_URL}/${id}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors de la publication du tournoi');
  }
  return response.json();
};
=======
export const getHomepageTournaments =
  async (): Promise<HomepageTournaments> => {
    // no token needed, public endpoint
    const response = await fetch(`${API_URL}/homepage`);
    if (!response.ok) {
      throw new Error(
        "Erreur lors du chargement des tournois de la page d'accueil.",
      );
    }
    return response.json();
  };
>>>>>>> develop
