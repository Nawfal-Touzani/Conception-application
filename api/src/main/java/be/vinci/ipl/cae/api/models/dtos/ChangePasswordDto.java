package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Dto to update the password.
 */
public record ChangePasswordDto(

    @NotBlank String oldPassword,

    @Pattern(regexp = "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$",
        message = "Le mot de passe doit contenir moins 8 caractères,"
            + " une majuscule, une minuscule, un chiffre et un caractère spécial")
    @NotBlank String newPassword,

    @NotBlank String confirmPassword
){}
