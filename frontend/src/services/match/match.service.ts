import {
  MatchResponseDto,
  MatchBracket,
  MatchDetail,
  MemberSelectionDto,
  MatchSelectionStatus,
} from '../../types/match.types';

const API_URL = 'http://localhost:3000';

export const getMatchesByTournament = async (
  tournamentId: number,
  token: string,
): Promise<MatchResponseDto[]> => {
  const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
  return response.json();
};

// GET /matches/:id, accessible publiquement, token optionnel
// Si le résultat est VALIDATED, les compositions sont visibles
export const getMatchById = async (
  id: number,
  token?: string,
): Promise<MatchDetail> => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/matches/${id}`, { headers });

  if (!response.ok) {
    if (response.status === 404) throw new Error('Match introuvable.');
    throw new Error('Erreur lors du chargement du match.');
  }

  return response.json();
};

// GET /matches/upcoming, matchs à venir du membre connecté
export const getUpcomingMatches = async (
  token: string,
): Promise<MatchDetail[]> => {
  const response = await fetch(`${API_URL}/matches/upcoming`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des matchs à venir.');
  }

  return response.json();
};

// GET /matches/past, matchs passés du membre connecté
export const getPastMatches = async (token: string): Promise<MatchDetail[]> => {
  const response = await fetch(`${API_URL}/matches/past`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des matchs passés.');
  }

  return response.json();
};

// GET /tournaments/:id/bracket, accessible publiquement, token optionnel
export const getBracketByTournament = async (
  tournamentId: number,
  token?: string,
): Promise<MatchBracket[]> => {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(
    `${API_URL}/tournaments/${tournamentId}/bracket`,
    { headers },
  );

  if (!response.ok) {
    if (response.status === 404) throw new Error('Tournoi introuvable.');
    throw new Error('Erreur lors du chargement du bracket.');
  }

  return response.json();
};

// GET /matches/:id/selection/eligible, membres éligibles pour la compo (responsable)
export const getEligibleMembers = async (
  matchId: number,
  token: string,
): Promise<MemberSelectionDto[]> => {
  const response = await fetch(
    `${API_URL}/matches/${matchId}/selection/eligible`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    if (response.status === 403)
      throw new Error(
        "Accès refusé. Vous n'êtes pas responsable de cette équipe.",
      );
    throw new Error('Erreur lors du chargement des membres éligibles.');
  }

  return response.json();
};

// POST /matches/:id/selection, première soumission de la composition (4 joueurs)
export const submitSelection = async (
  matchId: number,
  memberIds: number[],
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/selection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ memberIds }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: null }));
    throw new Error(
      body.message || 'Erreur lors de la soumission de la composition.',
    );
  }

  return response.json();
};

// PUT /matches/:id/selection, modification de la composition existante
export const modifySelection = async (
  matchId: number,
  memberIds: number[],
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/selection`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ memberIds }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: null }));
    throw new Error(
      body.message || 'Erreur lors de la soumission de la composition.',
    );
  }

  return response.json();
};

// POST /matches/:id/validate, le responsable valide le résultat encodé par l'admin
export const validateResult = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 409)
      throw new Error(
        "Ce résultat ne peut pas être validé dans l'état actuel.",
      );
    throw new Error('Erreur lors de la validation du résultat.');
  }

  return response.json();
};

// POST /matches/:id/contest, le responsable conteste le résultat (une seule fois possible)
export const contestResult = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/contest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 409)
      throw new Error('Vous avez déjà contesté ce résultat.');
    throw new Error('Erreur lors de la contestation du résultat.');
  }

  return response.json();
};

// POST /matches/:id/forfeit, le responsable déclare forfait (0-5, irréversible)
export const declareForfeit = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/forfeit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    if (response.status === 409)
      throw new Error('Le forfait ne peut pas être déclaré pour ce match.');
    throw new Error('Erreur lors de la déclaration de forfait.');
  }

  return response.json();
};

export const getMatchSelectionStatuses = async (
  tournamentId: number,
  token: string,
): Promise<MatchSelectionStatus[]> => {
  const response = await fetch(
    `${API_URL}/tournaments/${tournamentId}/selections/status`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  if (!response.ok) throw new Error('Erreur lors du chargement des statuts.');
  return response.json();
};
