package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.HomepageTournamentsDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * The type Tournament service.
 */
@Service
public class TournamentService {

  private final TournamentRepository tournamentRepository;
  private final MemberRepository memberRepository;
  private final TournamentRegistrationRepository registrationRepository;
  private final NotificationService notificationService;

  /**
   * Instantiates a new Tournament service.
   *
   * @param tournamentRepository   the tournament repository
   * @param registrationRepository the registration repository
   * @param memberRepository       the member repository
   * @param notificationService    the notification service
   */
  public TournamentService(TournamentRepository tournamentRepository,
      TournamentRegistrationRepository registrationRepository,
      MemberRepository memberRepository,
      NotificationService notificationService) {
    this.tournamentRepository = tournamentRepository;
    this.registrationRepository = registrationRepository;
    this.memberRepository = memberRepository;
    this.notificationService = notificationService;
  }

  /**
   * Create tournament.
   *
   * @param organizerId the organizer id
   * @param dto         the dto
   * @return the tournament
   */
  public Tournament createTournament(Long organizerId, TournamentDto dto) {
    final Member organizer = memberRepository.findById(organizerId)
        .orElseThrow(() -> new NoSuchElementException("Organizer not found"));

    if (tournamentRepository.existsByName(dto.name())) {
      throw new IllegalStateException("The name of that tournament is already exist");
    }

    if (dto.startDate().isBefore(LocalDate.now()) || dto.endDate().isBefore(LocalDate.now())) {
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
   * Update tournament tournament.
   *
   * @param id  the id
   * @param dto the dto
   * @return the tournament
   */
  public TournamentResponseDto updateTournament(Long id, TournamentDto dto) {
    Tournament tournament = getTournamentInPreparation(id);

    if (dto.startDate().isBefore(LocalDate.now()) || dto.endDate().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Dates must be in the future not in past");
    }

    if (dto.registrationDeadline().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Registration deadline must be in the future");
    }

    validateTournamentDto(dto);
    int currentParticipants = registrationRepository.findByTournamentId(tournament.getId()).size();
    if (dto.maxParticipant() < currentParticipants) {
      throw new IllegalArgumentException(
          "Max participants cannot be lower than the number of registered teams"
      );
    }
    applyDtoToTournament(tournament, dto);
    Tournament saved = tournamentRepository.save(tournament);
    return toResponseDto(saved);
  }

  /**
   * Publish tournament.
   *
   * @param id the id
   * @return the tournament
   */
  public Tournament publishTournament(Long id) {
    Tournament tournament = getTournamentInPreparation(id);
    tournament.setPublic(true);
    Tournament saved = tournamentRepository.save(tournament);

    List<Member> allMembers = memberRepository.findAll();
    for (Member member : allMembers) {
      Notification notif = new Notification(
          Notification.Type.TOURNAMENT,
          "Le tournoi \"" + saved.getName() + "\" est maintenant disponible !",
          LocalDateTime.now()
      );
      notif.setTournament(saved);
      notificationService.send(member.getId(), notif);
    }

    return saved;
  }

  /**
   * Gets all tournaments.
   *
   * @param teamName  the team name
   * @param memberTag the member tag
   * @param isAdmin   the is admin
   * @return the all tournaments
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
   * Gets tournament by id.
   *
   * @param id the id
   * @return the tournament by id
   */
  public TournamentResponseDto getTournamentById(Long id) {
    Tournament t = tournamentRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));
    return toResponseDto(t);
  }

  /**
   * Gets homepage tournaments.
   *
   * @return the homepage tournaments
   */
  public HomepageTournamentsDto getHomepageTournaments() {
    TournamentResponseDto lastFinished = tournamentRepository
        .findTopByStatusOrderByEndDateDesc(Status.FINISHED)
        .map(this::toResponseDto).orElse(null);

    TournamentResponseDto inProgress = tournamentRepository
        .findFirstByStatus(Status.IN_PROGRESS)
        .map(this::toResponseDto).orElse(null);

    TournamentResponseDto nextUpcoming = tournamentRepository
        .findFirstByStatusAndIsPublicTrueOrderByStartDateAsc(Status.PREPARATION)
        .map(this::toResponseDto).orElse(null);

    return new HomepageTournamentsDto(lastFinished, inProgress, nextUpcoming);
  }

  private Tournament getTournamentInPreparation(Long id) {
    Tournament tournament = tournamentRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));
    if (tournament.getStatus() != Status.PREPARATION) {
      throw new IllegalStateException("Tournament must be in PREPARATION status");
    }
    return tournament;
  }

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
    List<String> teamNames = registrationRepository.findByTournamentId(t.getId())
        .stream()
        .map(r -> r.getTeam().getName())
        .toList();

    return new TournamentResponseDto(
        t.getId(), t.getName(), t.getDescription(),
        t.getStartDate(), t.getEndDate(), t.getRegistrationDeadline(),
        t.getMaxParticipants(),
        teamNames.size(),
        t.getStatus(), t.getOrganizer().getTag(), t.isPublic(),
        t.getWinnerTeam() != null ? t.getWinnerTeam().getName() : null,
        teamNames
    );
  }
}