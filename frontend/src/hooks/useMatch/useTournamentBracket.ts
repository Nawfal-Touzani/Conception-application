import { useEffect, useMemo, useState } from 'react';
import { MatchBracket } from '../../types/match.types';
import * as matchService from '../../services/match/match.service';
import { useAuth } from '../../contexts/useAuth';
import { buildBracketLayout } from '../../utils/match/bracket.utils';

type UseTournamentBracketResult = {
  matches: MatchBracket[];
  bracket: ReturnType<typeof buildBracketLayout>;
  loading: boolean;
  error: string | null;
};

// recupere les matchs du bracket et calcule le layout une seule fois
export const useTournamentBracket = (
  tournamentId: number,
): UseTournamentBracketResult => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [matches, setMatches] = useState<MatchBracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    matchService
      .getBracketByTournament(tournamentId, token || undefined)
      .then(setMatches)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tournamentId, token]);

  // useMemo evite de recalculer le layout a chaque re-render
  const bracket = useMemo(() => buildBracketLayout(matches), [matches]);

  return { matches, bracket, loading, error };
};
