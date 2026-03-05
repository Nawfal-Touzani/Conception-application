package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
   * @param email      the email
   * @param password   the password
   * @param tag        the tag
   * @param isAdmin    the is admin
   * @param image      the image
   * @param speciality the speciality
   */
  public Member(String email, String password, String tag, boolean isAdmin, Image image,
      Speciality speciality) {
    this.email = email;
    this.password = password;
    this.tag = tag;
    this.isAdmin = isAdmin;
    this.image = image;
    this.speciality = speciality;
  }
}
