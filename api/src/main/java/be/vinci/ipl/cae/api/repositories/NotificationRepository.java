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
   * Finds all notifications for a given member.
   *
   * @param id the ID of the member
   * @return the member
   */
  Iterable<Notification> findByMemberId(long id);

  /**
   * Finds all notifications for a given member filtered by read status.
   *
   * @param id the ID of the member
   * @param read true for read notifications, false for unread
   * @return  notifications with the filter
   */
  Iterable<Notification> findByMemberIdAndRead(long id, boolean read);
}
