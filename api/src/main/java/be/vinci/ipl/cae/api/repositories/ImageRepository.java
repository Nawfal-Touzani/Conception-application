package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Image;
import java.util.List;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Image entity, providing basic CRUD operations.
 */
@Repository
public interface ImageRepository extends CrudRepository<Image, Long> {

  /**
   * Finds all images.
   *
   * @return the list of all images
   */
  @Override
  List<Image> findAll();

  /**
   * Finds an image by its URL.
   *
   * @param url the URL of the image to find.
   * @return an Optional containing the found image, or empty if no image matches the URL.
   */
  Optional<Image> findByUrl(String url);
}
