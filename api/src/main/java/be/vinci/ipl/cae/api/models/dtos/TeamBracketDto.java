package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * DTO representing a team in the tournament bracket view.
 */
public record TeamBracketDto(
    @NotNull Long id,
    @NotNull String name
) {}
