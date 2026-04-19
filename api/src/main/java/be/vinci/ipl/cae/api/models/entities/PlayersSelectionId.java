package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Composite primary key for the PlayersSelection entity.
 * Uniqueness is guaranteed by combining a member ID and a match ID,
 * ensuring a player can only register once per match.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class PlayersSelectionId implements Serializable {

  private Long memberId;
  private Long matchId;

  /**
   * Constructs a composite key with the given member and match IDs.
   *
   * @param memberId the ID of the member
   * @param matchId  the ID of the match
   */
  public PlayersSelectionId(Long memberId, Long matchId) {
    this.memberId = memberId;
    this.matchId = matchId;
  }

  // must define equals / hashCode (Hibernate cache comparaison)
  @Override
  public boolean equals(Object o) {
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    PlayersSelectionId that = (PlayersSelectionId) o;
    return Objects.equals(memberId, that.memberId) && Objects.equals(matchId,
        that.matchId);
  }

  @Override
  public int hashCode() {
    int result = Objects.hashCode(memberId);
    result = 31 * result + Objects.hashCode(matchId);
    return result;
  }
}
