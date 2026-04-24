package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Team repository.
 */
@Repository
public interface TeamRepository extends CrudRepository<Team, Long> {

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

  /**
   * Find active teams.
   *
   * @return all active teams
   */
  List<Team> findByActiveTrue();

  /**
   * Finds a team by its responsible member.
   *
   * @param responsible the responsible member
   * @return the team if found
   */
  Optional<Team> findByResponsible(Member responsible);

  /**
   * Checks whether a member is the main responsible of at least one team.
   *
   * @param responsible the member to check
   * @return true if the member is responsible of at least one team
   */
  boolean existsByResponsible(Member responsible);

  /**
   * Checks whether a member is the second responsible of at least one team.
   *
   * @param secondResponsible the member to check
   * @return true if the member is second responsible of at least one team
   */
  boolean existsBySecondResponsible(Member secondResponsible);

  /**
   * Finds by its second responsible member.
   *
   * @param secondResponsible the second responsible member
   * @return the second responsible if found
   */
  Optional<Team> findBySecondResponsible(Member secondResponsible);
}
