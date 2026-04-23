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
  private final TeamService teamService;

  /**
   * Creates a new MatchController.
   */
  public MatchController(MatchService matchService, MatchResultService matchResultService,
      MatchSelectionService matchSelectionService, MatchMapper matchMapper,
      TeamService teamService) {
    this.matchService = matchService;
    this.matchResultService = matchResultService;
    this.matchSelectionService = matchSelectionService;
    this.matchMapper = matchMapper;
    this.teamService = teamService;
  }

  /**
   * Helper method to resolve a team from the authenticated responsible.
   */
  private Team resolveTeam(Member responsible) {
    return teamService.getTeamByResponsible(responsible);
  }

  // public

  /**
   * Gets a match by its id.
   *
   * @param idMatch the match id
   * @param member  the authenticated member if present
   * @return the match detail DTO
   */
  @GetMapping("/{idMatch}")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto getMatch(@PathVariable Long idMatch,
      @AuthenticationPrincipal Member member) {
    Match match = matchService.getMatchById(idMatch);
    return matchMapper.toDetailDto(match, member);
  }

  // member

  /**
   * Gets upcoming matches for the authenticated member.
   *
   * @param member the authenticated member
   * @return list of upcoming match detail DTOs
   */
  @GetMapping("/upcoming")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.OK)
  public List<MatchDetailDto> getUpcomingMatches(@AuthenticationPrincipal Member member) {
    return matchService.getUpcomingMatchesForMember(member).stream()
        .map(match -> matchMapper.toDetailDto(match, member)).toList();
  }

  /**
   * Gets past matches for the authenticated member.
   *
   * @param member the authenticated member
   * @return list of past match detail DTOs
   */
  @GetMapping("/past")
  @PreAuthorize("isAuthenticated()")
  @ResponseStatus(HttpStatus.OK)
  public List<MatchDetailDto> getPastMatches(@AuthenticationPrincipal Member member) {
    return matchService.getPastMatchesForMember(member).stream()
        .map(match -> matchMapper.toDetailDto(match, member)).toList();
  }

  // responsable

  /**
   * Submits a player selection for a match.
   *
   * @param idMatch     the match id
   * @param payload     the selection request
   * @param responsible the authenticated responsible
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/selection")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.CREATED)
  public MatchDetailDto submitSelection(@PathVariable Long idMatch,
      @RequestBody @Valid SelectionRequest payload, @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    matchSelectionService.submitSelection(idMatch, team, payload.memberIds());
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch), responsible);
  }

  /**
   * Modifies the player selection for a match.
   *
   * @param idMatch     the match id
   * @param payload     the new selection request
   * @param responsible the authenticated responsible
   * @return the updated match detail DTO
   */
  @PutMapping("/{idMatch}/selection")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto modifySelection(@PathVariable Long idMatch,
      @RequestBody @Valid SelectionRequest payload, @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    matchSelectionService.modifySelection(idMatch, team, payload.memberIds());
    return matchMapper.toDetailDto(matchService.getMatchById(idMatch), responsible);
  }

  /**
   * Validates a match result for the authenticated responsible's team.
   *
   * @param idMatch     the match id
   * @param responsible the authenticated responsible
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/validate")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto validateResult(@PathVariable Long idMatch,
      @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    Match match = matchResultService.validateResult(idMatch, team);
    return matchMapper.toDetailDto(match, responsible);
  }

  /**
   * Contests a match result for the authenticated responsible's team.
   *
   * @param idMatch     the match id
   * @param responsible the authenticated responsible
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/contest")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto contestResult(@PathVariable Long idMatch,
      @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    Match match = matchResultService.contestResult(idMatch, team);
    return matchMapper.toDetailDto(match, responsible);
  }

  /**
   * Declares forfeit for the authenticated responsible's team.
   *
   * @param idMatch     the match id
   * @param responsible the authenticated responsible
   * @return the updated match detail DTO
   */
  @PostMapping("/{idMatch}/forfeit")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto declareForfeit(@PathVariable Long idMatch,
      @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    Match match = matchService.declareForfeit(idMatch, team);
    return matchMapper.toDetailDto(match, responsible);
  }

  /**
   * Gets the list of eligible members for a specific match.
   *
   * @param idMatch     the match id
   * @param responsible the authenticated responsible
   * @return a list of eligible members
   */
  @GetMapping("/{idMatch}/selection/eligible")
  @PreAuthorize("hasRole('ROLE_RESPONSIBLE')")
  @ResponseStatus(HttpStatus.OK)
  public List<MemberSelectionDto> getEligibleMembers(@PathVariable Long idMatch,
      @AuthenticationPrincipal Member responsible) {
    Team team = resolveTeam(responsible);
    return matchSelectionService.getEligibleMembers(idMatch, team);
  }

  // admin

  /**
   * Encodes a match result.
   *
   * @param idMatch       the match id
   * @param payload       the score
   * @param currentMember the authenticated admin
   * @return the updated match detail DTO
   */
  @PatchMapping("/{idMatch}/result")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto encodeResult(@PathVariable Long idMatch,
      @RequestBody @Valid ResultRequest payload, @AuthenticationPrincipal Member currentMember) {
    Match match = matchResultService.encodingResult(idMatch, payload, currentMember);
    return matchMapper.toDetailDto(match, currentMember);
  }

  /**
   * Corrects a contested match result.
   *
   * @param idMatch       the match id
   * @param payload       the corrected score
   * @param currentMember the authenticated admin
   * @return the updated match detail DTO
   */
  @PutMapping("/{idMatch}/result/correction")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @ResponseStatus(HttpStatus.OK)
  public MatchDetailDto correctResult(@PathVariable Long idMatch,
      @RequestBody @Valid ResultRequest payload, @AuthenticationPrincipal Member currentMember) {
    Match match = matchResultService.correctResult(idMatch, payload);
    return matchMapper.toDetailDto(match, currentMember);
  }
}
