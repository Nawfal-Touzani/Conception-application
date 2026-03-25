package be.vinci.ipl.cae.api.models.dtos;

import java.time.LocalDate;

/**
 * Tournament dto.
 */
public record TournamentDto(
    String name,
    String description,
    LocalDate startDate,
    LocalDate endDate,
    LocalDate registrationDeadline,
    Integer maxParticipant
) {}
