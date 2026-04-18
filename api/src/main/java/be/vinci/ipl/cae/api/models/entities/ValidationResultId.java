package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Composite primary key for the ValidationResult entity.
 * Uniqueness is guaranteed by combining a match ID and a team ID,
 * ensuring each team can only have one validation entry per match.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class ValidationResultId implements Serializable {

  private Long matchId;
  private Long teamId;

  /**
   * Constructs a composite key with the given match and team IDs.
   *
   * @param matchId the ID of the match
   * @param teamId  the ID of the team
   */
  public ValidationResultId(Long matchId, Long teamId) {
    this.matchId = matchId;
    this.teamId = teamId;
  }

  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    ValidationResultId that = (ValidationResultId) o;
    return Objects.equals(matchId, that.matchId) && Objects.equals(teamId,
        that.teamId);
  }

  @Override
  public int hashCode() {
    int result = Objects.hashCode(matchId);
    result = 31 * result + Objects.hashCode(teamId);
    return result;
  }
}
