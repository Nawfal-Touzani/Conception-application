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
  // recupere la liste simple des matchs d'un tournoi
  const response = await fetch(`/api/tournaments/${tournamentId}/matches`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error(`Error ${response.status}`);

  return response.json();
};

// recupere le detail complet d'un match
// le token reste optionnel car la page peut etre publique
export const getMatchById = async (
  id: number,
  token?: string,
): Promise<MatchDetail> => {
  // ajoute le bearer seulement si l'utilisateur est connecte
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}/matches/${id}`, { headers });

  if (!response.ok) {
    // donne un message metier plus clair si le match n'existe pas
    if (response.status === 404) throw new Error('Match introuvable.');

    throw new Error('Erreur lors du chargement du match.');
  }

  return response.json();
};

// recupere les prochains matchs du membre connecte
export const getUpcomingMatches = async (
  token: string,
): Promise<MatchDetail[]> => {
  const response = await fetch(`${API_URL}/matches/upcoming`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des matchs a venir.');
  }

  return response.json();
};

// recupere les anciens matchs du membre connecte
export const getPastMatches = async (token: string): Promise<MatchDetail[]> => {
  const response = await fetch(`${API_URL}/matches/past`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des matchs passes.');
  }

  return response.json();
};

// recupere le bracket d'un tournoi
// le token reste optionnel car cette vue peut etre publique
export const getBracketByTournament = async (
  tournamentId: number,
  token?: string,
): Promise<MatchBracket[]> => {
  // ajoute le bearer seulement si on en a un
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(
    `${API_URL}/tournaments/${tournamentId}/bracket`,
    { headers },
  );

  if (!response.ok) {
    // remonte un message metier plus lisible que le simple code http
    if (response.status === 404) throw new Error('Tournoi introuvable.');

    throw new Error('Erreur lors du chargement du bracket.');
  }

  return response.json();
};

// recupere les membres qu'on peut selectionner pour la composition
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
    // ce cas arrive si l'utilisateur n'a pas les droits de responsable
    if (response.status === 403)
      throw new Error(
        "Acces refuse. Vous n'etes pas responsable de cette equipe.",
      );

    throw new Error('Erreur lors du chargement des membres eligibles.');
  }

  return response.json();
};

// envoie une premiere composition pour le match
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
    // envoie juste la liste des ids au back
    body: JSON.stringify({ memberIds }),
  });

  if (!response.ok) {
    // essaie de recuperer le message exact du back si disponible
    const message = await response.text();
    throw new Error(
      message || 'Erreur lors de la soumission de la composition.',
    );
  }

  return response.json();
};

// remplace une composition deja existante
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
    // envoie la nouvelle liste complete au back
    body: JSON.stringify({ memberIds }),
  });

  if (!response.ok) {
    // garde en priorite le message du serveur si il existe
    const message = await response.text();
    throw new Error(
      message || 'Erreur lors de la soumission de la composition.',
    );
  }

  return response.json();
};

// valide le resultat d'un match deja encode
export const validateResult = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // ce cas indique que l'action n'est pas autorisee dans l'etat actuel
    if (response.status === 409)
      throw new Error(
        "Ce resultat ne peut pas etre valide dans l'etat actuel.",
      );

    throw new Error('Erreur lors de la validation du resultat.');
  }

  return response.json();
};

// conteste le resultat d'un match
export const contestResult = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/contest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // le back bloque si une contestation a deja ete faite
    if (response.status === 409)
      throw new Error('Vous avez deja conteste ce resultat.');

    throw new Error('Erreur lors de la contestation du resultat.');
  }

  return response.json();
};

// declare le forfait de l'equipe pour ce match
export const declareForfeit = async (
  matchId: number,
  token: string,
): Promise<MatchDetail> => {
  const response = await fetch(`${API_URL}/matches/${matchId}/forfeit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // le back refuse si le match n'est pas dans un etat compatible
    if (response.status === 409)
      throw new Error('Le forfait ne peut pas etre declare pour ce match.');

    throw new Error('Erreur lors de la declaration de forfait.');
  }

  return response.json();
};

// recupere les statuts de selection des matchs d'un tournoi
export const getMatchSelectionStatuses = async (
  tournamentId: number,
  token: string,
): Promise<MatchSelectionStatus[]> => {
  const response = await fetch(
    `${API_URL}/tournaments/${tournamentId}/selections/status`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des statuts.');
  }

  return response.json();
};
