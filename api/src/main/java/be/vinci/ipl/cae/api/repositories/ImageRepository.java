package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Image;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Image entity, providing basic CRUD operations.
 */
@Repository
public interface ImageRepository extends CrudRepository<Image, Long> {

    /**
     * Finds all images.
     *
     * @return the list of all images
     */
    @Override
    List<Image> findAll();
}
