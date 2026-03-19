package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SpecialityServiceTest {

  @Mock
  private SpecialityRepository specialityRepository;

  @InjectMocks
  private SpecialityService specialityService;

  private Speciality sp1;
  private Speciality sp2;

  @BeforeEach
  void setUp() {
    sp1 = new Speciality();
    sp1.setId(1L);
    sp1.setName("Kamehameha");

    sp2 = new Speciality();
    sp2.setId(2L);
    sp2.setName("Gum Gum Bazooka");
  }

  @Test
  void getAllSpecialities() {
    // Arrange
    when(specialityRepository.findAll()).thenReturn(Arrays.asList(sp1, sp2));

    // Act
    List<Speciality> result = specialityService.readAll();

    // Assert
    assertNotNull(result);
    assertEquals(2, result.size());
    assertEquals("Kamehameha", result.getFirst().getName());
    verify(specialityRepository, times(1)).findAll();
  }

  @Test
  void getAllSpecialitiesNoDataEqualsEmptyList() {
    // Arrange
    when(specialityRepository.findAll()).thenReturn(Collections.emptyList());

    // Act
    List<Speciality> result = specialityService.readAll();

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(specialityRepository, times(1)).findAll();
  }
}
