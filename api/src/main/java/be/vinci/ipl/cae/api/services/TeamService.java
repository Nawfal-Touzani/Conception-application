package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.dtos.TeamResponseDto;
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
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
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
   */
  public TeamService(TeamRepository teamRepository,
                     TeamCompositionRepository teamCompositionRepository,
                     MemberRepository memberRepository,
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
   */
  @Transactional
  public TeamResponseDto createTeam(Long memberId, CreateTeamRequest request) {
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

    return toDto(savedTeam);
  }

  /**
   * Creates a membership request for a member to join a team.
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

    Notification notif = new Notification(
        Notification.Type.MEMBERSHIP_REQUEST,
        "Nouvelle demande d'adhésion de "
            + member.getTag()
            + " pour rejoindre "
            + team.getName(),
        LocalDateTime.now()
    );
    notificationService.send(team.getResponsible().getId(), notif);

    return saved;
  }

  /**
   * Get members of the connected member's team.
   */
  public List<TeamMemberDto> getMembersOfMyTeam(Long memberId) {
    TeamComposition composition = teamCompositionRepository.findByMemberId(memberId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member has no team"));

    if (composition.getTeam() == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found");
    }

    Long teamId = composition.getTeam().getId();
    List<TeamComposition> compositions = teamCompositionRepository.findAllByTeamId(teamId);

    return compositions.stream()
        .map(tc -> new TeamMemberDto(
            tc.getMember().getTag(),
            tc.getMember().getImage().getId()
        ))
        .toList();
  }

  /**
   * Get all teams as entities (internal use).
   */
  public Iterable<Team> getAllTeams() {
    return teamRepository.findAll();
  }

  /**
   *  NEW — Get all teams as safe DTOs (avoids circular JSON serialization).
   * Used by GET /teams endpoint.
   */
  @Transactional
  public List<TeamResponseDto> getAllTeamDtos() {
    return teamRepository.findAll().stream()
        .map(this::toDto)
        .toList();
  }

  /**
   * Leave the current team.
   */
  @Transactional
  public void leaveTeam(String email) {
    Member member = memberRepository.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    TeamComposition tc = teamCompositionRepository.findFirstByMemberId(member.getId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Not in a team"));

    Team team = tc.getTeam();

    boolean isResponsible = team.getResponsible() != null
        && team.getResponsible().getId().equals(member.getId());
    boolean isSecondResponsible = team.getSecondResponsible() != null
        && team.getSecondResponsible().getId().equals(member.getId());

    int teamSize = teamCompositionRepository.findAllByTeamId(team.getId()).size();

    if (isResponsible) {
      if (teamSize > 1 && team.getSecondResponsible() == null) {
        throw new ResponseStatusException(HttpStatus.CONFLICT,
            "Vous êtes le seul responsable. Désignez un second responsable avant de quitter.");
      } else if (team.getSecondResponsible() != null) {
        team.setResponsible(team.getSecondResponsible());
        team.setSecondResponsible(null);
      }
      // teamSize == 1 → seul dans l'équipe, on laisse passer
    } else if (isSecondResponsible) {
      team.setSecondResponsible(null);
    }

    teamRepository.save(team);
    teamRepository.flush();

    teamCompositionRepository.delete(tc);
    teamCompositionRepository.flush();
  }

  /**
   * Get the team of the connected member.
   */
  @Transactional
  public TeamResponseDto getTeamOfMemberAsDto(Long memberId) {
    TeamComposition composition = teamCompositionRepository.findByMemberId(memberId)
        .orElseThrow(() -> new ResponseStatusException(
            HttpStatus.NOT_FOUND, "Member has no team"));
    return toDto(composition.getTeam());
  }

  /**
   * Helper: converts a Team entity to a safe DTO (avoids circular JSON serialization).
   */
  public TeamResponseDto toDto(Team team) {
    return new TeamResponseDto(
        team.getId(),
        team.getName(),
        team.getResponsible() != null ? team.getResponsible().getTag() : null,
        team.getSecondResponsible() != null ? team.getSecondResponsible().getTag() : null,
        team.getCreationDate()
    );
  }
}