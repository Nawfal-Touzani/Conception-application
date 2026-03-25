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
@Table(name = "matchs")
public class Match {

  /**
   *Match state.
   */
  public enum MatchState {
    SCHEDULED,
    PLAYED,
    CANCELED,
    FORFEIT
  }

  /**
   * Result validation state.
   */
  public enum ResultStatus {
    NOT_ENTERED,
    PENDING,
    VALIDATED,
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
  @JoinColumn(name = "id_team_A")
  private Team teamA;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_team_B")
  private Team teamB;

  @Column(name = "round_number", nullable = false)
  private Integer roundNumber;

  @Column(name = "date_time", nullable = false)
  private LocalDateTime dateTime;
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private MatchState state;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_responsible_admin")
  private Member responsibleAdmin;

  @Column(name = "score_A")
  private Integer scoreA;

  @Column(name = "score_B")
  private Integer scoreB;

  @Enumerated(EnumType.STRING)
  @Column(name = "result_statut")
  private ResultStatus resultStatus;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "winner")
  private Team winner;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "next_game")
  private Match nextMatch;

  @OneToMany(mappedBy = "match", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("match-notifications")
  private List<Notification> notifications = new ArrayList<>();

}