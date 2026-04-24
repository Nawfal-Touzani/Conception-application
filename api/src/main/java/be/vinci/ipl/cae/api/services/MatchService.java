package be.vinci.ipl.cae.api.services;

import static be.vinci.ipl.cae.api.models.entities.Tournament.Status.FINISHED;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Service handling match queries and forfeit.
 */
@Service
public class MatchService {

  private final MatchRepository matchRepository;
  private final TournamentRepository tournamentRepository;
  private final NotificationService notificationService;
  private final MatchResultService matchResultService;

  /**
   * Creates a new MatchService.
   *
   * @param matchRepository the match repository
   * @param tournamentRepository the tournament repository
   * @param notificationService the notification service
   * @param matchResultService the match result service
   */
  public MatchService(MatchRepository matchRepository, TournamentRepository tournamentRepository,
      NotificationService notificationService, MatchResultService matchResultService) {
    this.matchRepository = matchRepository;
    this.tournamentRepository = tournamentRepository;
    this.notificationService = notificationService;
    this.matchResultService = matchResultService;
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
   * Retrieves all upcoming matches for a member.
   *
   * @param member the member
   * @return list of upcoming matches
   */
  public List<Match> getUpcomingMatchesForMember(Member member) {
    return matchRepository.findBySelectedMemberAndState(member, MatchState.SCHEDULED);
  }

  /**
   * Retrieves all past matches for a member.
   *
   * @param member the member
   * @return list of past matches
   */
  public List<Match> getPastMatchesForMember(Member member) {
    return matchRepository.findBySelectedMemberAndState(member, MatchState.PLAYED);
  }

  /**
   * Declares a forfeit for a team in a match.
   * The opposing team wins automatically (5-0), result is VALIDATED, and winner advances.
   * If winner reaches final and wins, tournament is marked FINISHED with winner.
   *
   * @param idMatch the match id
   * @param team the team declaring forfeit
   * @return the updated match
   */
  @Transactional
  public Match declareForfeit(Long idMatch, Team team) {
    Match match = fetchScheduledMatchForTeam(idMatch, team);

    Team winner = team.equals(match.getTeamA()) ? match.getTeamB() : match.getTeamA();

    // Score 5-0 pour l'equipe adverse
    if (winner.equals(match.getTeamA())) {
      match.setScoreA(5);
      match.setScoreB(0);
    } else {
      match.setScoreA(0);
      match.setScoreB(5);
    }

    match.setState(MatchState.FORFEIT);
    match.setWinner(winner);
    match.setResultStatus(ResultStatus.VALIDATED);
    matchRepository.save(match);

    // Avancer le gagnant
    matchResultService.advanceWinner(match);

    // Vérifier victoire tournoi si finale
    checkTournamentVictory(match);

    sendForfeitNotifications(match, team, winner);
    return match;
  }

  /**
   * Retrieves a match only if it exists, is scheduled, and belongs to the given team.
   *
   * @param idMatch the match id
   * @param team the team that wants to access the match
   * @return the scheduled match if the conditions are met
   * @throws NoSuchElementException if the match does not exist
   * @throws IllegalStateException if the match is not scheduled or if the team is not part of the
   *     match
   */
  public Match getScheduledMatchForTeam(Long idMatch, Team team) {
    return fetchScheduledMatchForTeam(idMatch, team);
  }

  // privates

  /**
   * Retrieves a match only if it exists, is scheduled, and belongs to the given team.
   *
   * @param idMatch the match id
   * @param team the team concerned by the match
   * @return the scheduled match
   * @throws NoSuchElementException if the match does not exist
   * @throws IllegalStateException if the match is not scheduled or if the team is not part of the
   *     match
   */
  private Match fetchScheduledMatchForTeam(Long idMatch, Team team) {
    Match match = matchRepository.findById(idMatch)
        .orElseThrow(() -> new NoSuchElementException("Match not found with id " + idMatch));

    if (!match.getState().equals(MatchState.SCHEDULED)) {
      throw new IllegalStateException("The match must be scheduled");
    }

    if (!team.equals(match.getTeamA()) && !team.equals(match.getTeamB())) {
      throw new IllegalStateException("This team is not part of this match");
    }

    return match;
  }

  /**
   * Sends notifications to both teams when a forfeit is declared.
   *
   * @param match the match
   * @param forfeitTeam the team declaring the forfeit
   * @param winner the winning team
   */
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
   * Checks if the winner of this match has reached and won the tournament final.
   * Marks tournament as FINISHED and sets winner if applicable.
   *
   * @param match the completed match (forfeit or normal)
   */
  private void checkTournamentVictory(Match match) {
    Tournament tournament = match.getTournament();

    // Est-ce la finale ?
    if (match.getNextMatch() != null) {
      return; // Pas la finale
    }

    // Est-ce que ce match a une équipe gagnante définitive ?
    if (match.getWinner() == null) {
      return; // Pas encore de gagnant
    }

    // Finale terminée : marquer tournoi FINISHED
    tournament.setStatus(FINISHED);
    tournament.setWinnerTeam(match.getWinner());
    tournamentRepository.save(tournament);
  }
}
