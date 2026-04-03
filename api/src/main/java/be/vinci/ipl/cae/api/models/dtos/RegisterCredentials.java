package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * RegisterCredentials DTO for member registration requests. Contains only the fields expected from
 * the registration form.
 */
public record RegisterCredentials(
        @NotBlank @Email String email,

        @NotBlank
        @Pattern(regexp = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$",
            message = "Le mot de passe doit contenir au moins 8 caractères, "
                + "une majuscule, une minuscule, un chiffre et un caractère spécial.")
        String password,

        @NotBlank String tag,
        @NotNull Long imageId,
        @NotNull Long specialityId
) {}
