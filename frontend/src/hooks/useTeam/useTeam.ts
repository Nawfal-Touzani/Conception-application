import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import * as tournamentService from '../../services/tournament/tournament.service';
import { TeamDto, TeamMember } from '../../types/team.types';
import { TournamentDetails } from '../../types/tournament.types';

export function useTeam() {
  const { user } = useAuth();
  // Opérateur `??` : token vide si user est null, évite de passer undefined aux services
  const token = user?.token ?? '';

  const [team, setTeam] = useState<TeamDto | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  // `null` = chargement en cours, `true/false` = résultat connu
  // Permet de distinguer 3 états : loading / a une équipe / n'a pas d'équipe
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [nominateError, setNominateError] = useState<string | null>(null);
  const [nominateSuccess, setNominateSuccess] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<TournamentDetails[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  // Valeur dérivée du state — recalculée à chaque render, pas besoin de useState
  const isSolo = members.length === 1;

  // `!!` double négation pour convertir en booléen strict
  // Vérifie si l'utilisateur connecté est responsable ou second responsable
  const isResponsible =
    !!team &&
    !!user &&
    (team.responsibleTag === user.tag ||
      team.secondResponsibleTag === user.tag);

  // Filtres dérivés du state `tournaments` — recalculés automatiquement
  // à chaque mise à jour de `tournaments`
  const tournamentsInProgress = tournaments.filter(
    (t) => t.status === 'IN_PROGRESS',
  );
  const tournamentsUpcoming = tournaments.filter(
    (t) => t.status === 'PREPARATION' && t.isPublic,
  );

  // `useCallback` mémoïse la fonction pour qu'elle ne soit pas recrée à chaque render
  // Sans ça, `loadTeamData` changerait de référence en boucle et déclencherait
  // l'effect en continu via sa dépendance dans le tableau de `useEffect`
  const loadTeamData = useCallback(() => {
    // Remet hasTeam à null pour signaler un rechargement en cours
    setHasTeam(null);
    teamService
      .getMyTeamMembers(token)
      .then(async (memberData) => {
        setMembers(memberData);
        setHasTeam(true);
        // Appels séquentiels avec await dans un `.then` async : on attend
        // les données de l'équipe avant de charger ses tournois
        const teamData = await teamService.getMyTeam(token);
        setTeam(teamData);
        const teamTournaments = await tournamentService.getTournaments(
          token,
          teamData.name,
        );
        setTournaments(teamTournaments);
      })
      // Si l'appel initial échoue (ex: pas d'équipe), on passe hasTeam à false
      .catch(() => setHasTeam(false));
  }, [token]);

  // Charge les données au montage et à chaque changement d'utilisateur
  // `loadTeamData` est en dépendance car c'est une fonction (stabilisée par useCallback)
  useEffect(() => {
    if (user) loadTeamData();
  }, [user, loadTeamData]);

  const handleLeave = async () => {
    setLeaveLoading(true);
    try {
      await teamService.leaveTeam(token);
      setConfirmOpen(false);
      // Recharge les données après départ pour mettre à jour l'UI
      loadTeamData();
    } catch (err) {
      // `instanceof Error` permet d'accéder à `.message` de façon type-safe
      // car `catch` type l'erreur en `unknown` par défaut en TypeScript strict
      setLeaveError(
        err instanceof Error ? err.message : 'Une erreur est survenue.',
      );
      setConfirmOpen(false);
    } finally {
      // `finally` garantit que le loading est désactivé même en cas d'erreur
      setLeaveLoading(false);
    }
  };

  const handleNominate = async (memberId: number) => {
    if (!team) return;
    // Réinitialise les feedbacks avant chaque tentative
    setNominateError(null);
    setNominateSuccess(null);
    try {
      await teamService.nominateSecondaryManager(token, team.id, memberId);
      setNominateSuccess('Second responsable nommé avec succès.');
      loadTeamData();
    } catch (err) {
      setNominateError(err instanceof Error ? err.message : 'Erreur réseau.');
    }
  };

  return {
    user,
    team,
    members,
    hasTeam,
    isSolo,
    isResponsible,
    confirmOpen,
    setConfirmOpen,
    leaveLoading,
    leaveError,
    setLeaveError,
    nominateError,
    setNominateError,
    nominateSuccess,
    setNominateSuccess,
    tournamentsInProgress,
    tournamentsUpcoming,
    tabIndex,
    setTabIndex,
    loadTeamData,
    handleLeave,
    handleNominate,
  };
}
