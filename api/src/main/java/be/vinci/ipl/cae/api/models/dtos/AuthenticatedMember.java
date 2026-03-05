package be.vinci.ipl.cae.api.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AuthenticatedMember DTO.
 */
@Data
@NoArgsConstructor
public class AuthenticatedMember {
  private Long id;
  private String email;
  private String tag;
  private String role;
  private String token;
}
