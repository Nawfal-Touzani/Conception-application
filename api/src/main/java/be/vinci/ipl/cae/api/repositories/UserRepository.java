package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.User;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * User repository.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {

  /**
   * Find a user by its username.
   *
   * @param username the username
   * @return the user
   */
  User findByUsername(String username);
}
