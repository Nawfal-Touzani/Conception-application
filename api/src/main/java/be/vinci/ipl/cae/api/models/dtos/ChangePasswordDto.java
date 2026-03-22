package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;

/**
 * Dto to update the password.
 */
public record ChangePasswordDto(

    @NotBlank String oldPassword,

    @NotBlank String newPassword,

    @NotBlank String confirmPassword
) {}
