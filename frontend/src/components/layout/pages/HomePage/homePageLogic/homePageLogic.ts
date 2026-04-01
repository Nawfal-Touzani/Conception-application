import { TournamentDetails } from '../../../../../types/tournament.types';

export const filterDisplayedTournaments = (
  lastFinished: TournamentDetails | null,
  inProgress: TournamentDetails | null,
  nextUpcoming: TournamentDetails | null,
): TournamentDetails[] => {
  // Takes the three tournaments from the API
  const allTournaments = [lastFinished, inProgress, nextUpcoming];

  // And returns an array of the non-null ones, in the order
  const validTournaments: TournamentDetails[] = [];
  for (const tournament of allTournaments) {
    if (tournament !== null && tournament.status !== 'CANCELLED') {
      validTournaments.push(tournament);
    }
  }

  return validTournaments;
};
