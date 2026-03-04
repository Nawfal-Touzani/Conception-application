package be.vinci.ipl.cae.API.repositories;

import be.vinci.ipl.cae.API.models.entities.Member;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
}
