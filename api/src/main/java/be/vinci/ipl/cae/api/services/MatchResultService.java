package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.Tournament.Status;
import be.vinci.ipl.cae.api.models.entities.ValidationResult;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.NotificationRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import be.vinci.ipl.cae.api.repositories.ValidationResultRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Service handling all match result operations: encoding, validation, contestation and correction.
 */
@Service
public class MatchResultService {

  private final MatchRepository matchRepository;
  private final ValidationResultRepository validationResultRepository;
  private final NotificationService notificationService;
  private final MemberRepository memberRepository;
  private final NotificationRepository notificationRepository;
  private final TournamentRepository tournamentRepository;

  /**
   * Creates a new MatchResultService.
   */
  public MatchResultService(MatchRepository matchRepository,
      ValidationResultRepository validationResultRepository,
      NotificationService notificationService, MemberRepository memberRepository,
      NotificationRepository notificationRepository, TournamentRepository tournamentRepository) {
    this.matchRepository = matchRepository;
    this.validationResultRepository = validationResultRepository;
    this.notificationService = notificationService;
    this.memberRepository = memberRepository;
    this.notificationRepository = notificationRepository;
    this.tournamentRepository = tournamentRepository;
  }

  /**
   * Encodes a match result (admin only).
   *
   * @param idMatch the match id
   * @param dto     the scores
   * @return the updated match
   */
  public Match encodingResult(Long idMatch, ResultRequest dto, Member admin) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found"));

    if (match.getResponsibleAdmin() == null) {
      match.setResponsibleAdmin(admin); // premier admin = responsable
    } else if (!match.getResponsibleAdmin().getId().equals(admin.getId())) {
      throw new IllegalStateException("Another admin is already responsible for this match");
    }

    if (!match.getState().equals(MatchState.SCHEDULED)) {
      throw new IllegalStateException(
          "Cannot encode result: match must be SCHEDULED, was " + match.getState());
    }

    if (!match.getResultStatus().equals(ResultStatus.NOT_ENTERED)) {
      throw new IllegalStateException("the match result must be not entered");
    }

    // double layer with entity?
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
    match.setResultEncodedDate(LocalDateTime.now());

    sendPendingNotifications(match);

