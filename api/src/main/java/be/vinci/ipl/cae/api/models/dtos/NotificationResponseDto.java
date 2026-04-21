package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import java.time.LocalDateTime;

/**
 * Notification response DTO.
 */
public record NotificationResponseDto(
    Long id,
    Type type,
    String message,
    LocalDateTime sendDate,
    boolean read,
    Long membershipRequestId,
    String requestState,
    Long matchId
) {

}