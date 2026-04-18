package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.ValidationResult;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import be.vinci.ipl.cae.api.repositories.ValidationResultRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
  private final PlayersSelectionRepository playersSelectionRepository;
  private final ValidationResultRepository validationResultRepository;
  private final MemberRepository memberRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final UnavailabilityRepository unavailabilityRepository;

  /**
   * Create a new MatchService.
   *
   * @param matchRepository      match repository
   * @param tournamentRepository tournament repository
   * @param notificationService  the notification service
   */
  public MatchService(MatchRepository matchRepository, TournamentRepository tournamentRepository,
      NotificationService notificationService,
      PlayersSelectionRepository playersSelectionRepository,
      ValidationResultRepository validationResultRepository, MemberRepository memberRepository,
      TeamCompositionRepository teamCompositionRepository,
      UnavailabilityRepository unavailabilityRepository) {
    this.matchRepository = matchRepository;
    this.tournamentRepository = tournamentRepository;
    this.notificationService = notificationService;
    this.playersSelectionRepository = playersSelectionRepository;
    this.validationResultRepository = validationResultRepository;
    this.memberRepository = memberRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.unavailabilityRepository = unavailabilityRepository;
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

    return matchRepository.findByTournamentOrderByRoundNumberAsc(tournament);
  }

  private void sendResultNotifications(Match match) {
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

  /**
   * Gets a match by its id.
   *
   * @param idMatch the match id
   * @return the match
   */
  public Match getMatchById(Long idMatch) {
    return matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));
  }

  /**
   * Submits a player selection for a match.
   * The responsible can only select players from their own team.
   * All selected players must be available on the match date.
   *
   * @param idMatch   the match id
   * @param team      the team submitting (resolved from authenticated responsible)
   * @param memberIds exactly 4 member ids to select
   * @return the list of created PlayersSelection entries
   */
  @Transactional
  public List<PlayersSelection> submitSelection(Long idMatch, Team team, List<Long> memberIds) {

    Match match = fetchScheduledMatchForTeam(idMatch, team);

    // Guard 3 = exactement 4 membres
    if (memberIds.size() != 4) {
      throw new IllegalArgumentException("Exactly 4 players must be selected");
    }

    // Guard 4 & 5 = appartenance à la team + disponibilité
    List<Member> selectedMembers = new ArrayList<>();
    for (Long memberId : memberIds) {
      Member member = memberRepository.findById(memberId)
          .orElseThrow(() -> new NoSuchElementException("Member not found with id " + memberId));

      // Guard 4 = appartient à la team via TeamComposition
      if (!teamCompositionRepository.existsByMemberAndTeamId(member, team.getId())) {
        throw new IllegalStateException(
            "Member " + memberId + " does not belong to the submitting team");
      }

      // Guard 5 = disponible à la date du match
      LocalDate matchDate = match.getDateTime().toLocalDate();
      if (unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(
          member,
          matchDate.plusDays(1),
          matchDate.minusDays(1))) {
        throw new IllegalStateException(
            "Member " + memberId + " is unavailable on match date");
      }

      selectedMembers.add(member);
    }

    // Persistance = une PlayersSelection par joueur
    List<PlayersSelection> selections = new ArrayList<>();
    for (Member member : selectedMembers) {
      PlayersSelection ps = new PlayersSelection(member, match, team);
      selections.add(playersSelectionRepository.save(ps));
    }

    // Notifier les joueurs sélectionnés
    sendSelectionNotifications(match, selectedMembers);

    return selections;
  }

  // Guard = match existe et est SCHEDULED & la team est dans ce match
  private Match fetchScheduledMatchForTeam(Long idMatch, Team team) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));

    if (!match.getState().equals(MatchState.SCHEDULED)) {
      throw new IllegalStateException("Selection can only be submitted for a SCHEDULED match");
    }

    if (!team.equals(match.getTeamA()) && !team.equals(match.getTeamB())) {
      throw new IllegalStateException("This team is not part of this match");
    }

    return match;
  }

  private void sendSelectionNotifications(Match match, List<Member> members) {
    for (Member member : members) {
      Notification notif = new Notification(
          Type.MATCH,
          "Vous avez été sélectionné pour un match le " + match.getDateTime() + ".",
          LocalDateTime.now()
      );
      notif.setMatch(match);
      notificationService.send(member.getId(), notif);
    }
  }

  /**
   * Modifies the player selection for a match.
   * Deletes the existing selection for the team and replaces it with the new one.
   * Applies the same validation rules as submitSelection.
   *
   * @param idMatch   the match id
   * @param team      the team modifying the selection
   * @param memberIds exactly 4 member ids to select
   * @return the list of new PlayersSelection entries
   */
  @Transactional
  public List<PlayersSelection> modifySelection(Long idMatch, Team team, List<Long> memberIds) {

    Match match = fetchScheduledMatchForTeam(idMatch, team);

    // Guard = une sélection existante doit exister pour la modifier
    if (playersSelectionRepository.countByMatchAndTeam(match, team) == 0) {
      throw new IllegalStateException("No existing selection found for this team in this match");
    }

    // Supprimer l'ancienne sélection
    playersSelectionRepository.deleteByMatchAndTeam(match, team);

    // Soumettre la nouvelle — réutilise toute la logique de validation
    return submitSelection(idMatch, team, memberIds);
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

    // Créer la validation
    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);

    // Si les 2 teams ont validé → finaliser
    long validatedCount = validationResultRepository.countByMatchAndValidated(match, true);
    if (validatedCount == 2) {
      finalizeMatch(match);
    }
  }

  // Guard = le résultat doit être en attente de validation & la team n'a pas déjà répondu
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
   * Contests a match result for a team.
   * A team can only contest once — the lock is irreversible.
   * Atomically updates both ValidationResult and the contested flag on Match.
   *
   * @param idMatch the match id
   * @param team    the team contesting the result
   */
  @Transactional
  public void contestResult(Long idMatch, Team team) {

    Match match = fetchPendingMatch(idMatch, team);

    // Guard 3 — vérifier le verrou de contestation sur Match (one-contest-only)
    boolean alreadyContested = team.equals(match.getTeamA())
        ? match.isContestedByTeamA()
        : match.isContestedByTeamB();

    if (alreadyContested) {
      throw new IllegalStateException("This team has already used its contest right");
    }

    // Créer la contestation
    ValidationResult vr = new ValidationResult(match, team);
    vr.setValidated(false);
    vr.setHasAlreadyContested(true);
    vr.setValidationDate(LocalDateTime.now());
    validationResultRepository.save(vr);

    // ATOMIQUE — mettre à jour le verrou sur Match dans la même transaction
    if (team.equals(match.getTeamA())) {
      match.setContestedByTeamA(true);
    } else {
      match.setContestedByTeamB(true);
    }
    match.setResultStatus(ResultStatus.REFUSED);
    matchRepository.save(match);
  }

  /**
   * Finalizes a match after both teams have validated the result.
   * Sets the result status to VALIDATED, confirms the winner,
   * and places the winner into the next match of the bracket.
   *
   * @param match the match to finalize
   */
  private void finalizeMatch(Match match) {
    match.setResultStatus(ResultStatus.VALIDATED);
    // Le winner est déjà setté dans encodingResult — on confirme juste
    matchRepository.save(match);

    // Placer le gagnant dans le match suivant du bracket
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

  /**
   * Corrects a contested match result.
   * Resets all validation entries so both teams can respond again.
   * The contest lock (contestedByTeamA/B) is NOT reset — a team cannot contest twice.
   *
   * @param idMatch the match id
   * @param dto     the corrected score
   * @return the updated match
   */
  @Transactional
  public Match correctResult(Long idMatch, ResultRequest dto) {

    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));

    // Guard 1 — le résultat doit être refusé (contesté)
    if (!match.getResultStatus().equals(ResultStatus.REFUSED)) {
      throw new IllegalStateException("Result can only be corrected if it has been contested");
    }

    // Guard 2 — scores valides
    if (dto.scoreA() < 0 || dto.scoreB() < 0) {
      throw new IllegalArgumentException("Scores cannot be negative");
    }
    if (dto.scoreA().equals(dto.scoreB())) {
      throw new IllegalStateException("Match cannot end in a draw");
    }

    // Reset des ValidationResult — les deux teams peuvent re-répondre
    validationResultRepository.deleteByMatch(match);

    // Mettre à jour le score et le winner
    match.setScoreA(dto.scoreA());
    match.setScoreB(dto.scoreB());
    match.setWinner(dto.scoreA() > dto.scoreB() ? match.getTeamA() : match.getTeamB());
    match.setResultStatus(ResultStatus.PENDING);
    matchRepository.save(match);

    // Renvoyer les notifications aux responsables
    sendResultNotifications(match);

    return match;
  }

  /**
   * Declares a forfeit for a team in a match.
   * The opposing team wins automatically and is placed in the next bracket match.
   *
   * @param idMatch the match id
   * @param team    the team declaring forfeit
   * @return the updated match
   */
  @Transactional
  public Match declareForfeit(Long idMatch, Team team) {

    Match match = fetchScheduledMatchForTeam(idMatch, team);

    // L'adversaire gagne automatiquement
    Team winner = team.equals(match.getTeamA()) ? match.getTeamB() : match.getTeamA();

    match.setState(MatchState.FORFEIT);
    match.setWinner(winner);

    // finalizeMatch gère le save + placement dans le bracket
    finalizeMatch(match);

    // Notifier les deux responsables
    sendForfeitNotifications(match, team, winner);

    return match;
  }

  private void sendForfeitNotifications(Match match, Team forfeitTeam, Team winner) {
    List<Member> recipients = new ArrayList<>();

    recipients.add(forfeitTeam.getResponsible());
    recipients.add(winner.getResponsible());

    if (forfeitTeam.getSecondResponsible() != null) {
      recipients.add(forfeitTeam.getSecondResponsible());
    }
    if (winner.getSecondResponsible() != null) {
      recipients.add(winner.getSecondResponsible());
    }

    for (Member recipient : recipients) {
      Notification notif = new Notification(
          Type.MATCH,
          "L'équipe " + forfeitTeam.getName() + " a déclaré forfait. "
              + winner.getName() + " remporte le match.",
          LocalDateTime.now()
      );
      notif.setMatch(match);
      notificationService.send(recipient.getId(), notif);
    }
  }

  /**
   * Invalidates all future selections of a member when they leave their team.
   * Called by TeamService when a member leaves or is removed from a team.
   * Only SCHEDULED matches are affected — past selections are kept for history.
   *
   * @param member the member leaving their team
   */
  @Transactional
  public void invalidateSelectionsOnLeave(Member member) {
    playersSelectionRepository.deleteByMemberAndMatchState(member, MatchState.SCHEDULED);
  }

  /**
   * Retrieves all upcoming matches for a member.
   * A match is upcoming if it is SCHEDULED and the member is selected for it.
   *
   * @param member the member
   * @return list of upcoming matches
   */
  public List<Match> getUpcomingMatchesForMember(Member member) {
    return matchRepository.findBySelectedMemberAndState(member, MatchState.SCHEDULED);
  }

  /**
   * Retrieves all past matches for a member.
   * A match is past if it is PLAYED and the member was selected for it.
   *
   * @param member the member
   * @return list of past matches
   */
  public List<Match> getPastMatchesForMember(Member member) {
    return matchRepository.findBySelectedMemberAndState(member, MatchState.PLAYED);
  }
}
