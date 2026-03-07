package be.vinci.ipl.cae.api.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Represents a profile image that can be chosen by a member.
 * Several members can share the same default profile image.
 */
@Entity
@Table(name = "images")
@Getter
@Setter
@NoArgsConstructor
public class Image {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String url;

  /**
   * While the application frequently needs to fetch a member's chosen avatar,
   * there is currently no use case requiring the retrieval of all members using a specific profile image.
   * Unidirectional relationship architecture is then my choice.
   */

  public Image(String url) {
    this.url = url;
  }
}