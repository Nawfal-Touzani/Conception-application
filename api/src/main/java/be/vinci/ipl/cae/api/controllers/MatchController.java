package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.services.MatchService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;


/**
 * Controller for managing match.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;

  /**
   * Create a new MatchController.
   *
   * @param matchService the match service
   */
  public MatchController(MatchService matchService) {
    this.matchService = matchService;
  }

  /**
   * Encode a match.
   *
   * @param idMatch the match id
   * @param payload the score by the admin
   * @return the result of the match
   */
  @PatchMapping("/{idMatch}/result")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.OK)
  public Match encodeMatch(@PathVariable Long idMatch,
      @RequestBody ResultRequest payload) {

    return matchService.encodingResult(idMatch, payload);

  }
}
