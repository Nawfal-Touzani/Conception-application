package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * DTO representing a match card in the tournament bracket tree.
 * roundLabel is computed server-side from roundNumber and totalRounds.
 * winnerId is used by the front to render the green/red bars on finished matches.
 */
public record MatchBracketDto(
    @NotNull Long id,
    @NotNull Integer roundNumber,
    @NotNull String roundLabel,
    TeamBracketDto teamA,
    TeamBracketDto teamB,
    Integer scoreA,
    Integer scoreB,
    Long winnerId,
    @NotNull String state
) {}
