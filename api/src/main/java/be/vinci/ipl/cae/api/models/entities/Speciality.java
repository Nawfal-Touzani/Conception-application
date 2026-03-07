package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a game speciality (e.g., Architect, Executor, Tactician). Transformed into a separate
 * table to allow dynamic additions by administrators. A member can have only one speciality.
 */
@Entity
@Table(name = "specialities")
@Getter
@Setter
@NoArgsConstructor
public class Speciality {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String name;

  /**
   * While the application frequently needs to fetch a member's chosen speciality, there is
   * currently no use case requiring the retrieval of all members using a specific speciality.
   * Unidirectional relationship architecture is then my choice.
   *
   * @param name the name
   */
  public Speciality(String name) {
    this.name = name;
  }
}
