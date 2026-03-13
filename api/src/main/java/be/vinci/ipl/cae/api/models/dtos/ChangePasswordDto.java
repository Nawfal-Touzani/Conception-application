package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * Dto to update the password.
 */
@Getter
@Setter
public class ChangePasswordDto {

  @NotBlank
  private String oldPassword;

  @NotBlank
  private String newPassword;

  @NotBlank
  private String confirmPassword;
}
