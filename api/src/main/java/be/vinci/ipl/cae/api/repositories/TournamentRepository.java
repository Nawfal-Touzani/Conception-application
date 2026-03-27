package be.vinci.ipl.cae.api.repositories;

import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Tournament repository.
 */
@Repository
public interface TournamentRepository extends CrudRepository<Tournament, Long> {

  /**
   * Find all tournaments.
   *
   * @return all tournaments
   */
  List<Tournament> findAll();

  /**
   * Find tournaments by status.
   *
   * @param status the status to filter by
   * @return tournaments matching the status
   */
  List<Tournament> findByStatus(Status status);

  /**
   * Find tournaments starting on or after the given date.
   *
   * @param date the start date lower bound
   * @return tournaments starting on or after the date
   */
  List<Tournament> findByStartDateGreaterThanEqual(LocalDate date);

  /**
   * Find tournaments ending on or before the given date.
   *
   * @param date the end date upper bound
   * @return tournaments ending on or before the date
   */
  List<Tournament> findByEndDateLessThanEqual(LocalDate date);

  /**
   * Find tournaments within a date range.
   *
   * @param startDate the start date lower bound
   * @param endDate   the end date upper bound
   * @return tournaments within the range
   */
  List<Tournament> findByStartDateGreaterThanEqualAndEndDateLessThanEqual(
      LocalDate startDate, LocalDate endDate);

  /**
   * Find tournaments by status and within a date range.
   *
   * @param status    the status to filter by
   * @param startDate the start date lower bound
   * @param endDate   the end date upper bound
   * @return matching tournaments
   */
  List<Tournament> findByStatusAndStartDateGreaterThanEqualAndEndDateLessThanEqual(
      Status status, LocalDate startDate, LocalDate endDate);

  /**
   * Find tournaments by status and start date lower bound.
   *
   * @param status    the status
   * @param startDate the start date lower bound
   * @return matching tournaments
   */
  List<Tournament> findByStatusAndStartDateGreaterThanEqual(
      Status status, LocalDate startDate);

  /**
   * Find tournaments by status and end date upper bound.
   *
   * @param status  the status
   * @param endDate the end date upper bound
   * @return matching tournaments
   */
  List<Tournament> findByStatusAndEndDateLessThanEqual(
      Status status, LocalDate endDate);

}