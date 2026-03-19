package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Tournament repository.
 */
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
}