import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as teamService from '../../services/team/team.service';
import { TeamDto } from '../../types/team.types';

type Snack = {
  open: boolean;
  msg: string;
  severity: 'success' | 'error';
  section: 'join' | 'create' | null;
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
    section: null,
  });

  useEffect(() => {
    if (!token) return;

    const loadTeams = async () => {
      try {
        const data = await teamService.getTeams(token);
        setTeams(data);
        setFilteredTeams(data);
      } catch {
        setSnack({
          open: true,
          msg: 'Erreur lors du chargement des équipes.',
          severity: 'error',
          section: 'join',
        });
      }
    };

    loadTeams();
  }, [token]);

  useEffect(() => {
    const trimmedSearch = search.trim().toLowerCase();

    if (!trimmedSearch) {
      setFilteredTeams(teams);
      return;
    }

    setFilteredTeams(
      teams.filter((team) => team.name.toLowerCase().includes(trimmedSearch)),
    );
  }, [search, teams]);

  const closeSnack = () => {
    setSnack((prev) => ({ ...prev, open: false }));
  };

  const createTeam = async () => {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      setSnack({
        open: true,
        msg: "Veuillez entrer un nom d'équipe.",
        severity: 'error',
        section: 'create',
      });
      return;
    }

    try {
      await teamService.createTeam(token, trimmedName);

      setSnack({
        open: true,
        msg: 'Équipe créée avec succès !',
        severity: 'success',
        section: 'create',
      });

      setTeamName('');
      onTeamCreated();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la création.';

      setSnack({
        open: true,
        msg,
        severity: 'error',
        section: 'create',
      });
    }
  };

  const joinTeam = async () => {
    if (selectedTeamId === '') {
      setSnack({
        open: true,
        msg: 'Veuillez sélectionner une équipe.',
        severity: 'error',
        section: 'join',
      });
      return;
    }

    try {
      await teamService.sendJoinRequest(token, selectedTeamId);

      setSnack({
        open: true,
        msg: 'Demande envoyée avec succès !',
        severity: 'success',
        section: 'join',
      });

      setSelectedTeamId('');
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la demande.';

      setSnack({
        open: true,
        msg,
        severity: 'error',
        section: 'join',
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
