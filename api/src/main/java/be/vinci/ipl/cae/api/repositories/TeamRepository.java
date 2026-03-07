package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Team;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Team repository.
 */
@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

  /**
   * Find by name optional.
   *
   * @param name the name
   * @return the optional
   */
  Optional<Team> findByName(String name);

  /**
   * Exists by name boolean.
   *
   * @param name the name
   * @return the boolean
   */
  boolean existsByName(String name);
}