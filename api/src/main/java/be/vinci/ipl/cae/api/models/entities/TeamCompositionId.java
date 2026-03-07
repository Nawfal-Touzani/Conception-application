package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Team composition id.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TeamCompositionId implements Serializable {

  @Column(name = "member_id")
  private Long memberId;

  @Column(name = "team_id")
  private Long teamId;

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (!(o instanceof TeamCompositionId that)) {
      return false;
    }
    return Objects.equals(memberId, that.memberId) && Objects.equals(teamId, that.teamId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(memberId, teamId);
  }
}