package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Registration entity.
 */
@Entity
@Table(name = "registrations")
@Getter
@Setter
@NoArgsConstructor
public class Registration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @JsonFormat(pattern = "yyyy-MM-dd")
  @Column(nullable = false)
  private LocalDate registrationDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "tournament_id", nullable = false)
  @JsonBackReference("tournament-registration")
  private Tournament tournament;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id", nullable = false)
  @JsonBackReference("team-registration")
  private Team team;

  /**
   * Registration constructor.
   */
  public Registration(LocalDate registrationDate, Tournament tournament, Team team) {
    this.registrationDate = registrationDate;
    this.tournament = tournament;
    this.team = team;
  }

}
