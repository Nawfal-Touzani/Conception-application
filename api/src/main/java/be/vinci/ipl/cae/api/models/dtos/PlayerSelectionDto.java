package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;

/**
 * DTO representing a selected player in a match lineup.
 * The tag#id format (e.g. "Tag7#001") is reconstructed on the front
 * using tag + id fields.
 */
public record PlayerSelectionDto(
    @NotNull Long id,
    @NotNull String tag,
    @NotNull String imageUrl
) {}
