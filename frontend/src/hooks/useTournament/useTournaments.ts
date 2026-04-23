import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import * as tournamentService from '../../services/tournament/tournament.service';
import {
  TournamentDetails,
  TournamentStatus,
} from '../../types/tournament.types';

const COLUMNS = 3;

export function useTournaments(token: string) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const isAdmin = user?.role === 'ADMIN';

  const [tournaments, setTournaments] = useState<TournamentDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentDetails | null>(null);
  const [adminTournament, setAdminTournament] =
    useState<TournamentDetails | null>(null);

  const [teamSearch, setTeamSearch] = useState('');
  const [tagSearch, setTagSearch] = useState(searchParams.get('tag') || '');
  const [nameSearch, setNameSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const statusParam = searchParams.get('status');
  const initialStatus: TournamentStatus | 'OPEN' | '' =
    statusParam === 'OPEN' ||
    statusParam === 'IN_PROGRESS' ||
    statusParam === 'FINISHED' ||
    statusParam === 'CANCELLED'
      ? statusParam
      : '';

  const [statusFilter, setStatusFilter] = useState<
    TournamentStatus | 'OPEN' | ''
  >(initialStatus);
  const [visibilityFilter, setVisibilityFilter] = useState<
    'public' | 'private' | ''
  >('');

  const loadTournaments = useCallback(
    (teamName?: string, memberTag?: string) => {
      setError(null);
      tournamentService
        .getTournaments(token, teamName, memberTag)
        .then((data) => setTournaments(data))
        .catch(() => setError('Erreur lors du chargement des tournois.'));
    },
    [token],
  );

  useEffect(() => {
    loadTournaments();
  }, [loadTournaments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTournaments(
        teamSearch.trim() || undefined,
        tagSearch.trim() || undefined,
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [teamSearch, tagSearch, loadTournaments]);

  const handleRegister = useCallback(
    async (tournamentId: number) => {
      try {
        const updated = await tournamentService.getTournamentById(
          token,
          tournamentId,
        );
        setSelectedTournament(updated);
        setTournaments((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t)),
        );
      } catch (err) {
        console.error('Erreur lors du rafraîchissement du tournoi :', err);
        // recharger toute la liste comme fallback
        loadTournaments();
      }
    },
    [token, loadTournaments],
  );

  const filtered = useMemo(() => {
    const STATUS_ORDER: Record<string, number> = {
      PREPARATION: 0,
      IN_PROGRESS: 1,
      UPCOMING: 2,
      FINISHED: 3,
      CANCELLED: 4,
    };
    return tournaments
      .filter((t) => {
        if (
          nameSearch.trim() &&
          !t.name.toLowerCase().includes(nameSearch.toLowerCase())
        )
          return false;
        if (startDate && t.startDate < startDate) return false;
        if (endDate && t.endDate > endDate) return false;
        if (statusFilter === 'OPEN') {
          const deadlinePassed = new Date(t.registrationDeadline) < new Date();
          const isFull = t.currentParticipants >= t.maxParticipants;
          if (
            !(
              t.isPublic &&
              t.status === 'PREPARATION' &&
              !deadlinePassed &&
              !isFull
            )
          )
            return false;
        } else if (statusFilter && t.status !== statusFilter) {
          return false;
        }
        if (visibilityFilter === 'public' && !t.isPublic) return false;
        if (visibilityFilter === 'private' && t.isPublic) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99),
      );
  }, [
    tournaments,
    nameSearch,
    startDate,
    endDate,
    statusFilter,
    visibilityFilter,
  ]);

  const rows = useMemo(() => {
    const result: TournamentDetails[][] = [];
    for (let i = 0; i < filtered.length; i += COLUMNS) {
      result.push(filtered.slice(i, i + COLUMNS));
    }
    return result;
  }, [filtered]);

  const reset = () => {
    setTeamSearch('');
    setTagSearch('');
    setNameSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setVisibilityFilter('');
  };

  return {
    isAdmin,
    rows,
    error,
    selectedTournament,
    setSelectedTournament,
    adminTournament,
    setAdminTournament,
    setTournaments,
    handleRegister,
    reset,
    filters: {
      teamSearch,
      setTeamSearch,
      tagSearch,
      setTagSearch,
      nameSearch,
      setNameSearch,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      statusFilter,
      setStatusFilter,
      visibilityFilter,
      setVisibilityFilter,
    },
  };
}
