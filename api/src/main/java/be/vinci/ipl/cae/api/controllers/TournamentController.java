package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.HomepageTournamentsDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentDto;
import be.vinci.ipl.cae.api.models.dtos.TournamentResponseDto;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.models.entities.TournamentRegistration;
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

@RestController
@RequestMapping("/tournaments")
public class TournamentController {

  private final TournamentService tournamentService;
  private final TournamentRegistrationService tournamentRegistrationService;

  public TournamentController(TournamentService tournamentService,
      TournamentRegistrationService tournamentRegistrationService) {
    this.tournamentService = tournamentService;
    this.tournamentRegistrationService = tournamentRegistrationService;
  }

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
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Tournament create error: " + e.getMessage(), e);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Tournament create error: " + e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Tournament create error: " + e.getMessage(), e);
    }
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public Tournament updateTournament(@PathVariable long id, @RequestBody TournamentDto dto) {
    try {
      return tournamentService.updateTournament(id, dto);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Tournament update error: " + e.getMessage(), e);
    } catch (IllegalArgumentException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
          "Tournament update error: " + e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Tournament update error: " + e.getMessage(), e);
    }
  }

  @PatchMapping("/{id}/publish")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  public Tournament publishTournament(@PathVariable long id) {
    try {
      return tournamentService.publishTournament(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Tournament publish error: " + e.getMessage(), e);
    } catch (IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.CONFLICT,
          "Tournament publish error: " + e.getMessage(), e);
    }
  }

  @GetMapping
  public List<TournamentResponseDto> getAllTournaments(
      @AuthenticationPrincipal Member currentMember,
      @RequestParam(required = false) String teamName,
      @RequestParam(required = false) String memberTag) {
    boolean isAdmin = currentMember != null && currentMember.getIsAdmin();
    return tournamentService.getAllTournaments(teamName, memberTag, isAdmin);
  }

  @GetMapping("/homepage")
  public HomepageTournamentsDto getHomepageTournaments() {
    return tournamentService.getHomepageTournaments();
  }

  @GetMapping("/{id}")
  public TournamentResponseDto getTournamentById(@PathVariable long id) {
    try {
      return tournamentService.getTournamentById(id);
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND,
          "Tournament get error: " + e.getMessage(), e);
    }
  }

  @PostMapping("/{idTournament}/teams/{idTeam}")
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("isAuthenticated()")
  public TournamentRegistration registerTeam(@PathVariable Long idTournament,
      @PathVariable Long idTeam, @AuthenticationPrincipal Member currentMember) {
    try {
      return tournamentRegistrationService.createRegistration(idTournament, idTeam,
          currentMember.getId());
    } catch (NoSuchElementException e) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage(), e);
    } catch (IllegalArgumentException | IllegalStateException e) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage(), e);
    }
  }
}