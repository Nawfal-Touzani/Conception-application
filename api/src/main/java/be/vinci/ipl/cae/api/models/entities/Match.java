package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Match entity.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "matches")
public class Match {

  /**
   * Match state.
   */
  public enum MatchState {
    /**
     * Scheduled match state.
     */
    SCHEDULED,
    /**
     * Played match state.
     */
    PLAYED,
    /**
     * Canceled match state.
     */
    CANCELED,
    /**
     * Forfeit match state.
     */
    FORFEIT
  }

  /**
   * Result validation state.
   */
  public enum ResultStatus {
    /**
     * Not entered result status.
     */
    NOT_ENTERED,
    /**
     * Pending result status.
     */
    PENDING,
    /**
     * Validated result status.
     */
    VALIDATED,
    /**
     * Refused result status.
     */
    REFUSED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id_match")
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_tournament", nullable = false)
  @JsonBackReference("tournament-matches")
  private Tournament tournament;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_team_a")
  private Team teamA;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_team_b")
  private Team teamB;

  @Column(name = "round_number", nullable = false)
  private Integer roundNumber;

  @Column(name = "date_time")
  private LocalDateTime dateTime;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MatchState state = MatchState.SCHEDULED;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_responsible_admin")
  private Member responsibleAdmin;

  @Column(name = "score_A")
  private Integer scoreA;

  @Column(name = "score_B")
  private Integer scoreB;

  @Enumerated(EnumType.STRING)
  @Column(name = "result_status", nullable = false)
  private ResultStatus resultStatus = ResultStatus.NOT_ENTERED;

  @Column(name = "team_a_has_already_contested", nullable = false)
  private boolean contestedByTeamA = false;

  @Column(name = "team_b_has_already_contested", nullable = false)
  private boolean contestedByTeamB = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_winner")
  private Team winner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_next_match")
  private Match nextMatch;

  @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("match-notifications")
  private List<Notification> notifications = new ArrayList<>();

  @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("match-selections")
  private List<PlayersSelection> playersSelections = new ArrayList<>();

  @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("match-validations")
  private List<ValidationResult> validationResults = new ArrayList<>();

  /**
   * Constructs a Match with the minimum required fields at creation time.
   *
   * @param tournament       the tournament this match belongs to
   * @param roundNumber      the round number in the bracket
   * @param dateTime         the scheduled date and time
   * @param responsibleAdmin the admin responsible for this match
   */
  public Match(Tournament tournament, Integer roundNumber,
      LocalDateTime dateTime, Member responsibleAdmin) {
    this.tournament = tournament;
    this.roundNumber = roundNumber;
    this.dateTime = dateTime;
    this.responsibleAdmin = responsibleAdmin;
  }
}
