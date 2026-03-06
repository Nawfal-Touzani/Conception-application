package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginCredentials(
        @NotBlank @Email String email,
        @NotBlank String password
) {}
