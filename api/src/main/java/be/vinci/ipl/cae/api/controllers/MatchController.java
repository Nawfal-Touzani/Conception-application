package be.vinci.ipl.cae.api.controllers;

import be.vinci.ipl.cae.api.models.dtos.MatchDetailDto;
import be.vinci.ipl.cae.api.models.dtos.MemberSelectionDto;
import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.dtos.SelectionRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.mappers.MatchMapper;
import be.vinci.ipl.cae.api.services.MatchResultService;
import be.vinci.ipl.cae.api.services.MatchSelectionService;
import be.vinci.ipl.cae.api.services.MatchService;
import be.vinci.ipl.cae.api.services.MemberService;
import be.vinci.ipl.cae.api.services.TeamService;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for managing matches.
 */
@RestController
@RequestMapping("/matches")
public class MatchController {

  private final MatchService matchService;
  private final MatchResultService matchResultService;
  private final MatchSelectionService matchSelectionService;
  private final MatchMapper matchMapper;
  private final MemberService memberService;
  private final TeamService teamService;

  /**
   * Creates a new MatchController.
   */
  public MatchController(MatchService matchService, MatchResultService matchResultService,
      MatchSelectionService matchSelectionService, MatchMapper matchMapper,
      MemberService memberService, TeamService teamService) {
    this.matchService = matchService;
    this.matchResultService = matchResultService;
    this.matchSelectionService = matchSelectionService;
    this.matchMapper = matchMapper;
    this.memberService = memberService;
    this.teamService = teamService;
  }

  // PUBLIC

  /**
   * Gets a match by its id. Returns the full detail view including lineups if result is VALIDATED.
   *
   * @param idMatch the match id
   * @return the match detail DTO
   */
  @GetMapping("/{idMatch}")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto getMatch(@PathVariable Long idMatch) {
    Match match = matchService.getMatchById(idMatch);
    return matchMapper.toDetailDto(match);
  }

  // MEMBER

  /**
   * Gets upcoming matches for the authenticated member.
   *
   * @param email the authenticated member's email (from JWT)
   * @return list of upcoming match detail DTOs
   */
  @GetMapping("/upcoming")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.OK)
  public List<MatchDetailDto> getUpcomingMatches(@AuthenticationPrincipal String email) {
    Member member = memberService.getByEmail(email);
    return matchService.getUpcomingMatchesForMember(member).stream().map(matchMapper::toDetailDto)
        .toList();
  }

  /**
   * Gets past matches for the authenticated member.
   *
   * @param email the authenticated member's email (from JWT)
   * @return list of past match detail DTOs
   */
  @GetMapping("/past")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.OK)
  public List<MatchDetailDto> getPastMatches(@AuthenticationPrincipal String email) {
    Member member = memberService.getByEmail(email);
    return matchService.getPastMatchesForMember(member).stream().map(matchMapper::toDetailDto)
        .toList();
  }

  // RESPONSABLE

  /**
   * Submits a player selection for a match.
   *
   * @param idMatch the match id
   * @param payload the selection request with 4 member ids
   * @param email   the authenticated responsible's email
   * @return the match detail DTO with updated lineup status
   */
  @PostMapping("/{idMatch}/selection")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.CREATED)
  public MatchDetailDto submitSelection(@PathVariable Long idMatch,
      @RequestBody @Valid SelectionRequest payload, @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    matchSelectionService.submitSelection(idMatch, team, payload.memberIds());
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch));
  }

  /**
   * Modifies the player selection for a match.
   *
   * @param idMatch the match id
   * @param payload the new selection with 4 member ids
   * @param email   the authenticated responsible's email
   * @return the match detail DTO with updated lineup status
   */
  @PutMapping("/{idMatch}/selection")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto modifySelection(@PathVariable Long idMatch,
      @RequestBody @Valid SelectionRequest payload, @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    matchSelectionService.modifySelection(idMatch, team, payload.memberIds());
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch));
  }

  /**
   * Validates a match result for the authenticated responsible's team.
   *
   * @param idMatch the match id
   * @param email   the authenticated responsible's email
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/validate")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto validateResult(@PathVariable Long idMatch,
      @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    matchResultService.validateResult(idMatch, team);
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch));
  }

  /**
   * Contests a match result for the authenticated responsible's team.
   *
   * @param idMatch the match id
   * @param email   the authenticated responsible's email
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/contest")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto contestResult(@PathVariable Long idMatch,
      @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    matchResultService.contestResult(idMatch, team);
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch));
  }

  /**
   * Declares forfeit for the authenticated responsible's team.
   *
   * @param idMatch the match id
   * @param email   the authenticated responsible's email
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/forfeit")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto declareForfeit(@PathVariable Long idMatch,
      @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    matchService.declareForfeit(idMatch, team);
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch));
  }

  // ADMIN

  /**
   * Encodes a match result.
   *
   * @param idMatch the match id
   * @param payload the score
   * @return the updated match detail DTO
   */
  @PatchMapping("/{idMatch}/result")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto encodeResult(@PathVariable Long idMatch,
      @RequestBody @Valid ResultRequest payload) {
    Match match = matchResultService.encodingResult(idMatch, payload);
    return matchMapper.toDetailDto(match);
  }

  /**
   * Corrects a contested match result.
   *
   * @param idMatch the match id
   * @param payload the corrected score
   * @return the updated match detail DTO
   */
  @PutMapping("/{idMatch}/result")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto correctResult(@PathVariable Long idMatch,
      @RequestBody @Valid ResultRequest payload) {
    Match match = matchResultService.correctResult(idMatch, payload);
    return matchMapper.toDetailDto(match);
  }

  /**
   * Gets the list of eligible members for a specific match. Returns all members of the
   * authenticated responsible's team along with their availability status for the date of the
   * match.
   *
   * @param idMatch the match id
   * @param email   the authenticated responsible's email
   * @return a list of member selection DTOs indicating availability
   */
  @GetMapping("/{idMatch}/selection/eligible")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public List<MemberSelectionDto> getEligibleMembers(@PathVariable Long idMatch,
      @AuthenticationPrincipal String email) {
    Member responsible = memberService.getByEmail(email);
    Team team = teamService.getTeamByResponsible(responsible);
    return matchSelectionService.getEligibleMembers(idMatch, team);
  }
}
