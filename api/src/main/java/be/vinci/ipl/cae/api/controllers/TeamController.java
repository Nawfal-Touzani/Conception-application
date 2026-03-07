package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.TeamService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team controller.
 */
@RestController
@RequestMapping("/teams")
public class TeamController {

  private final TeamService teamService;
  private final MemberRepository memberRepository;

  /**
   * Instantiates a new Team controller.
   *
   * @param teamService      the team service
   * @param memberRepository the member repository
   */
  public TeamController(TeamService teamService, MemberRepository memberRepository) {
    this.teamService = teamService;
    this.memberRepository = memberRepository;
  }

  /**
   * Create team response entity.
   *
   * @param request the request
   * @return the response entity
   */
  @PostMapping
  public ResponseEntity<Team> createTeam(@RequestBody CreateTeamRequest request) {
    String username = (String) SecurityContextHolder.getContext()
        .getAuthentication().getPrincipal();

    Member member = memberRepository.findByEmail(username)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Member not found"));
    Team createdTeam = teamService.createTeam(member.getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(createdTeam);
  }
}