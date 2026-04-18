package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ResultValidation entity.
 */
@Entity
@Table(name = "result_validation")
@IdClass(ResultValidationId.class)
@Getter
@Setter
@NoArgsConstructor
public class ResultValidation {

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_match")
  @JsonBackReference("match_validation_result")
  private Match match;

  @Id
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "team_id")
  @JsonBackReference("team_validation_result")
  private Team team;

  @Column(nullable = false)
  private Boolean isValid;

  @Column(nullable = false)
  private LocalDate validationDate;

  @Column(nullable = false)
  private Boolean hasAlreadyConstested;


}
