package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import org.springframework.data.repository.CrudRepository;

/**
 * Match repository.
 */
public interface MatchRepository extends CrudRepository<Match, Long> {
}