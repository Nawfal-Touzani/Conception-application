package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import be.vinci.ipl.cae.api.repositories.SpecialityRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service handling operations related to specialities.
 */
@Service
public class SpecialityService {

  private final SpecialityRepository specialityRepository;

  /**
   * Constructs a SpecialityService with the given SpecialityRepository.
   *
   * @param specialityRepository the repository for speciality persistence and lookup
   */
  public SpecialityService(SpecialityRepository specialityRepository) {
    this.specialityRepository = specialityRepository;
  }

  /**
   * Retrieves all available specialities.
   *
   * @return a list of all specialities
   */
  public List<Speciality> readAll() {
    return specialityRepository.findAll();
  }
}
