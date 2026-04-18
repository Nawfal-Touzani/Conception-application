package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Request DTO sent by the responsible when validating the player selection.
 * Exactly 4 member IDs must be provided.
 * Service-side validation ensures all members belong to the team
 * and are available for the match date.
 */
public record SelectionRequest(
    @NotNull @Size(min = 4, max = 4) List<Long> memberIds
) {}
