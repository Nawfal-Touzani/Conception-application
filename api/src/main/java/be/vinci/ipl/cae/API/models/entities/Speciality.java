package be.vinci.ipl.cae.API.models.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "specialities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Speciality {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long speciality_id;

    @Column(nullable = false, unique = true)
    private String libelle;

    // FK
    @OneToMany(mappedBy = "speciality")
    private List<Member> members;
}
