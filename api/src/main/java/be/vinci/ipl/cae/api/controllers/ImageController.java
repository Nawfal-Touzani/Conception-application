package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.services.ImageService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing images.
 */
@RestController
@RequestMapping("/images")
public class ImageController {

  private final ImageService imageService;

  /**
   * Constructs an ImageController with the given ImageService.
   *
   * @param imageService the service used to handle image logic
   */
  public ImageController(ImageService imageService) {
    this.imageService = imageService;
  }

  /**
   * Gets all the images.
   *
   * @return a list of all images
   */
  @GetMapping
  public List<Image> readAll() {
    return imageService.readAll();
  }
}
