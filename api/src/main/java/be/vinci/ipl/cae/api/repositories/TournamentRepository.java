package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Tournament;
import java.util.List;
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

}