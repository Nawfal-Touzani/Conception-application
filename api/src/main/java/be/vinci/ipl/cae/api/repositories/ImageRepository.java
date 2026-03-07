package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Image;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * The interface Image repository.
 */
@Repository
public interface ImageRepository extends CrudRepository<Image, Long> {

}
