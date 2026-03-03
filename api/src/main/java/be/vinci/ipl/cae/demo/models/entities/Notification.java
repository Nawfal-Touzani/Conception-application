package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification entity
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

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
  private Boolean isRead;


}
