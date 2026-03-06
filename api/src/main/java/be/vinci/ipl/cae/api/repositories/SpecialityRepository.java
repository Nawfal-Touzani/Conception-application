package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * The interface Speciality repository.
 */
@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {
    List<Speciality> findAll();
}
