package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.PlayersSelectionId;
import be.vinci.ipl.cae.api.models.entities.Team;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Repository for PlayersSelection entities.
 */
@Repository
public interface PlayersSelectionRepository extends
    ListCrudRepository<PlayersSelection, PlayersSelectionId> {

  /**
   * Retrieves the selected players for one side of a match. Used to build the two-column lineup
   * display on the match detail page (team A left, team B right). Only exposed when result is
   * VALIDATED.
   */
  List<PlayersSelection> findByMatchAndTeam(Match match, Team team);

  /**
   * Counts how many players have been selected for a team in a given match. Used as a guard before
   * confirming the selection — must equal exactly 4.
   */
  long countByMatchAndTeam(Match match, Team team);

  /**
   * Checks whether a member is already selected for a given match. Used as a guard in
   * submitSelection to prevent duplicate entries.
   */
  boolean existsByMatchAndMember(Match match, Member member);

  /**
   * Deletes all player selections for a team in a given match. Used when a manager modifies the
   * lineup (replaces the full selection) or when the system detects an invalid selection after a
   * team change.
   */
  @Transactional
  void deleteByMatchAndTeam(Match match, Team team);

  /**
   * Retrieves all selections of a member for matches in a given state. Used to detect and clean up
   * invalid future selections when a member leaves their team — only SCHEDULED matches are
   * relevant.
   */
  @Query(
      """
      SELECT ps FROM PlayersSelection ps
      WHERE ps.member = :member
        AND ps.match.state = :state
      """)
  List<PlayersSelection> findByMemberAndMatchState(
      @Param("member") Member member,
      @Param("state") Match.MatchState state
  );

  /**
   * Deletes all selections of a member for matches in a given state. Called when a member leaves
   * their team — invalidates all future selections to force the responsible to re-select before the
   * match.
   */
  @Transactional
  @Modifying
  @Query(
      """
      DELETE FROM PlayersSelection ps
      WHERE ps.member = :member
        AND ps.match.state = :state
      """)
  void deleteByMemberAndMatchState(
      @Param("member") Member member,
      @Param("state") Match.MatchState state
  );
}
