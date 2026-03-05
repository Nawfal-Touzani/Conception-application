package be.vinci.ipl.cae.API.repositories;

import be.vinci.ipl.cae.API.models.entities.Image;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImageRepository extends CrudRepository<Image, Long> {
}
