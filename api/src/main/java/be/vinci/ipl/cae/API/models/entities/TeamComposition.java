package be.vinci.ipl.cae.API.models.entities;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_compositions")
@Getter
@Setter
@NoArgsConstructor
public class TeamComposition {

    public TeamComposition(Member member, Team team, LocalDateTime dateEntry) {
        this.member = member;
        this.team = team;
        this.dateEntry = dateEntry;
        this.memberId = member.getIdMember();
    }

    @Id
    @Column(name = "member_id")
    private Long memberId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId
    @JoinColumn(name = "member_id", nullable = false)
    @JsonBackReference("member-teamComposition")
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    @JsonBackReference("team-teamCompositions")
    private Team team;

    @Column(name = "date_entry", nullable = false)
    private LocalDateTime dateEntry;
}