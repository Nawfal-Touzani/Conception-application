package be.vinci.ipl.cae.api.models.dtos;

import java.time.LocalDateTime;

/**
 * Tournament dto.
 */
public record TournamentDto(
    String name,
    String description,
    LocalDateTime startDate,
    LocalDateTime endDate,
    LocalDateTime registrationDeadline,
    Integer maxParticipant
) {}
