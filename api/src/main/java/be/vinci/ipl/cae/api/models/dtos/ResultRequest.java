package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Dto for service.
 *
 * @param scoreA the score of teamA
 * @param scoreB the score of teamB
 */
public record ResultRequest(
    @NotNull(message = "scoreA is required")
    @Min(value = 0, message = "scoreA cannot be negative")
    Integer scoreA,
    @NotNull(message = "scoreB is required")
    @Min(value = 0, message = "scoreB cannot be negative")
    Integer scoreB
) {}
