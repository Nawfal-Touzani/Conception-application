package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

/**
 * Represents a member's period of unavailability.
 * This table allows keeping a full history of past and future unavailabilities.
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

  public Unavailability(LocalDate startDate, LocalDate endDate, Member member) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.member = member;
  }
}
