package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;

/**
 * The type Match response dto.
 */
public record MatchResponseDto(
    Long id,
    int roundNumber,
    String teamA,
    String teamB,
    Integer scoreA,
    Integer scoreB,
    MatchState state,
    ResultStatus resultStatus,
    String winner
) {}