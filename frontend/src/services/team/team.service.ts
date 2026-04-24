import { TeamDto, TeamMember } from '../../types/team.types';

export const getTeams = async (token: string): Promise<TeamDto[]> => {
  // `Authorization: Bearer` : schéma d'authentification standard pour les JWT
  const response = await fetch('/api/teams', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    // `response.text()` lit le corps de la réponse d'erreur renvoyé par le serveur
    // Le `||` fournit un message de fallback si le corps est vide
    const errorText = await response.text();
    throw new Error(errorText || 'Erreur lors du chargement des équipes.');
  }

  // `response.json()` désérialise le corps JSON et retourne une Promise<TeamDto[]>
  return response.json();
};

export const getMyTeamMembers = async (
  token: string,
): Promise<TeamMember[]> => {
  const response = await fetch('/api/teams/members', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Aucune équipe trouvée.');
  }

  return response.json();
};

export const getMyTeam = async (token: string): Promise<TeamDto> => {
  const response = await fetch('/api/teams/my-team', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors du chargement de l'équipe.");
  }

  return response.json();
};

export const createTeam = async (
  token: string,
  name: string,
): Promise<void> => {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // `Content-Type: application/json` indique au serveur le format du body
      // obligatoire pour que le backend parse correctement `JSON.stringify({ name })`
      'Content-Type': 'application/json',
    },
    // `JSON.stringify` sérialise l'objet JS en chaîne JSON pour l'envoi
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de la création de l'équipe.");
  }
};

export const sendJoinRequest = async (
  token: string,
  teamId: number,
): Promise<void> => {
  // `teamId` injecté dans l'URL via template literal pour cibler l'équipe concernée
  const response = await fetch(`/api/teams/${teamId}/membership-requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors de l'envoi de la demande.");
  }
};

export const leaveTeam = async (token: string): Promise<void> => {
  // `DELETE` : méthode HTTP sémantique pour une action de suppression/départ
  const response = await fetch('/api/teams/leave', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Erreur lors du départ de l'équipe.");
  }
};

export const nominateSecondaryManager = async (
  token: string,
  teamId: number,
  memberId: number,
): Promise<void> => {
  // `PUT` : méthode HTTP sémantique pour une mise à jour de ressource existante
  // Les deux ids sont passés en paramètres d'URL pour cibler précisément le membre
  const response = await fetch(
    `/api/teams/${teamId}/secondary-manager/${memberId}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Impossible de nommer ce membre.');
  }
};
