package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.services.TournamentService;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Tournament controller.
 */

@RestController
@RequestMapping("/tournaments")
public class TournamentController {

  private final TournamentService tournamentService;

  /**
   * Creates a new TournamentController.
   */
  public TournamentController(TournamentService tournamentService) {
    this.tournamentService = tournamentService;
  }

  /**
   * Create a tournament.
   */
  @PostMapping("/{organizerId}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.CREATED)
  public Tournament createTournament(@PathVariable long organizerId,
      @AuthenticationPrincipal Member currentMember, @RequestBody TournamentDto dto) {

    if (currentMember.getId() != organizerId) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }

    try {
      return tournamentService.createTournament(organizerId, dto);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }

  /**
   * GET /tournaments — Get all tournaments.
   * Optional filters: teamName (team registered in the tournament),
   * memberTag (member tag in a registered team).
   */
  @GetMapping
  public List<TournamentResponseDto> getAllTournaments(
      @RequestParam(required = false) String teamName,
      @RequestParam(required = false) String memberTag
  ) {
    return tournamentService.getAllTournaments(teamName,memberTag);
  }

  /**
   * GET /tournaments/{id} — Get a single tournament by id.
   */
  @GetMapping("/{id}")
  public TournamentResponseDto getTournamentById(@PathVariable long id) {
    try {
      return tournamentService.getTournamentById(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    }
  }

}
