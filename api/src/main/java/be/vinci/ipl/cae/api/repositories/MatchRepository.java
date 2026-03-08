package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Match;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Match repository.
 */
public interface MatchRepository extends JpaRepository<Match, Long> {
}