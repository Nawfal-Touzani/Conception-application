import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import * as tournamentService from '../../services/tournament/tournament.service';
import { TeamDto, TeamMember } from '../../types/team.types';
import { TournamentDetails } from '../../types/tournament.types';

export function useTeam() {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [team, setTeam] = useState<TeamDto | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [nominateError, setNominateError] = useState<string | null>(null);
  const [nominateSuccess, setNominateSuccess] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<TournamentDetails[]>([]);
  const [tabIndex, setTabIndex] = useState(0);

  const isSolo = members.length === 1;

  const isResponsible =
    team?.responsibleTag != null &&
    members.find((m) => m.gameTag === team.responsibleTag) != null &&
    user?.tag === team.responsibleTag;

  const tournamentsInProgress = tournaments.filter(
    (t) => t.status === 'IN_PROGRESS',
  );
  const tournamentsUpcoming = tournaments.filter(
    (t) => t.status === 'PREPARATION' && t.isPublic,
  );

  const loadTeamData = useCallback(() => {
    setHasTeam(null);
    teamService
      .getMyTeamMembers(token)
      .then(async (memberData) => {
        setMembers(memberData);
        setHasTeam(true);
        const teamData = await teamService.getMyTeam(token);
        setTeam(teamData);
        const teamTournaments = await tournamentService.getTournaments(
          token,
          teamData.name,
        );
        setTournaments(teamTournaments);
      })
      .catch(() => setHasTeam(false));
  }, [token]);

  useEffect(() => {
    if (user) loadTeamData();
  }, [user, loadTeamData]);

  const handleLeave = async () => {
    setLeaveLoading(true);
    try {
      const res = await teamService.leaveTeam(token);
      if (res.status === 409) {
        const body = await res.json();
        setLeaveError(
          body.message || 'Désignez un second responsable avant de quitter.',
        );
        setConfirmOpen(false);
        return;
      }
      if (!res.ok) {
        setLeaveError('Une erreur est survenue.');
        setConfirmOpen(false);
        return;
      }
      setConfirmOpen(false);
      loadTeamData();
    } catch {
      setLeaveError('Erreur réseau.');
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleNominate = async (memberId: number) => {
    if (!team) return;
    setNominateError(null);
    setNominateSuccess(null);
    try {
      const res = await teamService.nominateSecondaryManager(
        token,
        team.id,
        memberId,
      );
      if (!res.ok) {
        setNominateError('Impossible de nommer ce membre.');
        return;
      }
      setNominateSuccess('Second responsable nommé avec succès.');
      loadTeamData();
    } catch {
      setNominateError('Erreur réseau.');
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
