package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * Request DTO sent by the responsible when validating the player selection.
 * Exactly 4 member IDs must be provided.
 * Service-side validation ensures all members belong to the team
 * and are available for the match date.
 */
public record SelectionRequest(
    @NotNull
    List<Long> memberIds
) {}
