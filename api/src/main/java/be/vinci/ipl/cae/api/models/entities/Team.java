package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
 * Represents a team in the platform.
 * We find a mandatory primary responsible member and optionally a secondary responsible.
 * It is also linked to its compositions and membership requests.
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
  @OneToOne(fetch = FetchType.LAZY, optional = true)
  @JoinColumn(name = "responsible_id", nullable = true)
  @JsonIgnore
  private Member responsible;
  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "second_responsible_id")
  @JsonIgnore
  private Member secondResponsible;
  @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonIgnore
  private List<TeamComposition> teamCompositions = new ArrayList<>();
  @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonIgnore
  private List<MembershipRequest> membershipRequests = new ArrayList<>();

  /**
   * Full constructor to create a team with all essential attributes.
   *
   * @param name the unique team name (max 100 characters)
   * @param isActive indicates if the team is active (true/false)
   * @param creationDate the team creation date
   * @param responsible the primary responsible member (mandatory)
   * @param secondResponsible the secondary responsible member (optional, can be null)
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