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
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          const msg = json.message || '';
          if (msg.includes('already')) {
            await onRegister();
          } else if (msg.includes('4 member')) {
            setRegisterError('Votre équipe doit avoir au moins 4 membres.');
          } else if (msg.includes('deadline') || msg.includes('past')) {
            setRegisterError("La date limite d'inscription est dépassée.");
          } else if (msg.includes('full') || msg.includes('maximum')) {
            setRegisterError('Le tournoi est complet.');
          } else if (msg.includes('public')) {
            setRegisterError(
              "Le tournoi n'est pas encore ouvert aux inscriptions.",
            );
          } else if (msg.includes('preparation')) {
            setRegisterError("Le tournoi n'est plus en phase d'inscription.");
          } else if (msg.includes('responsible')) {
            setRegisterError(
              'Seul le responsable ou second responsable peut inscrire la team.',
            );
          } else {
            setRegisterError(msg || "Erreur lors de l'inscription.");
          }
        } catch {
          setRegisterError(text || "Erreur lors de l'inscription.");
        }
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
