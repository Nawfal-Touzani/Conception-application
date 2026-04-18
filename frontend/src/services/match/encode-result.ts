import { MatchResponseDto } from '../../types/match.types';

const API_URL = '/api/matches';

// Encoder un résultat
export const encodeResult = async (
  matchId: number,
  scoreA: number,
  scoreB: number,
  token: string,
): Promise<MatchResponseDto> => {
  const response = await fetch(`${API_URL}/${matchId}/result`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ scoreA, scoreB }),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  return response.json();
};
