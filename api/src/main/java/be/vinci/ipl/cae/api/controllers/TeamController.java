package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import be.vinci.ipl.cae.api.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
   *
   * @param teamService      the team service
   * @param memberRepository the member repository
   */
  public TeamController(TeamService teamService, MemberRepository memberRepository,
      MembershipRequestService membershipRequestService) {
    super(memberRepository);
    this.teamService = teamService;
    this.membershipRequestService = membershipRequestService;
  }

  /**
   * Create team response entity.
   *
   * @param request the request
   * @return the response entity
   */
  @PostMapping
  public ResponseEntity<Team> createTeam(@RequestBody CreateTeamRequest request) {
    Team createdTeam = teamService.createTeam(getConnectedMember().getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
  }

  /**
   * Creates a membership request for the connected member to join a team.
   */
  @PostMapping("/{teamId}/membership-requests")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.CREATED)

  public MembershipRequest createRequest(@PathVariable long teamId) {
    MembershipRequest result = teamService.createRequest(getConnectedMember().getId(), teamId);

    if (result == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }

    return result;
  }

  /**
   * Get team members response entity.
   *
   * @return the response entity
   */
  @GetMapping("/members")
  public ResponseEntity<List<TeamMemberDto>> getTeamMembers() {

    List<TeamMemberDto> members = teamService.getMembersOfMyTeam(getConnectedMember().getId());

    return ResponseEntity.ok(members);
  }
}