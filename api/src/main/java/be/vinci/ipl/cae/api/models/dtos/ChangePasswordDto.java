package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
  @Size(min = 5)
  private String newPassword;
}
