package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.services.SpecialityService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing specialities.
 */
@RestController
@RequestMapping("/specialities")
public class SpecialityController {

  private final SpecialityService specialityService;

  /**
   * Constructs a SpecialityController with the given SpecialityService.
   *
   * @param specialityService the service used to handle speciality logic
   */
  public SpecialityController(SpecialityService specialityService) {
    this.specialityService = specialityService;
  }

  /**
   * Gets all the specialities.
   *
   * @return a list of all specialities
   */
  @GetMapping
  public List<Speciality> readAll() {
    return specialityService.readAll();
  }
}