    return matchRepository.save(match);
  }

  /**
   * Validates a match result for a team. If both teams validate, the match is finalized
   * automatically.
   *
   * @param idMatch the match id
   * @param team    the team validating the result
   */
  @Transactional
  public Match validateResult(Long idMatch, Team team) {
    Match match = fetchPendingMatch(idMatch, team);

    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);
    markConfirmationNotificationsAsRead(match, team);

    long validatedCount = validationResultRepository.countByMatchAndValidated(match, true);
    if (validatedCount == 2) {
      finalizeMatch(match);
    }

    return match;
  }

  /**
   * Contests a match result for a team. A team can only contest once — the lock is irreversible.
   *
   * @param idMatch the match id
   * @param team    the team contesting the result
   */
  @Transactional
  public Match contestResult(Long idMatch, Team team) {
    Match match = fetchPendingMatch(idMatch, team);

    boolean isTeamA = team.getId().equals(match.getTeamA().getId());

    boolean alreadyContested =
        isTeamA ? match.isContestedByTeamA() : match.isContestedByTeamB();

    final boolean noContestYet =
        !match.isContestedByTeamA() && !match.isContestedByTeamB();

    if (alreadyContested) {
      throw new IllegalStateException("This team has already used its contest right");
    }

    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(false);
    vr.setHasAlreadyContested(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);
    markConfirmationNotificationsAsRead(match, team);

    // Mise à jour de l'état du match
    if (team.getId().equals(match.getTeamA().getId())) {
      match.setContestedByTeamA(true);
    } else {
      match.setContestedByTeamB(true);
    }
    match.setResultStatus(ResultStatus.REFUSED);

    if (noContestYet) {
      sendContestToResponsible(match);
    }

    return matchRepository.save(match);
  }

  private void sendContestToResponsible(Match match) {

    String message =
        "Le résultat du match "
            + match.getTeamA().getName() + " " + match.getScoreA() + " - "
            + match.getTeamB().getName() + " " + match.getScoreB()
            + " a été contesté. Veuillez vérifier.";

    Notification notif = new Notification(
        Type.RESULT,
        message,
        LocalDateTime.now()
    );

    notificationService.send(match.getResponsibleAdmin().getId(), notif);


  }

  /**
   * Corrects a contested match result. Can only be called by admin when result is REFUSED.
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

    // double layer with entity?
    if (payload.scoreA() < 0 || payload.scoreB() < 0) {
      throw new IllegalArgumentException("the score cannot be negative");
    }

    if (payload.scoreA().equals(payload.scoreB())) {
      throw new IllegalStateException("Draw is not allowed");
    }

    match.setScoreA(payload.scoreA());
    match.setScoreB(payload.scoreB());
    match.setWinner(payload.scoreA() > payload.scoreB() ? match.getTeamA() : match.getTeamB());

    finalizeMatch(match);
    return match;
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

  /**
   * Advances the winner of the given match to the next round in the tournament bracket. This method
   * identifies the next match in the tree and assigns the winner of the current match to the first
   * available slot (Team A or Team B). If no next match exists (e.g., the final), no action is
   * taken.
   *
   * @param match the current match from which the winner should advance
   */
  public void advanceWinner(Match match) {

    if (match.getWinner() == null) {
      throw new IllegalStateException("Cannot advance match without winner");
    }

    Match nextMatch = match.getNextMatch();

    if (nextMatch == null) {

      Tournament tournament = match.getTournament();

      tournament.setWinnerTeam(match.getWinner());

      tournament.setStatus(Status.FINISHED);

      tournamentRepository.save(tournament);
      return;

    }

    if (nextMatch.getTeamA() == null) {
      nextMatch.setTeamA(match.getWinner());
    } else if (nextMatch.getTeamB() == null) {
      nextMatch.setTeamB(match.getWinner());
    } else {
      throw new IllegalStateException("Next match already full");
    }

    matchRepository.save(nextMatch);
  }

  /**
   * Finalizes a match after a standard result submission. This process marks the match as
   * {@code VALIDATED}, persists the state, triggers the official validation notifications to
   * relevant parties, and automatically advances the winner to the next round.
   *
   * @param match the match to be officially finalized
   */
  public void finalizeMatch(Match match) {
    match.setResultStatus(ResultStatus.VALIDATED);
    advanceWinner(match);
    matchRepository.save(match);
    sendValidationNotifications(match);

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
          "Le résultat du match a été encodé. Le score est de "
              + match.getTeamA().getName() + " "
              + match.getScoreA() + " - "
              + match.getScoreB() + " "
              + match.getTeamB().getName()
              + ". Veuillez le valider ou le contester.",
          LocalDateTime.now()
      );
      notif.setMatch(match);
      notificationService.send(recipientId, notif);
    }
  }

  private void sendValidationNotifications(Match match) {
    List<Member> allMembers = memberRepository.findAll();

    for (Member member : allMembers) {
      String message = match.getTournament().getName() + " | "
          + match.getTeamA().getName()
          + " " + match.getScoreA()
          + " - "
          + match.getScoreB() + " "
          + match.getTeamB().getName()
          + " — Résultat officiel et public";

      Notification notif = new Notification(Type.RESULT, message, LocalDateTime.now());
      notif.setMatch(match);
      notificationService.send(member.getId(), notif);
    }
  }

  private void markConfirmationNotificationsAsRead(Match match, Team team) {
    List<Member> members = new ArrayList<>();
    members.add(team.getResponsible());
    if (team.getSecondResponsible() != null) {
      members.add(team.getSecondResponsible());
    }

    members.forEach(member ->
        notificationRepository.findByMemberAndMatchAndType(
                member, match, Notification.Type.RESULT_CONFIRMATION)
            .ifPresent(notif -> {
              notif.setRead(true);
              notificationRepository.save(notif);
            })
    );
  }

}
