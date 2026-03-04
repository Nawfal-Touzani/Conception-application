package be.vinci.ipl.cae.API.models.entities;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a game speciality (e.g., Architect, Executor, Tactician).
 * Transformed into a separate table to allow dynamic additions by administrators.
 * A member can have only one speciality.
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
     * While the application frequently needs to fetch a member's chosen speciality,
     * there is currently no use case requiring the retrieval of all members using a specific speciality.
     * Unidirectional relationship architecture is then my choice.
     */

    public Speciality(String name) {
        this.name = name;
    }
}
