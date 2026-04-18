package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

/**
 * Repository for Match entities.
 */
public interface MatchRepository extends ListCrudRepository<Match, Long> {

  /**
   * Retrieves all matches belonging to a tournament.
   * Used to build the bracket tree on the tournament detail page,
   * and to display the full match list in the admin planning view.
   */
  List<Match> findByTournament(Tournament tournament);

  /**
   * Retrieves all matches of a tournament filtered by state.
   * Used by the admin to list only SCHEDULED matches for result encoding,
   * and to target matches to delete when resetting the planning.
   */
  List<Match> findByTournamentAndState(Tournament tournament, MatchState state);

  /**
   * Retrieves all matches in which a member was selected as a player,
   * filtered by match state.
   * Used to display a member's upcoming (SCHEDULED) or past (PLAYED) tournaments
   * in their personal space.
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
   * Deletes all matches belonging to a tournament.
   * Used when the admin resets the planning, all existing matches are wiped
   * and the generation algorithm is restarted from scratch.
   * Cascades handle the deletion of linked selections, validations and notifications.
   */
  @Transactional
  void deleteByTournament(Tournament tournament);
}
