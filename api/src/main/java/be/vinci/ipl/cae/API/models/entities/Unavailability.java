package be.vinci.ipl.cae.API.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a member's period of unavailability.
 */
@Entity
@Table(name = "unavailabilities")
@Data
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
  @ManyToOne(optional = false)
  @JoinColumn(name = "member_id", nullable = false)
  private Member member;


}
