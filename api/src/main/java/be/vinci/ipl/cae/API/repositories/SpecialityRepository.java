package be.vinci.ipl.cae.API.repositories;

import be.vinci.ipl.cae.API.models.entities.Image;
import be.vinci.ipl.cae.API.models.entities.Speciality;
import jakarta.validation.constraints.Size;
import java.util.Optional;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialityRepository extends CrudRepository<Speciality, Long> {

  Optional<Speciality> findByName(String name);
}
