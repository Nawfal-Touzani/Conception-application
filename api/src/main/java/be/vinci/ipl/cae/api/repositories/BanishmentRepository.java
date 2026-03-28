package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Banishment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Banishment entity, providing basic CRUD operations.
 */
@Repository
public interface BanishmentRepository extends CrudRepository<Banishment, Long> {

  /**
   * Checks whether a member is already banned.
   *
   * @param bannedMemberId the id of the member to check
   * @return true if the member is banned, false otherwise
   */
  boolean existsByBannedMemberId(Long bannedMemberId);

  /**
   * Retrieves the banishment of a member by their id.
   *
   * @param bannedMemberId the id of the banned member
   * @return an Optional containing the banishment if found, or empty if not
   */
  Optional<Banishment> findByBannedMemberId(Long bannedMemberId);

  /**
   * Retrieves all banishments issued by a given admin.
   *
   * @param adminId the id of the admin
   * @return all banishments issued by this admin
   */
  List<Banishment> findByAdminId(Long adminId);
}