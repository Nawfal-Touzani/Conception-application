package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * MembershipRequest repository.
 */
@Repository
public interface MembershipRequestRepository extends CrudRepository<MembershipRequest, Long> {

  /**
   * Finds all membership requests for a given team.
   *
   * @param teamId the ID of the team
   * @return the membership requests
   */
  Iterable<MembershipRequest> findByTeamId(long teamId);

  /**
   * Finds all membership requests for a given member.
   *
   * @param memberId the ID of the member
   * @return the membership requests
   */
  Iterable<MembershipRequest> findByMemberId(long memberId);
}