package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a banishment of a member by an admin.
 */
@Entity
@Table(name = "banishments")
@Getter
@Setter
@NoArgsConstructor
public class Banishment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "banned_member_id", nullable = false, unique = true)
  private Member bannedMember;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "admin_id", nullable = false)
  private Member admin;

  @Column(nullable = false, updatable = false)
  private LocalDate banishmentDate;

  @Column(nullable = false)
  private String reason;

  /**
   * Constructs a Banishment with all required fields.
   *
   * @param bannedMember the member being banned
   * @param admin the admin who issued the ban
   * @param banishmentDate the date of the banishment
   * @param reason the reason for the banishment
   */
  public Banishment(Member bannedMember, Member admin, LocalDate banishmentDate, String reason) {
    this.bannedMember = bannedMember;
    this.admin = admin;
    this.banishmentDate = banishmentDate;
    this.reason = reason;
  }
}