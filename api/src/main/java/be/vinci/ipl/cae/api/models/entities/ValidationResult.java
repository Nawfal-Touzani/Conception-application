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
 * Represents a team's validation of a match result.
 * Each team (A or B) has exactly one entry per match.
 * The hasAlreadyContested flag acts as an irreversible lock
 * to prevent a team from contesting more than once.
 */
@Entity
@Table(name = "validation_results")
@Getter
@Setter
@NoArgsConstructor
public class ValidationResult {

  @EmbeddedId
  private ValidationResultId id;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("matchId")
  @JoinColumn(name = "match_id", nullable = false)
  @JsonBackReference("match-validations")
  private Match match;

  @ManyToOne(fetch = FetchType.LAZY)
  @MapsId("teamId")
  @JoinColumn(name = "team_id", nullable = false)
  private Team team;

  @Column(name = "is_validated")
  private boolean isValidated; // pas encore repondu ? Pas de creation dans la DB

  @Column(name = "has_already_contested", nullable = false)
  private boolean hasAlreadyContested = false; // utilisation unique, irreversible

  @Column(name = "validation_date")
  private LocalDateTime validationDate;
}
