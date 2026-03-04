package be.vinci.ipl.cae.API.repositories;

import be.vinci.ipl.cae.API.models.entities.Speciality;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {
}
