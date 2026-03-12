package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Unavailability;
import java.time.LocalDate;
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

  /**
   * Checks if a member already has an unavailability overlapping the given dates.
   *
   * @param member    the member to check
   * @param dayAfter  the start date to compare
   * @param dayBefore the end date to compare
   * @return true if an overlapping unavailability exists, false otherwise
   */
  boolean existsByMemberAndStartDateBeforeAndEndDateAfter(Member member, LocalDate dayAfter,
      LocalDate dayBefore);
}
