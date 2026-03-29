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

    if (dto.startDate().isBefore(LocalDate.now())
        || dto.endDate().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Dates must be in the future");
    }

    if (dto.registrationDeadline().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Registration deadline must be in the future");
    }

    validateTournamentDto(dto);

    Tournament tournament = new Tournament();
    applyDtoToTournament(tournament, dto);
    tournament.setStatus(Status.PREPARATION);
    tournament.setOrganizer(organizer);

    return tournamentRepository.save(tournament);
  }

  /**
   * Update a tournament (only allowed in PREPARATION status).
   */
  public Tournament updateTournament(Long id, TournamentDto dto) {
    Tournament tournament = getTournamentInPreparation(id);
    validateTournamentDto(dto);
    applyDtoToTournament(tournament, dto);
    return tournamentRepository.save(tournament);
  }

  /**
   * Publish a tournament (make it public).
   */
  public Tournament publishTournament(Long id) {
    Tournament tournament = getTournamentInPreparation(id);
    tournament.setPublic(true);
    return tournamentRepository.save(tournament);
  }

  /**
   * Get all tournaments.
   *
   * @param teamName  optional partial team name filter
   * @param memberTag optional partial member tag filter
   * @param isAdmin   whether the requester is admin
   * @return list of tournament response DTOs
   */
  public List<TournamentResponseDto> getAllTournaments(String teamName, String memberTag,
      boolean isAdmin) {
    List<Tournament> tournaments;

    if (teamName != null && !teamName.isBlank()) {
      List<Long> ids = registrationRepository
          .findByTeamNameContainingIgnoreCase(teamName)
          .stream()
          .map(r -> r.getTournament().getId())
          .distinct()
          .toList();
      tournaments = tournamentRepository.findByIdIn(ids);

    } else if (memberTag != null && !memberTag.isBlank()) {
      String tagLower = memberTag.toLowerCase(Locale.ROOT);
      tournaments = tournamentRepository.findAll().stream()
          .filter(t -> registrationRepository.findByTournamentId(t.getId())
              .stream()
              .anyMatch(r -> r.getTeam().getTeamCompositions()
                  .stream()
                  .anyMatch(tc -> tc.getMember().getTag()
                      .toLowerCase(Locale.ROOT).contains(tagLower))))
          .toList();

    } else {
      tournaments = tournamentRepository.findAll();
    }

    return tournaments.stream()
        .filter(t -> isAdmin || t.isPublic())
        .map(this::toResponseDto)
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
    return toResponseDto(t);
  }

  /**
   * Retrieve a tournament in PREPARATION status or throw.
   */
  private Tournament getTournamentInPreparation(Long id) {
    Tournament tournament = tournamentRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));
    if (tournament.getStatus() != Status.PREPARATION) {
      throw new IllegalStateException("Tournament must be in PREPARATION status");
    }
    return tournament;
  }

  /**
   * Validate tournament dates and max participants.
   */
  private void validateTournamentDto(TournamentDto dto) {
    if (dto.startDate().isAfter(dto.endDate())) {
      throw new IllegalArgumentException("Start date must be before end date");
    }
    if (dto.registrationDeadline().isAfter(dto.startDate())) {
      throw new IllegalArgumentException("Registration deadline must be before start date");
    }
    if (!isPowerOfTwo(dto.maxParticipant())) {
      throw new IllegalArgumentException("Max participants must be a power of two");
    }
  }

  /**
   * Apply DTO fields to a tournament entity.
   */
  private void applyDtoToTournament(Tournament tournament, TournamentDto dto) {
    tournament.setName(dto.name());
    tournament.setDescription(dto.description());
    tournament.setStartDate(dto.startDate());
    tournament.setEndDate(dto.endDate());
    tournament.setRegistrationDeadline(dto.registrationDeadline());
    tournament.setMaxParticipants(dto.maxParticipant());
  }

  private boolean isPowerOfTwo(int n) {
    return n > 0 && (n & (n - 1)) == 0;
  }

  private TournamentResponseDto toResponseDto(Tournament t) {
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