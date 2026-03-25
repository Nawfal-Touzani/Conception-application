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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a user/player in the Vinci Arena platform.
 */
@Entity
@Table(name = "members")
@Getter
@Setter
@NoArgsConstructor

public class Member {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String tag;

  @Column(nullable = false)
  private Boolean isAdmin = false;

  @Column(nullable = false)
  private Boolean isBan = false;

  @Column(nullable = false, updatable = false)
  private LocalDate profileCreationDate;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "image_id", nullable = false)
  private Image image;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "speciality_id", nullable = false)
  private Speciality speciality;

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-unavailabilities")
  private List<Unavailability> unavailabilities = new ArrayList<>();

  @OneToMany(mappedBy = "organizer")
  @JsonManagedReference("member-tournaments")
  private List<Tournament> tournaments = new ArrayList<>();

  /**
   * Constructs a Member with the given details.
   *
   * @param email               the email address of the member
   * @param password            the password of the member
   * @param tag                 the display tag of the member
   * @param isAdmin             whether the member has admin privileges
   * @param image               the profile image of the member
   * @param speciality          the speciality of the member
   * @param profileCreationDate creation date of the member
   */
  public Member(String email, String password, String tag, Boolean isAdmin,
      LocalDate profileCreationDate, Image image, Speciality speciality) {
    this.email = email;
    this.password = password;
    this.tag = tag;
    this.isAdmin = isAdmin;
    this.profileCreationDate = profileCreationDate;
    this.image = image;
    this.speciality = speciality;
  }
}
