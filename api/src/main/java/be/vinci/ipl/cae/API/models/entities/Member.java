package be.vinci.ipl.cae.API.models.entities;

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
 * Member entity.
 */
@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "members")

public class Member {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idMember;

  @Column(nullable = false, unique = true)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false, length = 50)
  private String tag;

  private Boolean isAvailable;

  private boolean isAdmin = false;

  private LocalDateTime profileCreationDate;



    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_id", nullable = false)
    private Image image;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "speciality_id", nullable = false)
    private Speciality speciality;

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-notifications")
  private List<Notification> notifications = new ArrayList<>();

  @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("member-requests")
  private List<MembershipRequest> membershipRequests = new ArrayList<>();

  /**
   * Member constructor.
   */
  public Member(String email, String password, String tag, Boolean isAvailable, boolean isAdmin,
      LocalDateTime profileCreationDate, Image image, Speciality speciality) {
    this.email = email;
    this.password = password;
    this.tag = tag;
    this.isAvailable = isAvailable;
    this.isAdmin = isAdmin;
    this.profileCreationDate = profileCreationDate;
    this.image = image;
    this.speciality = speciality;
  }
}
