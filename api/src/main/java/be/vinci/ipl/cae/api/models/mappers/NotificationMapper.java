package be.vinci.ipl.cae.api.models.mappers;

import be.vinci.ipl.cae.api.models.dtos.NotificationResponseDto;
import be.vinci.ipl.cae.api.models.entities.Notification;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for Notification entities to DTOs.
 */
@Component
public class NotificationMapper {

  /**
   * Maps a single Notification to NotificationResponseDto.
   */
  public NotificationResponseDto toDto(Notification notif) {
    return new NotificationResponseDto(
        notif.getId(),
        notif.getType(),
        notif.getMessage(),
        notif.getSendDate(),
        notif.isRead(),
        notif.getMembershipRequest() != null ? notif.getMembershipRequest().getId() : null,
        notif.getMembershipRequest() != null ? notif.getMembershipRequest().getState().name()
            : null,
        notif.getMatch() != null ? notif.getMatch().getId() : null
    );
  }

  /**
   * Maps an Iterable of Notifications to List of NotificationResponseDto.
   */
  public List<NotificationResponseDto> toDtoList(Iterable<Notification> notifications) {
    return ((List<Notification>) notifications).stream()
        .map(this::toDto)
        .toList();
  }
}
