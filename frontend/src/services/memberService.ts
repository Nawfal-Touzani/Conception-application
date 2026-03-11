import { MemberProfile } from '../types/member';

const API_URL = 'http://localhost:3000/members';

export const getMyProfile = async (token: string): Promise<MemberProfile> => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fecth profile');
  return response.json();
};

export const updateMyProfile = async (
  token: string,
  data: { speciality?: string; profileImage?: string },
) => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response.ok;
};

export const changePassword = async (
  token: string,
  dto: unknown,
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur réseau ou serveur :', error);
    return false;
  }
};
