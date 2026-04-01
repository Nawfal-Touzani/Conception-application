package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.repositories.ImageRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The type Image service test.
 */
@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

  @Mock
  private ImageRepository imageRepository;

  @InjectMocks
  private ImageService imageService;

  private Image image1;
  private Image image2;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    image1 = new Image();
    image1.setId(1L);
    image1.setUrl("avatar01.png");

    image2 = new Image();
    image2.setId(2L);
    image2.setUrl("avatar02.png");
  }

  /**
   * Gets all images.
   */
  @Test
  void getAllImages() {
    // Arrange
    when(imageRepository.findAll()).thenReturn(Arrays.asList(image1, image2));

    // Act
    List<Image> result = imageService.readAll();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("avatar01.png", result.getFirst().getUrl());

    // Verify
    verify(imageRepository, times(1)).findAll();
  }

  /**
   * Gets all images no data equals empty list.
   */
  @Test
  void getAllImagesNoDataEqualsEmptyList() {
    // Arrange
    when(imageRepository.findAll()).thenReturn(Collections.emptyList());

    // Act
    List<Image> result = imageService.readAll();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(imageRepository, times(1)).findAll();
  }
}
