package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Tournament registration repository.
 */
@Repository
public interface TournamentRegistrationRepository
    extends CrudRepository<TournamentRegistration, Long> {

  /**
   * Find all registrations for a given tournament.
   *
   * @param tournamentId the tournament id
   * @return list of registrations
   */
  List<TournamentRegistration> findByTournamentId(Long tournamentId);

  /**
   * Count the number of teams registered for a given tournament.
   *
   * @param tournamentId the tournament id
   * @return number of registered teams
   */
  int countByTournamentId(Long tournamentId);

  /**
   * Check if a team is already registered for a given tournament.
   *
   * @param teamId       the team id
   * @param tournamentId the tournament id
   * @return true if already registered
   */
  boolean existsByTeamIdAndTournamentId(Long teamId, Long tournamentId);

}