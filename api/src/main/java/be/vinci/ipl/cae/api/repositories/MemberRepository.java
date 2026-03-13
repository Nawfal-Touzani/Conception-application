package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Member entity, providing basic CRUD operations.
 */
@Repository
public interface MemberRepository extends CrudRepository<Member, Long> {

  /**
   * Checks whether a member with the given email already exists.
   *
   * @param email the email to check
   * @return true if a member with this email exists, false otherwise
   */
  boolean existsByEmail(String email);

  /**
   * Retrieves a member by their email address.
   *
   * @param email the email to search for
   * @return an Optional containing the member if found, or empty if not
   */
  Optional<Member> findByEmail(String email);

  /**
   * Counts how many members are administrators.
   *
   * @return the number of admin
   */
  long countByIsAdminTrue();

  /**
   * Find all admins.
   *
   * @return a list of admin.
   */
  List<Member> findByIsAdminTrue();

  /**
   *Find all members.
   *
   * @return a list of members
   */
  @Override
  List<Member> findAll();
}
