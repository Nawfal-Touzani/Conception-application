import { useState, useEffect } from 'react';
import { MatchDetail } from '../../types/match.types';
import {
  getUpcomingMatches,
  getPastMatches,
} from '../../services/match/match.service';

export type MatchView = 'upcoming' | 'past';

interface UsePersonalMatchesResult {
  upcoming: MatchDetail[];
  past: MatchDetail[];
  loading: boolean;
  error: string | null;
  activeView: MatchView;
  selectedMatch: MatchDetail | null;
  setActiveView: (v: MatchView) => void;
  setSelectedMatch: (m: MatchDetail | null) => void;
}

export const usePersonalMatches = (token: string): UsePersonalMatchesResult => {
  const [upcoming, setUpcoming] = useState<MatchDetail[]>([]);
  const [past, setPast] = useState<MatchDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<MatchView>('upcoming');
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadMatches = async () => {
      setLoading(true);
      setError(null);

      try {
        // Les deux fetches en parallèle pour éviter deux waterfalls
        const [upcomingData, pastData] = await Promise.all([
          getUpcomingMatches(token),
          getPastMatches(token),
        ]);
        setUpcoming(upcomingData);
        setPast(pastData);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erreur lors du chargement des matchs.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [token]);

  return {
    upcoming,
    past,
    loading,
    error,
    activeView,
    setActiveView,
    selectedMatch,
    setSelectedMatch,
  };
};
