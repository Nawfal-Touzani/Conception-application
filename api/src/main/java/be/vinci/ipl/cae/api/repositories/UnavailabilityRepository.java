package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Unavailability;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for accessing and managing Unavailabiliy entities.
 */
@Repository
public interface UnavailabilityRepository extends JpaRepository<Unavailability, Long> {

  /**
   * Returns all member unavailabilities of given member ordered by start date.
   *
   * @param member the member whose unavailabilities are retrieved
   * @return the list of unavailabilities ordered by start date
   */
  List<Unavailability> findAllByMemberOrderByStartDateAsc(Member member);
}
