package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * MatchService.
 */
@Service
public class MatchService {

  private final MatchRepository matchRepository;
  private final TournamentRepository tournamentRepository;
  private final NotificationService notificationService;

  /**
   * Create a new MatchService.
   *
   * @param matchRepository      match repository
   * @param tournamentRepository tournament repository
   * @param notificationService  the notification service
   */
  public MatchService(MatchRepository matchRepository,
      TournamentRepository tournamentRepository,
      NotificationService notificationService) {
    this.matchRepository = matchRepository;
    this.tournamentRepository = tournamentRepository;
    this.notificationService = notificationService;
  }

  /**
   * Encode a match result.
   *
   * @param idMatch the match id
   * @param dto     the score of the match
   * @return the updated match
   */
  public Match encodingResult(Long idMatch, ResultRequest dto) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found"));

    if (match.getState().equals(MatchState.CANCELED)
        || match.getState().equals(MatchState.FORFEIT)) {
      throw new IllegalStateException("the match is not played");
    }

    if (!match.getResultStatus().equals(ResultStatus.NOT_ENTERED)) {
      throw new IllegalStateException("the match result must be not entered");
    }

    if (dto.scoreA() <= 0 || dto.scoreB() <= 0) {
      throw new IllegalArgumentException("the score must be superior at 0");
    }

    if (dto.scoreA().equals(dto.scoreB())) {
      throw new IllegalStateException("the match cannot have a draw match");
    }

    match.setWinner(dto.scoreA() > dto.scoreB() ? match.getTeamA() : match.getTeamB());
    match.setScoreA(dto.scoreA());
    match.setScoreB(dto.scoreB());
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.PENDING);

    sendResultNotifications(match);

    return matchRepository.save(match);
  }

  /**
   * Gets matches by tournament, ordered by round number ascending.
   *
   * @param tournamentId the tournament id
   * @return the matches of the tournament
   */
  public List<Match> getMatchesByTournament(long tournamentId) {
    Tournament tournament = tournamentRepository.findById(tournamentId)
        .orElseThrow(() -> new NoSuchElementException(
            "No tournament found with id " + tournamentId));

    List<Match> matches = matchRepository.findByTournamentOrderByRoundNumberAsc(tournament);
    if (matches.isEmpty()) {
      throw new NoSuchElementException("No matches found for tournament " + tournamentId);
    }
    return matches;
  }

  private void sendResultNotifications(Match match) {
    Notification notif = new Notification(
        Type.RESULT,
        "Le résultat du match a été encodé. Veuillez le valider ou le contester.",
        LocalDateTime.now()
    );
    notif.setMatch(match);

    notificationService.send(match.getTeamA().getResponsible().getId(), notif);
    notificationService.send(match.getTeamB().getResponsible().getId(), notif);

    if (match.getTeamA().getSecondResponsible() != null) {
      notificationService.send(match.getTeamA().getSecondResponsible().getId(), notif);
    }
    if (match.getTeamB().getSecondResponsible() != null) {
      notificationService.send(match.getTeamB().getSecondResponsible().getId(), notif);
    }
  }
}
