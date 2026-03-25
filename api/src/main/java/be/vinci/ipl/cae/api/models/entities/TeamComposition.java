package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Team composition.
 */
@Entity
@Table(name = "team_compositions")
@Getter
@Setter
@NoArgsConstructor
public class TeamComposition {
  @EmbeddedId
  private TeamCompositionId id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId("memberId")
  @JoinColumn(name = "member_id", nullable = false)
  @JsonBackReference("member-teamComposition")
  private Member member;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @MapsId("teamId")
  @JoinColumn(name = "team_id", nullable = false)
  @JsonBackReference("team-teamCompositions")
  private Team team;

  @Column(name = "date_entry", nullable = false)
  private LocalDateTime dateEntry;

  /**
   * Instantiates a new Team composition.
   *
   * @param member    the member
   * @param team      the team
   * @param dateEntry the date entry
   */
  public TeamComposition(Member member, Team team, LocalDateTime dateEntry) {
    this.id = new TeamCompositionId(member.getId(), team.getId());
    this.member = member;
    this.team = team;
    this.dateEntry = dateEntry;
  }
}