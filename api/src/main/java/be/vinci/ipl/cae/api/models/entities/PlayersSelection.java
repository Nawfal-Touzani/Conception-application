package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
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
  @JsonBackReference("match-selections")
  private Match match;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id", nullable = false)
  private Team team; // team A ou team B au moment de la selection

  /**
   * Constructs a PlayersSelection with all required fields.
   *
   * @param member the member being registered
   * @param match  the match the member is registered to
   * @param team   the team the member belongs to at the time of selection
   */
  public PlayersSelection(Member member, Match match, Team team) {
    this.id = new PlayersSelectionId(member.getId(), match.getId());
    this.member = member;
    this.match = match;
    this.team = team;
  }
}
