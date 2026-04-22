package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * Repository for Match entities.
 */
public interface MatchRepository extends ListCrudRepository<Match, Long> {

  /**
   * Retrieves all matches belonging to a tournament, ordered by round number ascending. Used to
   * build the bracket tree on the tournament detail page, and to display the full match list in the
   * admin planning view.
   *
   * @param tournament the tournament
   * @return ordered list of matches
   */
  List<Match> findByTournamentOrderByRoundNumberAsc(Tournament tournament);

  /**
   * Retrieves all matches of a tournament filtered by state. Used by the admin to list only
   * SCHEDULED matches for result encoding, and to target matches to delete when resetting the
   * planning.
   *
   * @param tournament the tournament
   * @param state      the match state to filter by
   * @return list of matches with the given state
   */
  List<Match> findByTournamentAndState(Tournament tournament, MatchState state);

  /**
   * Retrieves all matches in which a member was selected as a player, filtered by match state. Used
   * to display a member's upcoming (SCHEDULED) or past (PLAYED) matches in their personal space.
   *
   * @param member the member
   * @param state  the match state to filter by
   * @return list of matches where the member is selected
   */
  @Query(
      """
              SELECT m FROM Match m
              JOIN m.playersSelections ps
              WHERE ps.member = :member
                AND m.state = :state
      """
  )
  List<Match> findBySelectedMemberAndState(
      @Param("member") Member member,
      @Param("state") MatchState state
  );

  /**
   * Deletes all matches belonging to a tournament. Used when the admin resets the planning — all
   * existing matches are wiped and the generation algorithm is restarted from scratch. Cascades
   * handle the deletion of linked selections, validations and notifications.
   *
   * @param tournament the tournament whose matches must be deleted
   */
  @Transactional
  void deleteByTournament(Tournament tournament);

  /**
   * Finds all matches with a given result status and whose result encoding date is before a given
   * deadline.
   *
   * @param status   the result status to filter matches
   * @param deadline the upper bound date for the result encoding date
   * @return a list of matches
   */
  List<Match> findByResultStatusAndResultEncodedDateBefore(
      ResultStatus status, LocalDateTime deadline
  );
}
