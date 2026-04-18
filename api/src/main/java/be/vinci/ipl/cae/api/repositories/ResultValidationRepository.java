package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.ResultValidation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Banishment entity, providing basic CRUD operations.
 */
public interface ResultValidationRepository extends JpaRepository<ResultValidation, Long> {

  /**
   *Find a match id and team id.
   */
  Optional<ResultValidation> findByMatchIdAndTeamId(Long idMatch, Long idTeam);

  /**
   *Find all match by match id.
   */
  List<ResultValidation> findAllByMatchId(Long matchId);

}
