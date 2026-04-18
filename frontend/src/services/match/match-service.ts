import { MatchResponseDto } from '../../types/match.types';
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
