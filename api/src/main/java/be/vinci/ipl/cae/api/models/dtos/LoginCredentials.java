package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Record representing the login credentials of a user.
 *
 * @param email    the email address of the user, must not be blank and must be a valid email
 * @param password the password of the user, must not be blank
 */
public record LoginCredentials(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
