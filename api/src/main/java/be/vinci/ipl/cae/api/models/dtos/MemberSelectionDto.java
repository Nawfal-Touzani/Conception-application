package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * DTO representing a team member shown in the selection popup.
 * available drives the UI: true = green dot + checkbox enabled,
 * false = red dot + checkbox disabled (black).
 */
public record MemberSelectionDto(
    @NotNull Long id,
    @NotNull String tag,
    @NotNull String imageUrl,
    @NotNull Boolean available
) {}
