package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service handling operations related to images.
 */
@Service
public class ImageService {

  private final ImageRepository imageRepository;

  /**
   * Constructs an ImageService with the given ImageRepository.
   *
   * @param imageRepository the repository for image persistence and lookup
   */
  public ImageService(ImageRepository imageRepository) {
    this.imageRepository = imageRepository;
  }

  /**
   * Retrieves all available images.
   *
   * @return a list of all images
   */
  public List<Image> readAll() {
    return imageRepository.findAll();
  }
}
