import { TeamDto, TeamMember } from '../types/team.types';

// fonction asynchrone qui retourne une promise avec un tab de Team
export const getTeams = async (token: string): Promise<TeamDto[]> => {
  const response = await fetch('/api/teams', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des équipes.');
  return response.json();
};

// return les membres de lequipe du joueur avec ce token
export const getMyTeamMembers = async (
  token: string,
): Promise<TeamMember[]> => {
  const response = await fetch('/api/teams/members', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Aucune équipe trouvée.');
  return response.json();
};

export const getMyTeam = async (token: string): Promise<TeamDto> => {
  const response = await fetch('/api/teams/my-team', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Erreur lors du chargement de l'équipe.");
  return response.json();
};

export const createTeam = async (
  token: string,
  name: string,
): Promise<Response> => {
  return fetch('/api/teams', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
};

export const sendJoinRequest = async (
  token: string,
  teamId: number,
): Promise<Response> => {
  return fetch(`/api/teams/${teamId}/membership-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const leaveTeam = async (token: string): Promise<Response> => {
  return fetch('/api/teams/leave', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const nominateSecondaryManager = async (
  token: string,
  teamId: number,
  memberId: number,
): Promise<Response> => {
  return fetch(`/api/teams/${teamId}/secondary-manager/${memberId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });
};
