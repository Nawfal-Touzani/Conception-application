package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import java.util.Optional;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing specialities.
 */
@Repository
public interface SpecialityRepository extends ListCrudRepository<Speciality, Long> {

  /**
   * Finds a speciality by its name.
   *
   * @param name the name of the speciality to find.
   * @return an Optional containing the found speciality, or empty if no speciality matches the
   * name.
   */
  Optional<Speciality> findByName(String name);
}
