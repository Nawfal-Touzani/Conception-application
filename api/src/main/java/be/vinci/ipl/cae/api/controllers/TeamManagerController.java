package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.services.TeamManagerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
public class TeamManagerController {

  private final TeamManagerService teamManagerService;

  /**
   * Instantiates a new Team manager controller.
   *
   * @param teamManagerService the team manager service
   */
  public TeamManagerController(TeamManagerService teamManagerService) {
    this.teamManagerService = teamManagerService;
  }

  /**
   * Assign secondary manager response entity.
   *
   * @param teamId        the team id
   * @param memberId      the member id
   * @param currentMember the current member
   * @return the response entity
   */
  @PutMapping("/{teamId}/secondary-manager/{memberId}")
  public ResponseEntity<Void> assignSecondaryManager(@PathVariable Long teamId,
      @PathVariable Long memberId,
      @AuthenticationPrincipal Member currentMember) {
    try {
      teamManagerService.assignSecondaryManager(teamId, memberId, currentMember.getId());
    } catch (IllegalArgumentException | IllegalStateException e) {
      throw UtilsController.handleException(e);
    }
    return ResponseEntity.noContent().build();
  }
}