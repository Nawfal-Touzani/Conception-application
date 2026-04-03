package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Dto to update the password.
 */
public record ChangePasswordDto(

    @NotBlank String oldPassword,

    @NotBlank
    @Pattern(regexp = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$",
        message = "Le mot de passe doit contenir au moins 8 caractères, "
            + "une majuscule, une minuscule, un chiffre et un caractère spécial.")
    String newPassword,

    @NotBlank String confirmPassword
){}
