package be.vinci.ipl.cae.API.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Image entity.
 */
@Entity
@Table(name = "images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Image {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long idImage;

  @Column(nullable = false)
  private String imageUrl;

  /**
   * Images constructor.
   */
  public Image(Long idImage, String imageUrl) {
    this.idImage = idImage;
    this.imageUrl = imageUrl;
  }

  // FK
  @OneToMany(mappedBy = "image")
  private List<Member> members;
}
