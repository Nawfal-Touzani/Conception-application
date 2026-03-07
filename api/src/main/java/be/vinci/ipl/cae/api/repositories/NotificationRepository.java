package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Notification repository.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {

  /**
   * Finds a given member.
   *
   * @param id the id member
   * @return the member
   */
  Iterable<Notification> findByMemberId(long idMember);
  Iterable<Notification> findByMemberId(long id);
}
