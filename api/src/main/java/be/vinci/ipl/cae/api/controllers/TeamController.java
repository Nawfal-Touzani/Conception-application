package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.dtos.TeamMemberDto;
import be.vinci.ipl.cae.api.models.dtos.TeamResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.services.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
public class TeamController {

  private final TeamService teamService;

  /**
   * Instantiates a new Team controller.
   *
   * @param teamService              the team service
   */
  public TeamController(TeamService teamService) {
    this.teamService = teamService;
  }

  /**
   * POST /teams — Create a new team.
   *
   * @param request       the request
   * @param currentMember the current member
   * @return the team response dto
   */
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TeamResponseDto createTeam(@RequestBody CreateTeamRequest request,
      @AuthenticationPrincipal Member currentMember) {
    try {
      return teamService.createTeam(currentMember.getId(), request);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid team creation data", e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Team name already exists", e);
    }
  }

  /**
   * POST /teams/{teamId}/membership-requests — Request to join a team.
   *
   * @param teamId        the team id
   * @param currentMember the current member
   * @return the membership request
   */
  @PostMapping("/{teamId}/membership-requests")
  @ResponseStatus(HttpStatus.CREATED)
  public MembershipRequest createRequest(@PathVariable long teamId,
      @AuthenticationPrincipal Member currentMember) {
    return teamService.createRequest(currentMember.getId(), teamId);
  }

  /**
   * GET /teams/members — Get members of the connected member's team.
   *
   * @param currentMember the current member
   * @return the team members
   */
  @GetMapping("/members")
  public Iterable<TeamMemberDto> getTeamMembers(@AuthenticationPrincipal Member currentMember) {
    return teamService.getMembersOfMyTeam(currentMember.getId());
  }

  /**
   * GET /teams — Get all teams.
   *
   * @return all teams
   */
  @GetMapping
  public Iterable<TeamResponseDto> getAllTeams() {
    return teamService.getAllTeamDtos();
  }

  /**
   * GET /teams/my-team — Get full info of the connected member's team.
   *
   * @param currentMember the current member
   * @return the team response dto
   */
  @GetMapping("/my-team")
  public TeamResponseDto getMyTeam(@AuthenticationPrincipal Member currentMember) {
    return teamService.getTeamOfMemberAsDto(currentMember.getId());
  }

  /**
   * DELETE /teams/leave — Leave the current team.
   *
   * @param currentMember the current member
   */
  @DeleteMapping("/leave")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void leaveTeam(@AuthenticationPrincipal Member currentMember) {
    try {
      teamService.leaveTeam(currentMember.getEmail());
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found in any team", e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot leave team as last member", e);
    }
  }
}
