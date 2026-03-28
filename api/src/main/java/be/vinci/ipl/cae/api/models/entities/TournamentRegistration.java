package be.vinci.ipl.cae.api.models.entities;

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
 * Represents a team registration in a tournament (inscriptions_tournois).
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "inscriptions_tournois")
public class TournamentRegistration {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  @JsonFormat(pattern = "yyyy-MM-dd")
  private LocalDate registrationDate;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_equipe", nullable = false)
  private Team team;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_tournoi", nullable = false)
  private Tournament tournament;

  /**
   * Constructor for TournamentRegistration.
   *
   * @param registrationDate the date the team registered
   * @param team             the team that registered
   * @param tournament       the tournament the team registered for
   */
  public TournamentRegistration(LocalDate registrationDate, Team team,
                                Tournament tournament) {
    this.registrationDate = registrationDate;
    this.team = team;
    this.tournament = tournament;
  }

}