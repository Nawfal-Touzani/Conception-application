package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO representing the full detail view of a match.
 * dateTime is returned as ISO 8601 and formatted on the front.
 * tournamentId is included to allow the front to render a back-to-tournament button.
 * lineup visibility is controlled per team via TeamMatchDto.lineupStatus.
 */
public record MatchDetailDto(
    @NotNull Long id,
    @NotNull Long tournamentId, // pour le lien retour
    @NotNull String tournamentName,
    @NotNull String roundLabel,
    @NotNull LocalDateTime dateTime,
    @NotNull String state,
    @NotNull String resultStatus,
    TeamMatchDto teamA,
    TeamMatchDto teamB,
    Integer scoreA,
    Integer scoreB,
    Long winnerId
) {}
