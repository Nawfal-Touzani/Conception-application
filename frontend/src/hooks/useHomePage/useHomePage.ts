import { useEffect, useState } from 'react';
import { TournamentDetails } from '../../types/tournament.types';
import { getHomepageTournaments } from '../../services/tournament/tournament.service';
import { filterDisplayedTournaments } from '../../utils/HomePage/homePage.utils';

export const useHomePage = () => {
  const [tournaments, setTournaments] = useState<TournamentDetails[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTournaments = async () => {
      setError(null);

      try {
        const data = await getHomepageTournaments();

        const displayedTournaments = filterDisplayedTournaments(
          data.lastFinished,
          data.inProgress,
          data.nextUpcoming,
        );

        setTournaments(displayedTournaments);
      } catch {
        setError('Erreur lors du chargement des tournois.');
      }
    };

    // React n’aime pas qu’on mette directement une fonction async dans useEffect.
    // Donc on fait une petite fonction async à l’intérieur, puis on l’exécute.
    loadTournaments();
  }, []);

  return {
    tournaments,
    error,
  };
};
