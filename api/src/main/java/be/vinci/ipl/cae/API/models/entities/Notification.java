package be.vinci.ipl.cae.API.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


/**
 * Notification entity.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notifications")

public class Notification {

  /**
   * Type enumeration.
   */
  public enum Type {
    TOURNAMENT, MATCH, RESULT, MEMBERSHIP_REQUEST, RESULT_CONFIRMATION
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idNotification;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Type type;

  @Column(nullable = false,length = 200)
  private String message;

  @Column(nullable = false)
  private LocalDateTime sendDate;

  @Column(nullable = false)
  private boolean read = false;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member", nullable = false)
  @JsonBackReference("member-notifications")
  private Member member;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_request")
  @JsonBackReference("request-notifications")
  private MembershipRequest membershipRequest;

  /**
   *Notification constructor.
   */
  public Notification(Type type, String message, LocalDateTime sendDate) {
    this.type = type;
    this.message = message;
    this.sendDate = sendDate;

  }

}
