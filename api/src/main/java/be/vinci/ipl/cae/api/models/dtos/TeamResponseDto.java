package be.vinci.ipl.cae.api.models.dtos;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO used to return team info to the frontend safely, avoiding circular JSON serialization issues
 * with the Team entity.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamResponseDto {

  private Long id;
  private String name;
  private String responsibleTag;       // just the tag, no nested Member object
  private String secondResponsibleTag; // null if no second responsible
  private LocalDateTime creationDate;
}