package be.vinci.ipl.cae.api.models.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * MembershipRequest entity.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "membership_requests")

public class MembershipRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idRequest;
  @Column(nullable = false)
  private LocalDateTime requestDate = LocalDateTime.now();
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private State state;
  @Column(length = 200)
  private String refusalReason;
  private LocalDateTime processingDate;
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member", nullable = false)
  @JsonBackReference("member-requests")
  private Member member;
  @OneToMany(mappedBy = "membershipRequest", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference("request-notifications")
  private List<Notification> notifications = new ArrayList<>();

  /**
   * MembershipRequest constructor.
   *
   * @param state          the state
   * @param refusalReason  the refusal reason
   * @param processingDate the processing date
   */
  public MembershipRequest(State state, String refusalReason, LocalDateTime processingDate) {
    this.state = state;
    this.refusalReason = refusalReason;
    this.processingDate = processingDate;
  }

  /**
   * State enumeration.
   */
  public enum State {
    /**
     * Pending state.
     */
    PENDING,
    /**
     * Accepted state.
     */
    ACCEPTED,
    /**
     * Refused state.
     */
    REFUSED
  }

}