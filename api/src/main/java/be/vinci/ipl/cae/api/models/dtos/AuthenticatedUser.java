package be.vinci.ipl.cae.api.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthenticatedUser DTO.
 */
@Data
@NoArgsConstructor
public class AuthenticatedUser {

  private String username;
  private String token;
}
