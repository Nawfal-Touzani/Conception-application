package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Membership request repository.
 */
@Repository
public interface MembershipRequestRepository extends JpaRepository<MembershipRequest, Long> {

  /**
   * Find all by team id and state list.
   *
   * @param teamId the team id
   * @param state  the state
   * @return the list
   */
  List<MembershipRequest> findAllByTeamIdAndState(Long teamId, State state);

  /**
   * Exists by member id and state boolean.
   *
   * @param memberId the member id
   * @param state    the state
   * @return the boolean
   */
  boolean existsByMemberIdAndState(Long memberId, State state);
}