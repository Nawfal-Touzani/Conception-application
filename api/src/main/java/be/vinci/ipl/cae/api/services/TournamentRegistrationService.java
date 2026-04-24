package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDate;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Tournament registration service.
 */
@Service
public class TournamentRegistrationService {

  private final TournamentRegistrationRepository tournamentRegistrationRepository;
  private final TournamentRepository tournamentRepository;
  private final TeamRepository teamRepository;
  private final TeamCompositionRepository teamCompositionRepository;

  /**
   * Constructor for TournamentRegistrationService.
   *
   * @param tournamentRegistrationRepository the tournament registration repository
   * @param tournamentRepository             the tournament repository
   * @param teamRepository                   the team repository
   * @param teamCompositionRepository        the team composition repository
   */
  public TournamentRegistrationService(
      TournamentRegistrationRepository tournamentRegistrationRepository,
      TournamentRepository tournamentRepository, TeamRepository teamRepository,
      TeamCompositionRepository teamCompositionRepository) {
    this.tournamentRegistrationRepository = tournamentRegistrationRepository;
    this.tournamentRepository = tournamentRepository;
    this.teamRepository = teamRepository;
    this.teamCompositionRepository = teamCompositionRepository;
  }

  /**
   * Creates a tournament registration for a team.
   *
   * @param idTournament  the tournament id
   * @param idTeam        the team id
   * @param idResponsable the user responsible for the registration
   * @return the created registration
   */
  public TournamentRegistration createRegistration(Long idTournament, Long idTeam,
      Long idResponsable) {

    // Retrieve the tournament or throw if not found
    final Tournament tournament = tournamentRepository.findById(idTournament)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));

    // Retrieve the team or throw if not found
    final Team team = teamRepository.findById(idTeam)
        .orElseThrow(() -> new NoSuchElementException("Team not found"));

    // Check tournament status (must be in preparation phase)
    if (tournament.getStatus() != Status.PREPARATION) {
      throw new IllegalArgumentException("tournament must be in preparation status");
    }

    // Check if registration deadline has passed
    if (tournament.getRegistrationDeadline().isBefore(LocalDate.now())) {
      throw new IllegalStateException("the registration date is past");
    }

    // Check if tournament is public
    if (!tournament.isPublic()) {
      throw new IllegalArgumentException("Tournament is not public yet");
    }

    // Check if team is already registered
    if (tournamentRegistrationRepository.existsByTeamIdAndTournamentId(idTeam, idTournament)) {
      throw new IllegalArgumentException("the team is already in that tournament");
    }

    // Check if tournament is full
    int currentParticipants = tournamentRegistrationRepository.countByTournamentId(idTournament);
    if (tournament.getMaxParticipants() <= currentParticipants) {
      throw new IllegalStateException("the maximum of participant is complete");
    }

    // Check if the team has 4 member minimum.
    int sizeTeam = teamCompositionRepository.countByTeamId(idTeam);
    if (sizeTeam < 4) {
      throw new IllegalArgumentException("the must have at least 4 member");
    }

    // Check if the member is the responsible or second responsible in the team
    if (!team.getResponsible().getId().equals(idResponsable) && (team.getSecondResponsible() == null
        || !team.getSecondResponsible().getId().equals(idResponsable))) {
      throw new IllegalArgumentException(
          "Only the responsible or second responsible can register the team");
    }
    TournamentRegistration tournamentRegistration = new TournamentRegistration(LocalDate.now(),
        team, tournament);
    TournamentRegistration saved = tournamentRegistrationRepository.save(tournamentRegistration);

    int updatedCount = tournamentRegistrationRepository.countByTournamentId(idTournament);
    if (updatedCount >= tournament.getMaxParticipants()) {
      tournament.setStatus(Status.UPCOMING);
      tournamentRepository.save(tournament);
    }

    return saved;
  }

}
