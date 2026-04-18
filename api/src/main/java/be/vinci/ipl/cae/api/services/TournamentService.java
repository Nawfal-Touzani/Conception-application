package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.HomepageTournamentsDto;
import be.vinci.ipl.cae.api.models.dtos.MatchResponseDto;
import be.vinci.ipl.cae.api.models.dtos.PlanningRequest;
import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRegistrationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
  private final MatchRepository matchRepository;     // AJOUT
  private final TeamRepository teamRepository;       // AJOUT

  /**
   * Instantiates a new Tournament service.
   *
   * @param tournamentRepository   the tournament repository
   * @param registrationRepository the registration repository
   * @param memberRepository       the member repository
   * @param notificationService    the notification service
   * @param matchRepository        the match repository
   * @param teamRepository         the team repository
   */
  public TournamentService(TournamentRepository tournamentRepository,
      TournamentRegistrationRepository registrationRepository,
      MemberRepository memberRepository,
      NotificationService notificationService,
      MatchRepository matchRepository,    // AJOUT
      TeamRepository teamRepository) {    // AJOUT
    this.tournamentRepository = tournamentRepository;
    this.registrationRepository = registrationRepository;
    this.memberRepository = memberRepository;
    this.notificationService = notificationService;
    this.matchRepository = matchRepository;    // AJOUT
    this.teamRepository = teamRepository;      // AJOUT
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
    if (dto.startDate().isBefore(LocalDate.now()) || dto.endDate().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Dates must be in the future not in past");
    }

    if (dto.registrationDeadline().isBefore(LocalDate.now())) {
      throw new IllegalArgumentException("Registration deadline must be in the future");
    }

    validateTournamentDto(dto);
    Tournament tournament = getTournamentInPreparation(id);
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
  public TournamentResponseDto publishTournament(Long id) {
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

    return toResponseDto(saved);
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

  /**
   * Updates the planning (rounds and phase) of a specific tournament.
   *
   * @param id  the tournament id
   * @param dto the planning request
   * @return the updated tournament
   */
  @Transactional
  public Tournament updatePlanning(long id, PlanningRequest dto) {
    Tournament t = tournamentRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));

    // "published" → on pase le tournoi IN_PROGRESS
    if ("published".equals(dto.getPhase())) {
      t.setStatus(Tournament.Status.IN_PROGRESS);
    }

    if ("confirmed".equals(dto.getPhase()) || "published".equals(dto.getPhase())) {

      // Supprime les anciens matchs pour éviter les doublons si re-confirmation
      matchRepository.deleteByTournament(t);

      if (dto.getRounds() != null) {
        List<List<Match>> savedRounds = new ArrayList<>();

        for (int r = 0; r < dto.getRounds().size(); r++) {
          PlanningRequest.RoundDto round = dto.getRounds().get(r);
          List<Match> savedMatchesInRound = new ArrayList<>();

          if (round.getMatches() == null) {
            savedRounds.add(savedMatchesInRound);
            continue;
          }

          for (int m = 0; m < round.getMatches().size(); m++) {
            PlanningRequest.MatchDto matchDto = round.getMatches().get(m);

            // Skip les placeholders "?" (vainqueurs pas encore connus)
            if ("?".equals(matchDto.getTeam1()) || "?".equals(matchDto.getTeam2())) {
              savedMatchesInRound.add(null);
              continue;
            }

            Team teamA = teamRepository.findByName(matchDto.getTeam1())
                .orElseThrow(() -> new NoSuchElementException(
                    "Team not found: " + matchDto.getTeam1()));
            Team teamB = teamRepository.findByName(matchDto.getTeam2())
                .orElseThrow(() -> new NoSuchElementException(
                    "Team not found: " + matchDto.getTeam2()));

            Match match = new Match();
            match.setTournament(t);
            match.setRoundNumber(r + 1);
            match.setTeamA(teamA);
            match.setTeamB(teamB);
            match.setState(Match.MatchState.SCHEDULED);
            match.setResultStatus(Match.ResultStatus.NOT_ENTERED);
            match.setDateTime(LocalDateTime.now());

            savedMatchesInRound.add(matchRepository.save(match));
          }

          savedRounds.add(savedMatchesInRound);
        }

        // Chaîne nextMatch : vainqueur de [rIdx][mIdx] → match [rIdx+1][mIdx/2]
        for (int r = 0; r < savedRounds.size() - 1; r++) {
          List<Match> currentRound = savedRounds.get(r);
          List<Match> nextRound = savedRounds.get(r + 1);

          for (int m = 0; m < currentRound.size(); m++) {
            Match current = currentRound.get(m);
            if (current == null) {
              continue;
            }

            int nextMatchIdx = m / 2;
            if (nextMatchIdx < nextRound.size() && nextRound.get(nextMatchIdx) != null) {
              current.setNextMatch(nextRound.get(nextMatchIdx));
              matchRepository.save(current);
            }
          }
        }
      }
    }

    return tournamentRepository.save(t);
  }

  /**
   * Gets matches by tournament.
   *
   * @param tournamentId the tournament id
   * @return the matches by tournament
   */
  public List<MatchResponseDto> getMatchesByTournament(long tournamentId) {
    Tournament tournament = tournamentRepository.findById(tournamentId)
        .orElseThrow(() -> new NoSuchElementException("Tournament not found"));

    return matchRepository.findByTournamentOrderByRoundNumberAsc(tournament)
        .stream()
        .map(m -> new MatchResponseDto(
            m.getId(),
            m.getRoundNumber(),
            m.getTeamA() != null ? m.getTeamA().getName() : null,
            m.getTeamB() != null ? m.getTeamB().getName() : null,
            m.getScoreA(),
            m.getScoreB(),
            m.getState(),
            m.getResultStatus(),
            m.getWinner() != null ? m.getWinner().getName() : null
        ))
        .toList();
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