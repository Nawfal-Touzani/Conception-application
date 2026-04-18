package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.ValidationResult;
import be.vinci.ipl.cae.api.models.entities.ValidationResultId;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for ValidationResult entities.
 */
@Repository
public interface ValidationResultRepository extends
    ListCrudRepository<ValidationResult, ValidationResultId> {
  /**
   * Retrieves a team's validation entry for a specific match.
   * Used when a manager accepts or contests a result — the service checks
   * hasAlreadyContested to enforce the one-contest-only rule, then
   * checks if the team has already responded to prevent double submission.
   */
  Optional<ValidationResult> findByMatchAndTeam(Match match, Team team);

  /**
   * Counts how many teams have validated (accepted) the result of a match.
   * Used after each response to check if both teams agreed — if count == 2,
   * the service sets resultStatus to VALIDATED, assigns the winner,
   * and places the winner into the next match of the bracket.
   */
  long countByMatchAndValidated(Match match, boolean validated);

  /**
   * Retrieves both validation entries for a match.
   * Used by the admin to inspect the full validation state after a contest
   * (which team contested, which team accepted) before correcting the score.
   */
  List<ValidationResult> findByMatch(Match match);
}
