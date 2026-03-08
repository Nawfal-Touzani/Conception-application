package be.vinci.ipl.cae.api.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Create team request.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateTeamRequest {

  private String name;

  /**
   * Is invalid boolean.
   *
   * @return the boolean
   */
  public boolean isInvalid() {
    return name == null || name.isBlank();
  }
}
