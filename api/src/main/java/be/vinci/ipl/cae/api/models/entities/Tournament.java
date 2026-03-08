package be.vinci.ipl.cae.api.models.entities;

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
 * Tournament entity.
 */

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "tournaments")

public class Tournament {

  /**
   * Tournament status.
   */
  public enum Status {
    PREPARATION, IN_PROGRESS, FINISHED, CANCELLED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  @Column(nullable = false)
  private String name;

  private String description;

  @Column(nullable = false)
  private LocalDateTime startDate;

  @Column(nullable = false)
  private LocalDateTime endDate;

  private LocalDateTime registrationDeadline;

  private Integer maxParticipants;

  // FK
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "organizer_id", nullable = false)
  private Member organizer;

  @OneToMany(mappedBy = "tournament", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("tournament-notifications")
  private List<Notification> notifications = new ArrayList<>();

  // @OneToMany(mappedBy = "tournament")
  // private List<Match> matches = new ArrayList<>();

  /**
   * Constructor for Tournament.
   *
   * @param status               tournament status
   * @param name                 tournament name
   * @param description          tournament description
   * @param startDate            start date
   * @param endDate              end date
   * @param registrationDeadline registration deadline
   * @param maxParticipants      maximum number of participants
   * @param organizer            organizer member
   */
  public Tournament(Status status,
      String name,
      String description,
      LocalDateTime startDate,
      LocalDateTime endDate,
      LocalDateTime registrationDeadline,
      Integer maxParticipants,
      Member organizer) {

    this.status = status;
    this.name = name;
    this.description = description;
    this.startDate = startDate;
    this.endDate = endDate;
    this.registrationDeadline = registrationDeadline;
    this.maxParticipants = maxParticipants;
    this.organizer = organizer;
  }
}