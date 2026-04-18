package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.ResultValidation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Repository for Banishment entity, providing basic CRUD operations.
 */
public interface ResultValidationRepository extends JpaRepository<ResultValidation,Long> {

  Optional<ResultValidation> findByMatchIdAndTeamId(Long idMatch,Long idTeam);

  List<ResultValidation> findAllByMatchId(Long matchId);

}
