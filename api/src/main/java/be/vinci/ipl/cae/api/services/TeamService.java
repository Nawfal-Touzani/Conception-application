package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest.State;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team service.
 */
@Service
public class TeamService {

  private final TeamRepository teamRepository;
  private final TeamCompositionRepository teamCompositionRepository;
  private final MemberRepository memberRepository;
  private final MembershipRequestRepository membershipRequestRepository;
  private final NotificationService notificationService;

  /**
   * Instantiates a new Team service.
   *
   * @param teamRepository            the team repository
   * @param teamCompositionRepository the team composition repository
   * @param memberRepository          the member repository
   */
  public TeamService(TeamRepository teamRepository,
      TeamCompositionRepository teamCompositionRepository, MemberRepository memberRepository,
      MembershipRequestRepository membershipRequestRepository,
      NotificationService notificationService) {
    this.teamRepository = teamRepository;
    this.teamCompositionRepository = teamCompositionRepository;
    this.memberRepository = memberRepository;
    this.membershipRequestRepository = membershipRequestRepository;
    this.notificationService = notificationService;
  }

  /**
   * Create team.
   *
   * @param memberId the member id
   * @param request  the request
   * @return the team
   */
  public Team createTeam(Long memberId, CreateTeamRequest request) {

    if (request.isInvalid()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team name is required");
    }

    if (teamCompositionRepository.existsByMemberId(memberId)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Member already belongs to a team");
    }

    if (teamRepository.existsByName(request.getName())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists");
    }
    Member member = memberRepository.findById(memberId).orElseThrow(
        () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));

    Team team = new Team();
    team.setName(request.getName());
    team.setIsActive(true);
    team.setCreationDate(LocalDateTime.now());
    team.setResponsible(member);
    Team savedTeam = teamRepository.save(team);
    TeamComposition composition = new TeamComposition(member, savedTeam, LocalDateTime.now());
    teamCompositionRepository.save(composition);

    return savedTeam;
  }

  /**
   * Creates a membership request for a member to join a team. Notifies the team responsible.
   *
   * @param memberId the ID of the member
   * @param teamId   the ID of the team
   * @return the created membership request, or null if member or team not found
   */
  public MembershipRequest createRequest(long memberId, long teamId) {
    Member member = memberRepository.findById(memberId).orElse(null);
    if (member == null) {
      return null;
    }

    Team team = teamRepository.findById(teamId).orElse(null);
    if (team == null) {
      return null;
    }

    MembershipRequest request = new MembershipRequest(State.PENDING, null, null);
    request.setMember(member);
    request.setTeam(team);

    MembershipRequest saved = membershipRequestRepository.save(request);

    // Notify the team responsible
    Notification notif = new Notification(
        Notification.Type.MEMBERSHIP_REQUEST,
        "Nouvelle demande d'adhésion de " + member.getTag() + " pour rejoindre " + team.getName(),
        LocalDateTime.now()
    );
    notificationService.send(team.getResponsible().getId(), notif);

    return saved;
  }

}