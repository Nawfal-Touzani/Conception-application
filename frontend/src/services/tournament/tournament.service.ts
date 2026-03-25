import { Tournament } from '../../types/tournament.types';

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
