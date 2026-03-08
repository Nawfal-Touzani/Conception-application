package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * Data Transfer Object for member registration requests. Contains only the fields expected from the
 * registration form. Keeps the Member entity safe from direct external manipulation.
 */
@Getter
@Setter
public class MemberRegisterRequestDTO {

  @NotBlank(message = "Email is required")
  @Email(message = "Email format is invalid")
  private String email;

  @NotBlank(message = "Password is required")
  private String password;

  @NotBlank(message = "Tag is required")
  private String tag;

  @NotNull(message = "Profile image is required")
  private Long imageId;

  @NotNull(message = "Speciality is required")
  private Long specialityId;
}
