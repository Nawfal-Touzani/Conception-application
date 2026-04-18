package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Match repository.
 */
@Repository
public interface MatchRepository extends CrudRepository<Match, Long> {

  /**
   * Find all matches of a tournament, ordered by round.
   *
   * @param tournamentId the tournament id
   * @return ordered list of matches
   */
  List<Match> findByTournamentIdOrderByRoundNumberAsc(long tournamentId);

  /**
   * Delete all matches of a tournament (used when re-confirming a planning).
   *
   * @param tournamentId the tournament id
   */
  void deleteByTournamentId(long tournamentId);
}