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

export const validateResult = async (
  matchId: number,
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${matchId}/validate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
};

export const contestResult = async (
  matchId: number,
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${matchId}/contest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Error ${response.status}`);
};

export const correctResult = async (
  matchId: number,
  payload: { scoreA: number; scoreB: number },
  token: string,
): Promise<void> => {
  const response = await fetch(`${API_URL}/${matchId}/result/correction`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}`);
  }
};
