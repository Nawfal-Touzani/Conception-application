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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

  // Constructor
  public Member(String email, String password, String tag, boolean isAdmin, LocalDateTime profileCreationDateTime, Image image, Speciality speciality) {
    this.email = email;
    this.password = password;
    this.tag = tag;
    this.isAdmin = isAdmin;
    this.profileCreationDateTime = profileCreationDateTime;
    this.image = image;
    this.speciality = speciality;

  }
}
