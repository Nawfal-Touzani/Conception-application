package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Notification DTO.
 */
public record NotificationDto(
    @NotNull Type type,
    @NotBlank @Size(max = 200) String message,
    @NotNull LocalDateTime sendDate
) {

}
