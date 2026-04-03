package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.TeamCompositionId;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Team composition repository.
 */
@Repository
public interface TeamCompositionRepository extends
    CrudRepository<TeamComposition, TeamCompositionId> {

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

  /**
   * Find all by team id list.
   *
   * @param teamId the team id
   * @return the list
   */
  List<TeamComposition> findAllByTeamId(Long teamId);

  /**
   * Find first by member id.
   *
   * @param memberId the member id
   * @return team composition
   */
  Optional<TeamComposition> findFirstByMemberId(Long memberId);

  /**
   * Count member of team.
   *
   * @param idTeam the given team id.
   * @return the count of member.
   */
  int countByTeamId(Long idTeam);
}