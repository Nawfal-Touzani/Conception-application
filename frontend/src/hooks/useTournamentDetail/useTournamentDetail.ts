import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import { TournamentDetails } from '../../types/tournament.types';
import { TeamDto } from '../../types/team.types';

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

        if (response.status === 409) {
          // déjà inscrit = rafraîchir silencieusement
          await onRegister();
          return;
        }
        if (response.status === 403) {
          setRegisterError('Seul le responsable peut inscrire la team.');
          return;
        }
        // message backend direct pour les 400
        setRegisterError(msg || "Erreur lors de l'inscription.");
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
