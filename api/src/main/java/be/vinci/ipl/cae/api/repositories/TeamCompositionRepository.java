package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.TeamCompositionId;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Team composition repository.
 */
@Repository
public interface TeamCompositionRepository extends
    JpaRepository<TeamComposition, TeamCompositionId> {

  /**
   * Exists by member id boolean.
   *
   * @param memberId the member id
   * @return the boolean
   */
  boolean existsByMemberId(Long memberId);

  /**
   * Find by member id optional.
   *
   * @param memberId the member id
   * @return the optional
   */
  Optional<TeamComposition> findByMemberId(Long memberId);
}