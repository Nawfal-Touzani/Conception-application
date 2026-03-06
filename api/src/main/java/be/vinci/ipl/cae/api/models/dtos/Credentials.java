package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Credentials DTO for member registration requests.
 * Contains only the fields expected from the registration form.
 */
public record Credentials(
        @NotBlank @Email String email,
        @NotBlank String password,
        @NotBlank String tag,
        @NotNull Long imageId,
        @NotNull Long specialityId
) {}
