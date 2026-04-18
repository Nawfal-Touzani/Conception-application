package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.ResultValidation;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.ResultValidationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Result validation service .
 */

@Service
public class ResultValidationService {

  private final ResultValidationRepository resultValidationRepository;
  private final MatchRepository matchRepository;
  private final NotificationService notificationService;

  /**
   * Create a new ResultValidation Service.
   *
   * @param resultValidationRepository repository
   */
  public ResultValidationService(ResultValidationRepository resultValidationRepository,
      MatchRepository matchRepository, NotificationService notificationService) {
    this.resultValidationRepository = resultValidationRepository;
    this.matchRepository = matchRepository;
    this.notificationService = notificationService;
  }

  /**
   * Confirm result .
   */
  public void confirmResult(Long idMatch, Long idTeam) {

    final Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found"));

    // if match is not in pending result cannot confirm

    if (!match.getResultStatus().equals(ResultStatus.PENDING)) {
      throw new IllegalStateException("The match must be in pending status");
    }

    // verify the 2 team confirm the result
    ResultValidation result = resultValidationRepository.findByMatchIdAndTeamId(idMatch,
        idTeam).orElseThrow(() -> new NoSuchElementException("ResultValidation not found"));

    if (result.getIsValid() != null) {
      throw new IllegalStateException("The team has already confirmed or contested this result");
    }

    result.setIsValid(true);
    result.setValidationDate(LocalDate.now());
    resultValidationRepository.save(result);

    if (bothTeamsConfirmed(idMatch)) {
      match.setResultStatus(ResultStatus.VALIDATED);
      matchRepository.save(match);
      sendResultNotifications(match);
    }


  }

  private boolean bothTeamsConfirmed(Long idMatch) {
    return resultValidationRepository.findAllByMatchId(idMatch)
        .stream()
        .allMatch(rv -> Boolean.TRUE.equals(rv.getIsValid()));
  }


  private void sendResultNotifications(Match match) {
    String scoreInfo = match.getScoreA() + " - " + match.getScoreB();

    String messageWinner =
        "Félicitations ! Votre équipe a gagné le match avec un score de " + scoreInfo + ".";
    String messageLoser = "Votre équipe a perdu le match avec un score de " + scoreInfo + ".";

    Team winner = match.getWinner();
    Team loser = match.getTeamA().equals(winner) ? match.getTeamB() : match.getTeamA();

    sendToTeam(winner, messageWinner);
    sendToTeam(loser, messageLoser);
  }

  private void sendToTeam(Team team, String message) {
    Notification notif = new Notification(
        Type.RESULT,
        message,
        LocalDateTime.now()
    );

    notificationService.send(team.getResponsible().getId(), notif);

    if (team.getSecondResponsible() != null) {
      notificationService.send(team.getSecondResponsible().getId(), notif);
    }
  }
}
