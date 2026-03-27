package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Registration;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Registration repository.
 */
@Repository
public interface RegistrationRepository extends CrudRepository<Registration, Long> {

  /**
   *Find a tournament by id.
   */
  Iterable<Registration> findByTournamentId(Long tournamentId);

  /**
   *Find a Team by id.
   */
  Iterable<Registration> findByTeamId(Long teamId);

  /**
   *Find If a team is already in a team.
   */
  boolean existsByTournamentIdAndTeamId(Long tournamentId, Long teamId);

}
