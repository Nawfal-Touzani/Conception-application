package be.vinci.ipl.cae.demo.models.entities;

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

/**
 * Notification entity
 */
@Entity
@Table(name = "notifications")


public class Notification {

  public Notification() {}

  public enum Type{
    TOURNOI,MATCH,RESULTAT,DEMANDE_ADHESION,CONFIRMATION_RESULTAT
  }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idNotification;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private Type type;

  @Column(nullable = false)
  private String message;

  @Column(nullable = false)
  private LocalDateTime sendDate;

  @Column(nullable = false)
  private Boolean isRead=false;


  public Notification(Type type, String message, LocalDateTime sendDate,
      Boolean isRead, Member member) {

    this.type = type;
    this.message = message;
    this.sendDate = sendDate;
    this.isRead = isRead;
    this.member = member;
  }


  public Type getType() {
    return type;
  }

  public void setType(Type type) {
    this.type = type;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public LocalDateTime getSendDate() {
    return sendDate;
  }

  public void setSendDate(LocalDateTime sendDate) {
    this.sendDate = sendDate;
  }

  public Boolean getRead() {
    return isRead;
  }

  public void setRead(Boolean read) {
    isRead = read;
  }

  public Member getMember() {
    return member;
  }

  public void setMember(Member member) {
    this.member = member;
  }

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_member",nullable = false)
  @JsonBackReference("member-notifications")
  private Member member;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_request",nullable = false)
  @JsonBackReference("request-notifications")
  private MembershipRequest membershipRequest;



}
