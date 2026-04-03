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
   * Count registrations for a given tournament.
   *
   * @param tournamentId the tournament id
   * @return number of registered teams
   */
  int countByTournamentId(Long tournamentId);

  /**
   * Find all registrations where the team name matches (partial, case-insensitive).
   *
   * @param teamName partial team name
   * @return list of registrations
   */
  List<TournamentRegistration> findByTeamNameContainingIgnoreCase(String teamName);

  /**
   * Find all registrations for a given tournament.
   *
   * @param tournamentId the tournament id
   * @return list of registrations
   */
  List<TournamentRegistration> findByTournamentId(Long tournamentId);

  /**
   * Verify if the team is on a tournament.
   *
   * @param idTeam       the given team id.
   * @param idTournament the given tournament id.
   * @return true if the team is registered in the tournament, false otherwise
   */
  boolean existsByTeamIdAndTournamentId(Long idTeam, Long idTournament);

}