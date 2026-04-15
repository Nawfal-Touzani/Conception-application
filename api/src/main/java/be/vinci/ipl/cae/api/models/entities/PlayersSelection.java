package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a player's registration to a match in a tournament.
 * The primary key is composite, combining a member ID and a match ID
 * to ensure a player can only be registered once per match.
 */
@Entity
@Table(name = "players_selection")
@Getter
@Setter
@NoArgsConstructor
public class PlayersSelection {

  @EmbeddedId
  private PlayersSelectionId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("memberId") // Lie le champ de la FK à son équivalent dans PlayersSelectionId
  @JoinColumn(name = "member_id")
  private Member member;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("matchId")
  @JoinColumn(name = "match_id")
  private Match match;
}
