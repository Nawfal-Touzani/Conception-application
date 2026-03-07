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
import java.time.LocalDateTime;
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
  private boolean isAdmin = false;

  @Column(nullable = false, updatable = false)
  private LocalDateTime profileCreationDateTime = LocalDateTime.now();

  // FK
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "image_id", nullable = false)
  private Image image;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "speciality_id", nullable = false)
  private Speciality speciality;

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-unavailabilities")
  private List<Unavailability> unavailabilities = new ArrayList<>();

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-notifications")
  private List<Notification> notifications = new ArrayList<>();

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-requests")
  private List<MembershipRequest> membershipRequests = new ArrayList<>();

  /**
   * Instantiates a new Member.
   *
   * @param email                   the email
   * @param password                the password
   * @param tag                     the tag
   * @param isAdmin                 the is admin
   * @param profileCreationDateTime the profile creation date time
   * @param image                   the image
   * @param speciality              the speciality
   * @param unavailabilities        the unavailabilities
   * @param notifications           the notifications
   * @param membershipRequests      the membership requests
   */
  public Member(String email, String password, String tag, boolean isAdmin,
      LocalDateTime profileCreationDateTime, Image image, Speciality speciality,
      List<Unavailability> unavailabilities, List<Notification> notifications,
      List<MembershipRequest> membershipRequests) {
    this.email = email;
    this.password = password;
    this.tag = tag;
    this.isAdmin = isAdmin;
    this.profileCreationDateTime = profileCreationDateTime;
    this.image = image;
    this.speciality = speciality;
    this.unavailabilities = unavailabilities;
    this.notifications = notifications;
    this.membershipRequests = membershipRequests;
  }
}
