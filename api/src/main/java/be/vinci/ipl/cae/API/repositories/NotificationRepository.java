package be.vinci.ipl.cae.API.repositories;

import be.vinci.ipl.cae.API.models.entities.Notification;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Notification repository.
 */
@Repository
public interface NotificationRepository extends CrudRepository<Notification, Long> {
}
