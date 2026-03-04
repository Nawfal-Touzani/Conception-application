package be.vinci.ipl.cae.API.models.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Getter
@Setter
@NoArgsConstructor
public class Team {
    public Team(String name, Boolean isActive, LocalDateTime creationDate, Member responsible, Member secondResponsible) {
        this.name = name;
        this.isActive = isActive;
        this.creationDate = creationDate;
        this.responsible = responsible;
        this.secondResponsible = secondResponsible;
    }

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
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "responsible_id", nullable = false)
    private Member responsible;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "second_responsible_id")
    private Member secondResponsible;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("team-teamCompositions")
    private List<TeamComposition> teamCompositions = new ArrayList<>();
}