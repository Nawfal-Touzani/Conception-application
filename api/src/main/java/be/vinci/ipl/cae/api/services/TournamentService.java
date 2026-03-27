package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Tournament service.
 */
@Service
public class TournamentService {

  private final TournamentRepository tournamentRepository;
  private final MemberRepository memberRepository;
  private final TournamentRegistrationRepository registrationRepository;

  /**
   * Service constructor.
   */
  public TournamentService(TournamentRepository tournamentRepository,
                           TournamentRegistrationRepository registrationRepository,
                           MemberRepository memberRepository) {
    this.tournamentRepository = tournamentRepository;
    this.registrationRepository = registrationRepository;
    this.memberRepository = memberRepository;
  }

  /**
   * Create a tournament.
   */
  public Tournament createTournament(Long organizerId, TournamentDto dto) {

    final Member organizer = memberRepository.findById(organizerId)
        .orElseThrow(() -> new NoSuchElementException("Organizer not found"));

    // Start date before end date
    if (dto.startDate().isAfter(dto.endDate())) {
      throw new IllegalArgumentException("Start date must be before end date");
    }

    // Dates must be in the future
    if (dto.startDate().isBefore(LocalDate.now())
        || dto.endDate().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Dates must be in the future");
    }

    // Registration deadline before start
    if (dto.registrationDeadline().isAfter(dto.startDate())) {
      throw new IllegalArgumentException("Registration deadline must be before start date");
    }

    // Registration deadline must not be in the past
    if (dto.registrationDeadline().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Registration deadline must be in the future");
    }

    // Max participants must be a power of two
    if (!isPowerOfTwo(dto.maxParticipant())) {
      throw new IllegalArgumentException("Max participants must be a power of two");
    }

    // Create tournament entity
    Tournament tournament = new Tournament();
    tournament.setName(dto.name());
    tournament.setDescription(dto.description());
    tournament.setStartDate(dto.startDate());
    tournament.setEndDate(dto.endDate());
    tournament.setRegistrationDeadline(dto.registrationDeadline());
    tournament.setMaxParticipants(dto.maxParticipant());
    tournament.setStatus(Status.PREPARATION);
    tournament.setOrganizer(organizer);

    return tournamentRepository.save(tournament);


  }

  private boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
  }


  /**
   * Get all tournaments.
   * If teamName is provided, returns only tournaments where that team is registered.
   * If memberTag is provided, returns only tournaments where a member with that tag
   * is part of a registered team.
   * If neither is provided, returns all tournaments.
   *
   * @param teamName  optional partial team name filter
   * @param memberTag optional partial member tag filter
   * @return list of tournament response DTOs
   */
  public List<TournamentResponseDto> getAllTournaments(String teamName, String memberTag,
                                                       boolean isAdmin) {

    List<Tournament> tournaments;

    if (teamName != null && !teamName.isBlank()) {
      // Filter by team name via inscriptions_tournois
      List<Long> ids = registrationRepository
          .findByTeamNameContainingIgnoreCase(teamName)
          .stream()
          .map(r -> r.getTournament().getId())
          .distinct()
          .toList();
      tournaments = tournamentRepository.findByIdIn(ids);

    } else if (memberTag != null && !memberTag.isBlank()) {
      // Filter by member tag — get all tournaments then filter in Java
      // via inscriptions_tournois -> team -> teamCompositions -> member.tag
      // utilisation de locale pour dire a java ds quelle language faire le lowercase
      String tagLower = memberTag.toLowerCase(Locale.ROOT);
      tournaments = tournamentRepository.findAll().stream()
          .filter(t -> registrationRepository.findByTournamentId(t.getId())
              .stream()
              .anyMatch(r -> r.getTeam().getTeamCompositions()
                  .stream()
                  .anyMatch(tc -> tc.getMember().getTag().toLowerCase(Locale.ROOT).contains(tagLower))))
          .toList();

    } else {
      tournaments = tournamentRepository.findAll();
    }

    return tournaments.stream()
        .filter(t -> {
          System.out.println("isAdmin: " + isAdmin + ", isPublic: " + t.isPublic());
          return isAdmin || t.isPublic();
        })
        .map(t -> new TournamentResponseDto(
            t.getId(),
            t.getName(),
            t.getDescription(),
            t.getStartDate(),
            t.getEndDate(),
            t.getRegistrationDeadline(),
            t.getMaxParticipants(),
            registrationRepository.countByTournamentId(t.getId()),
            t.getStatus(),
            t.getOrganizer().getTag(),
            t.isPublic()
        ))
        .toList();
  }

  /**
   * Get a tournament by id.
   *
   * @param id the tournament id
   * @return the tournament response DTO
   */
  public TournamentResponseDto getTournamentById(Long id) {
    Tournament t = tournamentRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));
    return new TournamentResponseDto(
        t.getId(),
        t.getName(),
        t.getDescription(),
        t.getStartDate(),
        t.getEndDate(),
        t.getRegistrationDeadline(),
        t.getMaxParticipants(),
        registrationRepository.countByTournamentId(t.getId()),
        t.getStatus(),
        t.getOrganizer().getTag(),
        t.isPublic()
    );
  }
}
