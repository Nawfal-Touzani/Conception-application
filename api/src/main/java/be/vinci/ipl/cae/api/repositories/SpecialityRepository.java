package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Speciality;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing specialities.
 */
@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {

    /**
     * Finds all specialities.
     *
     * @return the list of all specialities
     */
    @Override
    List<Speciality> findAll();
}
