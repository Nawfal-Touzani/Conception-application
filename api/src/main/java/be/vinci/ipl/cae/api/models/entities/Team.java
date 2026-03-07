package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The type Team.
 */
@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
public class Team {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;
  @Column(nullable = false, unique = true, length = 100)
  private String name;
  @Column(nullable = false)
  private Boolean isActive = true;
  @Column(nullable = false)
  private LocalDateTime creationDate;
  // FK
  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "responsible_id", nullable = false)
  private Member responsible;
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "second_responsible_id")
  private Member secondResponsible;
  @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("team-teamCompositions")
  private List<TeamComposition> teamCompositions = new ArrayList<>();

  /**
   * Instantiates a new Team.
   *
   * @param name              the name
   * @param isActive          the is active
   * @param creationDate      the creation date
   * @param responsible       the responsible
   * @param secondResponsible the second responsible
   */
  public Team(String name, Boolean isActive, LocalDateTime creationDate, Member responsible,
      Member secondResponsible) {
    this.name = name;
    this.isActive = isActive;
    this.creationDate = creationDate;
    this.responsible = responsible;
    this.secondResponsible = secondResponsible;
  }
}