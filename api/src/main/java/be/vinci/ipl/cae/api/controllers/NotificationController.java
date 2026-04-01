package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.NotificationDto;
import be.vinci.ipl.cae.api.models.dtos.NotificationResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.services.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
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
   *
   * @param notificationService the notification service
   */
  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  /**
   * Gets all notifications of a member(optional filter by read status).
   *
   * @param id            the id
   * @param read          the read
   * @param currentMember the current member
   * @return the notifications of member
   */
  @GetMapping("/{id}/notifications")
  @PreAuthorize("isAuthenticated()")
  public Iterable<NotificationResponseDto> getNotificationsOfMember(@PathVariable long id,
      @RequestParam(required = false) Boolean read,
      @AuthenticationPrincipal Member currentMember) {

    if (currentMember.getId() != id) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    try {
      Iterable<Notification> notifications = read == null
          ? notificationService.getAllNotificationByMember(id)
          : notificationService.getNotificationsByReadStatus(id, read);

      return ((List<Notification>) notifications).stream()
          .map(this::toDto)
          .toList();
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }

  }

  /**
   * Sends a notification to a member.
   *
   * @param id  the id
   * @param dto the dto
   * @return the notification response dto
   */
  @PostMapping("/{id}/notifications")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)
  public NotificationResponseDto sendNotification(@PathVariable long id,
      @Valid @RequestBody NotificationDto dto) {

    Notification notification = new Notification(dto.type(), dto.message(), dto.sendDate());

    try {
      return toDto(notificationService.send(id, notification));
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * Mark a notification as read.
   *
   * @param idMember       the id member
   * @param idNotification the id notification
   * @param currentMember  the current member
   * @return the notification response dto
   */
  @PatchMapping("/{idMember}/notifications/{idNotification}")
  @ResponseStatus(HttpStatus.OK)
  @PreAuthorize("isAuthenticated()")
  public NotificationResponseDto markNotificationAsRead(@PathVariable long idMember,
      @PathVariable long idNotification, @AuthenticationPrincipal Member currentMember) {

    if (currentMember.getId() != idMember) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    try {
      return toDto(notificationService.markNotificationRead(idNotification));
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  // conversion of nototification into NotificationResponseDto
  private NotificationResponseDto toDto(Notification notif) {
    return new NotificationResponseDto(
        notif.getId(),
        notif.getType(),
        notif.getMessage(),
        notif.getSendDate(),
        notif.isRead(),
        notif.getMembershipRequest() != null ? notif.getMembershipRequest().getId() : null,
        notif.getMembershipRequest() != null ? notif.getMembershipRequest()
            .getState().name() : null
    );
  }

}
