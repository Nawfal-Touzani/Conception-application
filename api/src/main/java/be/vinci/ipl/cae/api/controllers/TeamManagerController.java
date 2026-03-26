package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.services.TeamManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * The type Team manager controller.
 */
@RestController
@RequestMapping("/teams")
@PreAuthorize("isAuthenticated()")
public class TeamManagerController extends BaseController {

  private final TeamManagerService teamManagerService;

  /**
   * Instantiates a new Team manager controller.
   *
   * @param teamManagerService the team manager service
   * @param memberRepository   the member repository
   */
  public TeamManagerController(TeamManagerService teamManagerService,
      MemberRepository memberRepository) {
    super(memberRepository);
    this.teamManagerService = teamManagerService;
  }

  /**
   * Assign secondary manager response entity.
   *
   * @param teamId   the team id
   * @param memberId the member id
   * @return the response entity
   */
  @PutMapping("/{teamId}/secondary-manager/{memberId}")
  public ResponseEntity<Void> assignSecondaryManager(@PathVariable Long teamId,
      @PathVariable Long memberId) {
    executeOrThrow(() -> teamManagerService.assignSecondaryManager(teamId, memberId,
        getConnectedMember().getId()));
    return ResponseEntity.noContent().build();
  }
}