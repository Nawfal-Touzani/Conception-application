package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.ValidationResult;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.ValidationResultRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Service handling all match result operations:
 * encoding, validation, contestation and correction.
 */
@Service
public class MatchResultService {

  private final MatchRepository matchRepository;
  private final ValidationResultRepository validationResultRepository;
  private final NotificationService notificationService;

  /**
   * Creates a new MatchResultService.
   */
  public MatchResultService(
      MatchRepository matchRepository,
      ValidationResultRepository validationResultRepository,
      NotificationService notificationService) {
    this.matchRepository = matchRepository;
    this.validationResultRepository = validationResultRepository;
    this.notificationService = notificationService;
  }

  /**
   * Encodes a match result (admin only).
   *
   * @param idMatch the match id
   * @param dto     the scores
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

    if (dto.scoreA() < 0 || dto.scoreB() < 0) {
      throw new IllegalArgumentException("the score cannot be negative");
    }

    if (dto.scoreA().equals(dto.scoreB())) {
      throw new IllegalStateException("the match cannot have a draw match");
    }

    match.setWinner(dto.scoreA() > dto.scoreB() ? match.getTeamA() : match.getTeamB());
    match.setScoreA(dto.scoreA());
    match.setScoreB(dto.scoreB());
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.PENDING);

    sendPendingNotifications(match);

    return matchRepository.save(match);
  }

  /**
   * Validates a match result for a team.
   * If both teams validate, the match is finalized automatically.
   *
   * @param idMatch the match id
   * @param team    the team validating the result
   */
  @Transactional
  public void validateResult(Long idMatch, Team team) {
    Match match = fetchPendingMatch(idMatch, team);

    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);

    long validatedCount = validationResultRepository.countByMatchAndValidated(match, true);
    if (validatedCount == 2) {
      finalizeMatch(match);
    }
  }

  /**
   * Contests a match result for a team.
   * A team can only contest once — the lock is irreversible.
   *
   * @param idMatch the match id
   * @param team    the team contesting the result
   */
  @Transactional
  public void contestResult(Long idMatch, Team team) {
    Match match = fetchPendingMatch(idMatch, team);

    boolean alreadyContested = team.equals(match.getTeamA())
        ? match.isContestedByTeamA()
        : match.isContestedByTeamB();

    if (alreadyContested) {
      throw new IllegalStateException("This team has already used its contest right");
    }

    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(false);
    vr.setHasAlreadyContested(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);

    if (team.equals(match.getTeamA())) {
      match.setContestedByTeamA(true);
    } else {
      match.setContestedByTeamB(true);
    }
    match.setResultStatus(ResultStatus.REFUSED);
    matchRepository.save(match);
  }

  /**
   * Corrects a contested match result.
   * Can only be called by admin when result is REFUSED.
   *
   * @param idMatch the match id
   * @param payload the corrected score
   * @return the updated match
   */
  @Transactional
  public Match correctResult(Long idMatch, ResultRequest payload) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));

    if (!match.getResultStatus().equals(ResultStatus.REFUSED)) {
      throw new IllegalStateException("Correction can only be applied to a REFUSED result");
    }

    if (payload.scoreA() < 0 || payload.scoreB() < 0) {
      throw new IllegalArgumentException("Scores cannot be negative");
    }

    if (payload.scoreA().equals(payload.scoreB())) {
      throw new IllegalStateException("Draw is not allowed");
    }

    match.setScoreA(payload.scoreA());
    match.setScoreB(payload.scoreB());
    match.setWinner(payload.scoreA() > payload.scoreB() ? match.getTeamA() : match.getTeamB());

    match.setResultStatus(ResultStatus.VALIDATED);
    return matchRepository.save(match);
  }

  // Private methods
  private Match fetchPendingMatch(Long idMatch, Team team) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));

    if (!match.getResultStatus().equals(ResultStatus.PENDING)) {
      throw new IllegalStateException("Result is not pending validation");
    }

    if (validationResultRepository.existsByMatchAndTeam(match, team)) {
      throw new IllegalStateException("This team has already responded to this result");
    }

    return match;
  }

  void finalizeMatch(Match match) {
    match.setResultStatus(ResultStatus.VALIDATED);
    matchRepository.save(match);

    sendValidationNotifications(match);

    Match nextMatch = match.getNextMatch();
    if (nextMatch != null) {
      if (nextMatch.getTeamA() == null) {
        nextMatch.setTeamA(match.getWinner());
      } else {
        nextMatch.setTeamB(match.getWinner());
      }
      matchRepository.save(nextMatch);
    }
  }

  private void sendPendingNotifications(Match match) {
    List<Long> recipients = new ArrayList<>();
    recipients.add(match.getTeamA().getResponsible().getId());
    recipients.add(match.getTeamB().getResponsible().getId());
    if (match.getTeamA().getSecondResponsible() != null) {
      recipients.add(match.getTeamA().getSecondResponsible().getId());
    }
    if (match.getTeamB().getSecondResponsible() != null) {
      recipients.add(match.getTeamB().getSecondResponsible().getId());
    }

    for (Long recipientId : recipients) {
      Notification notif = new Notification(
          Type.RESULT_CONFIRMATION,
          "Le résultat du match a été encodé. Veuillez le valider ou le contester.",
          LocalDateTime.now()
      );
      notif.setMatch(match);
      notificationService.send(recipientId, notif);
    }
  }

  private void sendValidationNotifications(Match match) {
    String scoreInfo = match.getScoreA() + " - " + match.getScoreB();
    Team winner = match.getWinner();
    Team loser = match.getTeamA().equals(winner) ? match.getTeamB() : match.getTeamA();

    sendToTeam(match, winner,
        "Félicitations ! Votre équipe a gagné avec un score de " + scoreInfo + ".");
    sendToTeam(match, loser,
        "Votre équipe a perdu le match avec un score de " + scoreInfo + ".");
  }

  private void sendToTeam(Match match, Team team, String message) {
    Notification notif = new Notification(Type.RESULT, message, LocalDateTime.now());
    notif.setMatch(match);
    notificationService.send(team.getResponsible().getId(), notif);
    if (team.getSecondResponsible() != null) {
      notificationService.send(team.getSecondResponsible().getId(), notif);
    }
  }
}
