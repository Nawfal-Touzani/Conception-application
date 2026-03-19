package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.dtos.TeamResponseDto;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.MembershipRequestService;
import be.vinci.ipl.cae.api.services.TeamService;
import java.util.List;
import org.springframework.http.HttpStatus;
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
   * POST /teams — Create a new team.
   * Returns 201 + TeamResponseDto.
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TeamResponseDto createTeam(@RequestBody CreateTeamRequest request) {
    try {
      return teamService.createTeam(getConnectedMember().getId(), request);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }

  /**
   * POST /teams/{teamId}/membership-requests — Request to join a team.
   */
  @PostMapping("/{teamId}/membership-requests")
  @ResponseStatus(HttpStatus.CREATED)
  public MembershipRequest createRequest(@PathVariable long teamId) {
    try {
      return teamService.createRequest(getConnectedMember().getId(), teamId);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * GET /teams/members — Get members of the connected member's team.
   */
  @GetMapping("/members")
  public List<TeamMemberDto> getTeamMembers() {
    try {
      return teamService.getMembersOfMyTeam(getConnectedMember().getId());
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * GET /teams — Get all teams.
   */
  @GetMapping
  public List<TeamResponseDto> getAllTeams() {
    //  Also returns DTOs to avoid circular serialization on the list
    return teamService.getAllTeamDtos();
  }

  /**
   * GET /teams/my-team — Get full info of the connected member's team.
   * Returns 404 if the member has no team.
   */
  @GetMapping("/my-team")
  public TeamResponseDto getMyTeam() {
    try {
      return teamService.getTeamOfMemberAsDto(getConnectedMember().getId());
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

  /**
   * DELETE /teams/leave — Leave the current team.
   */
  @DeleteMapping("/leave")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void leaveTeam() {
    try {
      teamService.leaveTeam(getConnectedMember().getEmail());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }
}