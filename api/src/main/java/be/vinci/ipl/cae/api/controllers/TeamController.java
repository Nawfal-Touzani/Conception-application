package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The type Team controller.
 */
@RestController
@RequestMapping("/teams")
@PreAuthorize("isAuthenticated()")
public class TeamController extends BaseController {

  private final TeamService teamService;

  /**
   * Instantiates a new Team controller.
   *
   * @param teamService      the team service
   * @param memberRepository the member repository
   */
  public TeamController(TeamService teamService, MemberRepository memberRepository) {
    super(memberRepository);
    this.teamService = teamService;
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
}