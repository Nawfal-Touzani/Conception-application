import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import { TeamDto } from '../../types/team.types';

type Snack = {
  open: boolean;
  msg: string;
  severity: 'success' | 'error';
};

export function useJoinOrCreateTeam(onTeamCreated: () => void) {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamDto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [teamName, setTeamName] = useState('');
  const [snack, setSnack] = useState<Snack>({
    open: false,
    msg: '',
    severity: 'success',
  });

  useEffect(() => {
    if (!token) return;
    teamService
      .getTeams(token)
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
          setFilteredTeams(data);
        }
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredTeams(teams);
    } else {
      setFilteredTeams(
        teams.filter((t) =>
          t.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
    setSelectedTeamId('');
  }, [search, teams]);

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const createTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const res = await teamService.createTeam(token, teamName);
      if (res.status === 201) {
        onTeamCreated();
      } else if (res.status === 409) {
        setSnack({
          open: true,
          msg: "Ce nom d'équipe existe déjà.",
          severity: 'error',
        });
      } else if (res.status === 400) {
        setSnack({
          open: true,
          msg: "Nom d'équipe invalide.",
          severity: 'error',
        });
      } else {
        setSnack({
          open: true,
          msg: 'Erreur lors de la création.',
          severity: 'error',
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: 'Impossible de joindre le serveur.',
        severity: 'error',
      });
    }
  };

  const joinTeam = async () => {
    if (selectedTeamId === '') return;
    try {
      const res = await teamService.sendJoinRequest(token, selectedTeamId);
      if (res.ok || res.status === 201) {
        setSnack({
          open: true,
          msg: 'Demande envoyée avec succès !',
          severity: 'success',
        });
        setSelectedTeamId('');
      } else {
        setSnack({
          open: true,
          msg: "Erreur lors de l'envoi.",
          severity: 'error',
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: 'Impossible de joindre le serveur.',
        severity: 'error',
      });
    }
  };

  return {
    teams,
    filteredTeams,
    search,
    setSearch,
    selectedTeamId,
    setSelectedTeamId,
    teamName,
    setTeamName,
    snack,
    closeSnack,
    createTeam,
    joinTeam,
  };
}
