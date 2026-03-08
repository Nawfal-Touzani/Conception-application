package be.vinci.ipl.cae.api.models.entities;

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
 * Represents a member's period of unavailability. This table allows keeping a full history of past
 * and future unavailabilities.
 */
@Entity
@Table(name = "unavailabilities")
@Getter
@Setter
@NoArgsConstructor
public class Unavailability {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private LocalDate startDate;

  @Column(nullable = false)
  private LocalDate endDate;

  // FK
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "member_id", nullable = false)
  private Member member;

  /**
   * Instantiates a new Unavailability.
   *
   * @param startDate the start date
   * @param endDate   the end date
   * @param member    the member
   */
  public Unavailability(LocalDate startDate, LocalDate endDate, Member member) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.member = member;
  }
}
