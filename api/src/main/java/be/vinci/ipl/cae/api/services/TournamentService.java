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
   *
   * @return list of tournament response DTOs
   */
  public List<TournamentResponseDto> getAllTournaments() {
    return tournamentRepository.findAll().stream()
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
            t.getOrganizer().getTag()
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
        t.getOrganizer().getTag()
    );
  }
}
