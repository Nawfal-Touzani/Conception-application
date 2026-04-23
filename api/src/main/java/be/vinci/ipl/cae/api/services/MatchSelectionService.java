package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.MemberSelectionDto;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Notification.Type;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;

/**
 * Service handling player selection for matches.
 */
@Service
public class MatchSelectionService {

  private final MatchService matchService;
  private final PlayersSelectionRepository playersSelectionRepository;
  private final MemberRepository memberRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final UnavailabilityRepository unavailabilityRepository;
  private final NotificationService notificationService;

  /**
   * Creates a new MatchSelectionService.
   */
  public MatchSelectionService(MatchService matchService,
      PlayersSelectionRepository playersSelectionRepository, MemberRepository memberRepository,
      TeamCompositionRepository teamCompositionRepository,
      UnavailabilityRepository unavailabilityRepository, NotificationService notificationService) {
    this.matchService = matchService;
    this.playersSelectionRepository = playersSelectionRepository;
    this.memberRepository = memberRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.unavailabilityRepository = unavailabilityRepository;
    this.notificationService = notificationService;
  }

  /**
   * Submits a player selection for a match. The responsible can only select players from their own
   * team. All selected players must be available on the match date.
   *
   * @param idMatch   the match id
   * @param team      the team submitting (resolved from authenticated responsible)
   * @param memberIds exactly 4 member ids to select
   * @return the list of created PlayersSelection entries
   */
  @Transactional
  public List<PlayersSelection> submitSelection(Long idMatch, Team team, List<Long> memberIds) {
    Match match = matchService.getScheduledMatchForTeam(idMatch, team);

    if (memberIds.size() != 4) {
      throw new IllegalArgumentException("Exactly 4 players must be selected");
    }

    List<Member> selectedMembers = new ArrayList<>();
    for (Long memberId : memberIds) {
      Member member = memberRepository.findById(memberId)
          .orElseThrow(() -> new NoSuchElementException("Member not found with id " + memberId));

      if (!teamCompositionRepository.existsByMemberAndTeamId(member, team.getId())) {
        throw new IllegalStateException(
            "Member " + memberId + " does not belong to the submitting team");
      }

      LocalDate matchDate = match.getDateTime().toLocalDate();
      if (unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(member,
          matchDate.plusDays(1), matchDate.minusDays(1))) {
        throw new IllegalStateException("Member " + memberId + " is unavailable on match date");
      }

      selectedMembers.add(member);
    }

    List<PlayersSelection> selections = new ArrayList<>();
    for (Member member : selectedMembers) {
      PlayersSelection ps = new PlayersSelection(member, match, team);
      selections.add(playersSelectionRepository.save(ps));
    }

    sendSelectionNotifications(match, selectedMembers);

    return selections;
  }

  /**
   * Modifies the player selection for a match. Deletes the existing selection for the team and
   * replaces it with the new one.
   *
   * @param idMatch   the match id
   * @param team      the team modifying the selection
   * @param memberIds exactly 4 member ids to select
   * @return the list of new PlayersSelection entries
   */
  @Transactional
  public List<PlayersSelection> modifySelection(Long idMatch, Team team, List<Long> memberIds) {
    Match match = matchService.getScheduledMatchForTeam(idMatch, team);

    if (playersSelectionRepository.countByMatchAndTeam(match, team) == 0) {
      throw new IllegalStateException("No existing selection found for this team in this match");
    }

    playersSelectionRepository.deleteByMatchAndTeam(match, team);

    return submitSelection(idMatch, team, memberIds);
  }

  /**
   * Invalidates all future selections of a member when they leave their team. Only SCHEDULED
   * matches are affected — past selections are kept for history.
   *
   * @param member the member leaving their team
   */
  @Transactional
  public void invalidateSelectionsOnLeave(Member member) {
    List<PlayersSelection> affectedSelections = playersSelectionRepository
        .findByMemberAndMatchState(
        member, MatchState.SCHEDULED);

    // notifier les responsables des equipes concernees
    for (PlayersSelection ps : affectedSelections) {
      Team team = ps.getTeam();
      Notification notif = new Notification(Type.MATCH,
          "Le joueur " + member.getTag() + " a quitté l'équipe. "
              + "Votre sélection pour le match du " + ps.getMatch().getDateTime()
              + " a été modifiée, vérifiez votre composition.", LocalDateTime.now());
      notif.setMatch(ps.getMatch());

      notificationService.send(team.getResponsible().getId(), notif);
      if (team.getSecondResponsible() != null) {
        Notification notif2 = new Notification(Type.MATCH,
            "Le joueur " + member.getTag() + " a quitté l'équipe. "
                + "Votre sélection pour le match du " + ps.getMatch().getDateTime()
                + " a été modifiée, vérifiez votre composition.",
            LocalDateTime.now());
        notif2.setMatch(ps.getMatch());
        notificationService.send(team.getSecondResponsible().getId(), notif2);
      }
    }

    // supprimer apres avoir notifie
    playersSelectionRepository.deleteByMemberAndMatchState(member, MatchState.SCHEDULED);
  }

  /**
   * Retrieves all members of a team and their availability for a specific match.
   *
   * @param idMatch the match id
   * @param team    the team
   * @return a list of MemberSelectionDto
   */
  public List<MemberSelectionDto> getEligibleMembers(Long idMatch, Team team) {
    Match match = matchService.getScheduledMatchForTeam(idMatch, team);
    LocalDate matchDate = match.getDateTime().toLocalDate();

    return teamCompositionRepository.findAllByTeamId(team.getId()).stream().map(compo -> {
      Member member = compo.getMember();

      boolean isUnavailable = unavailabilityRepository
          .existsByMemberAndStartDateBeforeAndEndDateAfter(
          member, matchDate.plusDays(1), matchDate.minusDays(1));

      return new MemberSelectionDto(member.getId(), member.getTag(), member.getImage().getUrl(),
          !isUnavailable);
    }).toList();
  }

  // Private methods
  private void sendSelectionNotifications(Match match, List<Member> members) {
    for (Member member : members) {
      Notification notif = new Notification(Type.MATCH,
          "Vous avez été sélectionné pour un match le " + match.getDateTime() + ".",
          LocalDateTime.now());
      notif.setMatch(match);
      notificationService.send(member.getId(), notif);
    }
  }
}
