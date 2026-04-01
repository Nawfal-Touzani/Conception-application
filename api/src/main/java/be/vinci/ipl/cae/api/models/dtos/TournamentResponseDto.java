package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO returned to the frontend for a tournament.
 */
@JsonInclude(JsonInclude.Include.ALWAYS)
public record TournamentResponseDto(
    Long id,
    String name,
    String description,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
    @JsonFormat(pattern = "yyyy-MM-dd") LocalDate registrationDeadline,
    Integer maxParticipants,
    int currentParticipants,
    Status status,
    String organizerTag,
    @JsonProperty("isPublic") boolean isPublic,
    String winnerTeamName,
    List<String> registeredTeamNames
) {

}