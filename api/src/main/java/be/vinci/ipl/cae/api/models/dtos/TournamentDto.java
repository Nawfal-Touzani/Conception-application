package be.vinci.ipl.cae.api.models.dtos;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDate;

/**
 * DTO used to create a tournament.
 */
public record TournamentDto(
    String name,
    String description,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate registrationDeadline,
    int maxParticipant
) {

}