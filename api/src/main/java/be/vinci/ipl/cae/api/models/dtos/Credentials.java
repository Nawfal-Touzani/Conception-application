package be.vinci.ipl.cae.api.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Credentials DTO.
 */
@Data
@NoArgsConstructor
public class Credentials {

  private String username;
  private String password;
}
