package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO representing an authenticated member. Contains the JWT token and the minimum user info needed
 * by the frontend to render the navbar & home page.
 */
public record AuthenticatedMember(
        @NotNull Long id,
        @NotBlank String email,
        @NotBlank String tag,
        @NotBlank String role,
        @NotBlank String token
) {}
