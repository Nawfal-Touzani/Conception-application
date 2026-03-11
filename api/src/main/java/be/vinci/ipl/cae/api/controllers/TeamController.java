package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.dtos.TeamResponseDto;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import be.vinci.ipl.cae.api.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team controller.
 */
@RestController
@RequestMapping("/teams")
@PreAuthorize("isAuthenticated()")
public class TeamController extends BaseController {

  private final TeamService teamService;
  private final MembershipRequestService membershipRequestService;

  /**
   * Instantiates a new Team controller.
   */
  public TeamController(TeamService teamService, MemberRepository memberRepository,
                        MembershipRequestService membershipRequestService) {
    super(memberRepository);
    this.teamService = teamService;
    this.membershipRequestService = membershipRequestService;
  }

  /**
   * Helper: converts a Team entity to a safe DTO (avoids circular JSON serialization).
   */
  private TeamResponseDto toDto(Team team) {
    return new TeamResponseDto(
        team.getId(),
        team.getName(),
        team.getResponsible() != null ? team.getResponsible().getTag() : null,
        team.getSecondResponsible() != null ? team.getSecondResponsible().getTag() : null,
        team.getCreationDate()
    );
  }

  /**
   * POST /teams — Create a new team.
   * Returns 201 + TeamResponseDto.
   */
  @PostMapping
  public ResponseEntity<TeamResponseDto> createTeam(@RequestBody CreateTeamRequest request) {
    Team createdTeam = teamService.createTeam(getConnectedMember().getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(toDto(createdTeam));
  }

  /**
   * POST /teams/{teamId}/membership-requests — Request to join a team.
   */
  @PostMapping("/{teamId}/membership-requests")
  @ResponseStatus(HttpStatus.CREATED)
  public MembershipRequest createRequest(@PathVariable long teamId) {
    MembershipRequest result = teamService.createRequest(getConnectedMember().getId(), teamId);
    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    return result;
  }

  /**
   * GET /teams/members — Get members of the connected member's team.
   */
  @GetMapping("/members")
  public ResponseEntity<List<TeamMemberDto>> getTeamMembers() {
    List<TeamMemberDto> members = teamService.getMembersOfMyTeam(getConnectedMember().getId());
    return ResponseEntity.ok(members);
  }

  /**
   * GET /teams — Get all teams.
   */
  @GetMapping
  public List<TeamResponseDto> getAllTeams() {
    // ✅ Also returns DTOs to avoid circular serialization on the list
    return teamService.getAllTeamDtos();
  }

  /**
   * GET /teams/my-team — Get full info of the connected member's team.
   * Returns 404 if the member has no team.
   */
  @GetMapping("/my-team")
  public ResponseEntity<TeamResponseDto> getMyTeam() {
    Team team = teamService.getTeamOfMember(getConnectedMember().getId());
    return ResponseEntity.ok(toDto(team));
  }

  /**
   * DELETE /teams/leave — Leave the current team.
   */
  @DeleteMapping("/leave")
  public ResponseEntity<Void> leaveTeam() {
    teamService.leaveTeam(getConnectedMember().getId());
    return ResponseEntity.noContent().build();
  }
}