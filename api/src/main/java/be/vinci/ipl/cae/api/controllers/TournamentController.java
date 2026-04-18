package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.HomepageTournamentsDto;
import be.vinci.ipl.cae.api.models.dtos.MatchResponseDto;
import be.vinci.ipl.cae.api.models.dtos.PlanningRequest;
import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.services.TournamentRegistrationService;
import be.vinci.ipl.cae.api.services.TournamentService;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Tournament controller.
 */
@RestController
@RequestMapping("/tournaments")
public class TournamentController {

  private final TournamentService tournamentService;
  private final TournamentRegistrationService tournamentRegistrationService;

  /**
   * Instantiates a new Tournament controller.
   *
   * @param tournamentService             the tournament service
   * @param tournamentRegistrationService the tournament registration service
   */
  public TournamentController(TournamentService tournamentService,
      TournamentRegistrationService tournamentRegistrationService) {
    this.tournamentService = tournamentService;
    this.tournamentRegistrationService = tournamentRegistrationService;
  }

  /**
   * Create tournament.
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
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
    }
  }

  /**
   * Update tournament.
   */
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public TournamentResponseDto updateTournament(@PathVariable long id,
      @RequestBody TournamentDto dto) {
    try {
      return tournamentService.updateTournament(id, dto);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found", e);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid update data", e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament not in preparation", e);
    }
  }

  /**
   * Publish tournament (rend le tournoi visible au public).
   */
  @PatchMapping("/{id}/publish")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public TournamentResponseDto publishTournament(@PathVariable long id) {
    try {
      return tournamentService.publishTournament(id);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found", e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament cannot be published", e);
    }
  }

  /**
   * Update planning (confirme ou publie le bracket du tournoi).
   */

  @PatchMapping("/{id}/planning")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public TournamentResponseDto updatePlanning(@PathVariable long id,
      @RequestBody PlanningRequest dto) {
    try {
      tournamentService.updatePlanning(id, dto);
      return tournamentService.getTournamentById(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament or team not found", e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Planning update conflict", e);
    }
  }
  /**
   * Gets all matches of a tournament.
   */

  @GetMapping("/{id}/matches")
  @PreAuthorize("isAuthenticated()")
  public List<MatchResponseDto> getMatchesByTournament(@PathVariable long id) {
    try {
      return tournamentService.getMatchesByTournament(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament matches not found", e);
    }
  }

  /**
   * Gets all tournaments.
   */
  @GetMapping
  public List<TournamentResponseDto> getAllTournaments(
      @AuthenticationPrincipal Member currentMember,
      @RequestParam(required = false) String teamName,
      @RequestParam(required = false) String memberTag) {
    boolean isAdmin = currentMember != null && currentMember.getIsAdmin();
    return tournamentService.getAllTournaments(teamName, memberTag, isAdmin);
  }

  /**
   * Gets homepage tournaments.
   */
  @GetMapping("/homepage")
  public HomepageTournamentsDto getHomepageTournaments() {
    return tournamentService.getHomepageTournaments();
  }

  /**
   * Gets tournament by id.
   */
  @GetMapping("/{id}")
  public TournamentResponseDto getTournamentById(@PathVariable long id) {
    try {
      return tournamentService.getTournamentById(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found by id", e);
    }
  }

  /**
   * Register team to tournament.
   */
  @PostMapping("/{idTournament}/teams/{idTeam}")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("isAuthenticated()")
  public void registerTeam(@PathVariable Long idTournament,
      @PathVariable Long idTeam, @AuthenticationPrincipal Member currentMember) {
    tournamentRegistrationService.createRegistration(idTournament, idTeam,
        currentMember.getId());
  }
}