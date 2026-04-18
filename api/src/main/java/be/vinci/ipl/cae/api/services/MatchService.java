package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import java.time.LocalDateTime;
import java.util.List;               // ← AJOUT
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * MatchService.
 */
@Service
public class MatchService {

  private final MatchRepository matchRepository;
  private final NotificationService notificationService;

  /**
   * Create a new MatchService.
   *
   * @param matchRepository     match repository
   * @param notificationService the notification service
   */
  public MatchService(MatchRepository matchRepository,
      NotificationService notificationService) {
    this.matchRepository = matchRepository;

    this.notificationService = notificationService;
  }

  /**
   * Encode a match.
   *
   * @param idMatch the match id
   * @param dto     the score of the match
   * @return the created result
   */
  public Match encodingResult(Long idMatch, ResultRequest dto) {

    final Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found"));

    // check if the match is not played
    if (match.getState().equals(MatchState.CANCELED) || match.getState()
        .equals(MatchState.FORFEIT)) {
      throw new IllegalStateException("the match is not played");
    }

    // check result status is not entered

    if (!match.getResultStatus().equals(ResultStatus.NOT_ENTERED)) {
      throw new IllegalStateException("the match result must be not entered");
    }

    // check the score is not null
    if (dto.scoreA() < 0 || dto.scoreB() < 0) {
      throw new IllegalArgumentException("the score must be superior at 0");
    }

    // check not a  draw match
    if (dto.scoreA().equals(dto.scoreB())) {
      throw new IllegalStateException("the match cannot have a draw match");
    }

    // choose the winner
    if (dto.scoreA() > dto.scoreB()) {
      match.setWinner(match.getTeamA());
    } else {
      match.setWinner(match.getTeamB());
    }

    match.setScoreA(dto.scoreA());
    match.setScoreB(dto.scoreB());
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.PENDING);

    sendResultNotifications(match);

    return matchRepository.save(match);
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

  /**
   * Gets matches by tournament.
   *
   * @param tournamentId the tournament id
   * @return the matches by tournament
   */
  public List<Match> getMatchesByTournament(long tournamentId) {
    List<Match> matches = matchRepository.findByTournamentIdOrderByRoundNumberAsc(tournamentId);
    if (matches.isEmpty()) {
      throw new NoSuchElementException("No matches found for tournament " + tournamentId);
    }
    return matches;
  }

}
