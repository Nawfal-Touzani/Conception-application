package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.NotificationDto;
import be.vinci.ipl.cae.api.models.dtos.NotificationResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.services.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
   * Gets all notifications of a member(optional filter by read status).
   */
  @GetMapping("/{id}/notifications")
  @PreAuthorize("isAuthenticated()")
  public Iterable<NotificationResponseDto> getNotificationsOfMember(@PathVariable long id,
      @RequestParam(required = false) Boolean read,
      @AuthenticationPrincipal Member currentMember) {

    Iterable<Notification> notifications;

    if (currentMember.getId() != id) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    if (read == null) {
      notifications = notificationService.getAllNotificationByMember(id);
    } else {
      notifications = notificationService.getNotificationsByReadStatus(id, read);
    }

    if (notifications == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return ((List<Notification>) notifications)
        .stream()
        .map(this::toDto)
        .toList();

  }

  /**
   * Sends a notification to a member.
   */
  @PostMapping("/{id}/notifications")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)
  public NotificationResponseDto sendNotification(@PathVariable long id,
      @Valid @RequestBody NotificationDto dto) {

    Notification notification = new Notification(dto.type(), dto.message(), dto.sendDate());

    Notification result = notificationService.send(id, notification);

    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return toDto(result);
  }

  /**
   * Mark a notification as read.
   */
  @PatchMapping("/{idMember}/notifications/{idNotification}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("isAuthenticated()")
  public Notification markNotificationAsRead(@PathVariable long idMember,
      @PathVariable long idNotification, @AuthenticationPrincipal Member currentMember) {
    if (currentMember.getId() != idMember) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    Notification result = notificationService.markNotificationRead(idNotification);

    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return result;
  }

  // conversion of nototification into NotificationResponseDto
  private NotificationResponseDto toDto(Notification notif) {
    return new NotificationResponseDto(
        notif.getId(),
        notif.getType(),
        notif.getMessage(),
        notif.getSendDate(),
        notif.isRead(),
        notif.getMembershipRequest() != null ? notif.getMembershipRequest().getId() : null
    );
  }

}
