package be.vinci.ipl.cae.api.models.entities;

import java.io.Serializable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Composite key for ResultValidation.
 */
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class ResultValidationId implements Serializable {
  private Long match;
  private Long team;
}
