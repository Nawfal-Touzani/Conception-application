import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import { TournamentDetails } from '../../types/tournament.types';
import { TeamDto } from '../../types/team.types';

const ERROR_MAP: Record<string, string> = {
  '4 member required': 'Votre équipe doit avoir au moins 4 membres.',
  'deadline passed': "La date limite d'inscription est dépassée.",
  'tournament is full': 'Le tournoi est complet.',
  'not public yet': "Le tournoi n'est pas encore ouvert aux inscriptions.",
  'not in preparation': "Le tournoi n'est plus en phase d'inscription.",
  'not responsible':
    'Seul le responsable ou second responsable peut inscrire la team.',
};

function mapErrorMessage(msg: string): string {
  return ERROR_MAP[msg] ?? msg;
}

export function useTournamentDetail(
  tournament: TournamentDetails,
  onRegister: () => Promise<void>,
) {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [myTeam, setMyTeam] = useState<TeamDto | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    teamService
      .getMyTeam(token)
      .then(setMyTeam)
      .catch(() => setMyTeam(null));
  }, [token]);

  const isResponsible =
    myTeam !== null &&
    (myTeam.responsibleTag === user?.tag ||
      myTeam.secondResponsibleTag === user?.tag);

  const isAlreadyRegistered =
    myTeam !== null &&
    (tournament.registeredTeamNames ?? []).includes(myTeam.name);

  const registrationOpen =
    tournament.status === 'PREPARATION' && tournament.isPublic;

  const handleRegister = useCallback(async () => {
    if (!myTeam) return;
    setRegisterError(null);
    try {
      const response = await fetch(
        `/api/tournaments/${tournament.id}/teams/${myTeam.id}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: null }));
        const msg: string = body.message ?? '';

        if (msg.toLowerCase().includes('already')) {
          await onRegister();
          return;
        }
        if (response.status === 403) {
          setRegisterError(
            'Seul le responsable ou second responsable peut inscrire la team.',
          );
          return;
        }
        setRegisterError(
          mapErrorMessage(msg) || "Erreur lors de l'inscription.",
        );
      } else {
        setRegisterSuccess(true);
        await onRegister();
      }
    } catch {
      setRegisterError("Erreur lors de l'inscription.");
    }
  }, [myTeam, token, tournament.id, onRegister]);

  return {
    myTeam,
    isResponsible,
    isAlreadyRegistered,
    registrationOpen,
    registerSuccess,
    registerError,
    handleRegister,
  };
}
