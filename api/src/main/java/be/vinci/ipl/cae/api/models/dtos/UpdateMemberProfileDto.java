package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO used to update member profile.
 */
@Data
@NoArgsConstructor
public class UpdateMemberProfileDto {
  @Size(max = 50)
  private String speciality;

  private String profileImage;
}
