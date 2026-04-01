package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Tournament repository.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {

  /**
   * Find all tournaments.
   *
   * @return all tournaments
   */
  @Override
  List<Tournament> findAll();

  /**
   * Find a tournament by name.
   *
   * @param name partial tournament name
   * @return true if exists
   */
  boolean existsByName(String name);

  /**
   * Find tournaments by list of ids.
   *
   * @param ids list of tournament ids
   * @return matching tournaments
   */
  List<Tournament> findByIdIn(List<Long> ids);

  /**
   * Find a tournament by its name.
   *
   * @param name Tournament name
   * @return tounament
   */
  Optional<Tournament> findByName(String name);

  /**
   * Find the most recently ended tournament.
   *
   * @param status tournament status enum
   * @return most recent tournament with that status
   */
  Optional<Tournament> findTopByStatusOrderByEndDateDesc(Status status);

  /**
   * Find the current playing tournament.
   *
   * @param status tournament status enum
   * @return first matching tournament
   */
  Optional<Tournament> findFirstByStatus(Status status);

  /**
   * Find the next upcoming public tournament.
   *
   * @param status tournament status enum
   * @return soonest public tournament with that status
   */
  Optional<Tournament> findFirstByStatusAndIsPublicTrueOrderByStartDateAsc(Status status);
}