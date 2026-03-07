package be.vinci.ipl.cae.API.models.dtos;

import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Member profile DTO.
 */
@Data
@NoArgsConstructor
public class MemberProfileResponseDTO {
  private String email;
  private String tag;
  private String speciality;
  private String teamName;
  private String profileImage;
  private LocalDate creationDate;
}
