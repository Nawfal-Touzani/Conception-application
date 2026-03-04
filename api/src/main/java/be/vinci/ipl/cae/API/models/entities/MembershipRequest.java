package be.vinci.ipl.cae.demo.models.entities;

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

@Entity
@Table(name="membership_requests")

public class MembershipRequest {

  public MembershipRequest() {}

  public enum State{
    PENDING,ACCEPTED,REFUSED
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idRequest;

  @Column(nullable = false)
  private LocalDateTime requestDate;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private State state;


  private String refusalReason;

  @Column(nullable = false)
  private LocalDateTime processingDate;

  public MembershipRequest( LocalDateTime requestDate, State state,
      String refusalReason,
      LocalDateTime processingDate) {

    this.requestDate = requestDate;
    this.state = state;
    this.refusalReason = refusalReason;
    this.processingDate = processingDate;
  }


  public LocalDateTime getRequestDate() {
    return requestDate;
  }

  public void setRequestDate(LocalDateTime requestDate) {
    this.requestDate = requestDate;
  }

  public State getState() {
    return state;
  }

  public void setState(State state) {
    this.state = state;
  }

  public String getRefusalReason() {
    return refusalReason;
  }

  public void setRefusalReason(String refusalReason) {
    this.refusalReason = refusalReason;
  }

  public LocalDateTime getProcessingDate() {
    return processingDate;
  }

  public void setProcessingDate(LocalDateTime processingDate) {
    this.processingDate = processingDate;
  }

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member", nullable = false)
  @JsonBackReference("member-requests")
  private Member member;

 @OneToMany(mappedBy = "membershipRequest",cascade = CascadeType.ALL,orphanRemoval = true)
  @JsonManagedReference("request-notifications")
  private List<Notification> notifications =new ArrayList<>();

  public List<Notification> getNotifications() {
    return notifications;
  }


  //manque equipe
}
