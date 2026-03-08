package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.NotificationDto;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.services.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Controller for managing notifications.
 */
@RestController
@RequestMapping("/members")
public class NotificationController {

  private final NotificationService notificationService;

  /**
   * Creates a new NotificationController.
   */
  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Gets all notifications of a member.
   */
  @GetMapping("/{id}/notifications")
  public Iterable<Notification> getNotificationsOfMember(@PathVariable long id) {

    Iterable<Notification> notifications = notificationService.getAllNotificationByMember(id);

    if (notifications == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return notifications;

  }

  /**
   * Sends a notification to a member.
   */
  @PostMapping("/{id}/notifications")
  @ResponseStatus(HttpStatus.CREATED)
  public Notification sendNotification(@PathVariable long id,
      @Valid @RequestBody NotificationDto dto) {

    Notification notification = new Notification(dto.type(), dto.message(), dto.sendDate());
    Notification result = notificationService.send(id, notification);

    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return result;
  }

}
