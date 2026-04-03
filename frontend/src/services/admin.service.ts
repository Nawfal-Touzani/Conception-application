import { MemberDto } from '../types/admin.types';

export const getAdmins = async (token: string): Promise<MemberDto[]> => {
  const response = await fetch('/api/members/admins', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok)
    throw new Error('Erreur lors du chargement des administrateurs.');
  return response.json();
};

export const getAllMembers = async (token: string): Promise<MemberDto[]> => {
  const response = await fetch('/api/members', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des membres.');
  return response.json();
};

export const promoteToAdmin = async (
  token: string,
  memberId: number,
): Promise<Response> => {
  return fetch(`/api/members/admins/${memberId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const revokeAdmin = async (
  token: string,
  memberId: number,
): Promise<Response> => {
  return fetch(`/api/members/admins/${memberId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const banMember = async (
  token: string,
  memberId: number,
  reason: string,
) => {
  return fetch(`/api/admin/banishments/${memberId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });
};
