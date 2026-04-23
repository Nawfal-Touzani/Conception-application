package be.vinci.ipl.cae.api.models.mappers;

import be.vinci.ipl.cae.api.models.dtos.MatchBracketDto;
import be.vinci.ipl.cae.api.models.dtos.MatchDetailDto;
import be.vinci.ipl.cae.api.models.dtos.PlayerSelectionDto;
import be.vinci.ipl.cae.api.models.dtos.TeamBracketDto;
import be.vinci.ipl.cae.api.models.dtos.TeamMatchDto;
import be.vinci.ipl.cae.api.models.dtos.TeamMatchDto.LineupStatus;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Team;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for Match entities to DTOs.
 */
@Component
public class MatchMapper {

  /**
   * Maps a Match to a MatchBracketDto for the bracket tree view.
   *
   * @param match the match
   * @return the bracket DTO
   */
  public MatchBracketDto toBracketDto(Match match) {
    PublicScoreInfo scores = getPublicScoreInfo(match);

    return new MatchBracketDto(match.getId(), match.getRoundNumber(),
        buildRoundLabel(match.getRoundNumber(), match.getTournament().getMaxParticipants()),
        match.getTeamA() != null ? new TeamBracketDto(match.getTeamA().getId(),
            match.getTeamA().getName()) : null,
        match.getTeamB() != null ? new TeamBracketDto(match.getTeamB().getId(),
            match.getTeamB().getName()) : null, scores.scoreA(), scores.scoreB(), scores.winnerId(),
        match.getState().name());
  }

  /**
   * Maps a Match to a MatchDetailDto for the match detail view.
   *
   * @param match       the match
   * @param currentUser the authenticated member, can be null
   * @return the detail DTO
   */
  public MatchDetailDto toDetailDto(Match match, Member currentUser) {
    PublicScoreInfo scores = getPublicScoreInfo(match);

    return new MatchDetailDto(match.getId(), match.getTournament().getId(),
        match.getTournament().getName(),
        buildRoundLabel(match.getRoundNumber(), match.getTournament().getMaxParticipants()),
        match.getDateTime(), match.getState().name(), match.getResultStatus().name(),
        match.getTeamA() != null ? toTeamMatchDto(match, match.getTeamA(), currentUser) : null,
        match.getTeamB() != null ? toTeamMatchDto(match, match.getTeamB(), currentUser) : null,
        scores.scoreA(), scores.scoreB(), scores.winnerId());
  }

  /**
   * Optional overload for public or legacy calls.
   *
   * @param match the match
   * @return the detail DTO
   */
  public MatchDetailDto toDetailDto(Match match) {
    return toDetailDto(match, null);
  }

  private TeamMatchDto toTeamMatchDto(Match match, Team team, Member currentUser) {
    List<PlayersSelection> teamSelections = match.getPlayersSelections().stream()
        .filter(ps -> ps.getTeam().getId().equals(team.getId())).toList();

    boolean hasSelection = !teamSelections.isEmpty();
    boolean lineupVisible = !match.getResultStatus().equals(ResultStatus.NOT_ENTERED);

    boolean isResponsibleOfTeam =
        currentUser != null && (team.getResponsible().getId().equals(currentUser.getId()) || (
            team.getSecondResponsible() != null && team.getSecondResponsible().getId()
                .equals(currentUser.getId())));

    LineupStatus status;
    List<PlayerSelectionDto> lineup = null;

    if (!hasSelection) {
      status = LineupStatus.NOT_SELECTED;
    } else if (!lineupVisible) {
      status = LineupStatus.HIDDEN;

      if (isResponsibleOfTeam) {
        lineup = toPlayerSelectionDtos(teamSelections);
      }
    } else {
      status = LineupStatus.VISIBLE;

      lineup = toPlayerSelectionDtos(teamSelections);
    }

    return new TeamMatchDto(team.getId(), team.getName(), status, lineup);
  }

  private String buildRoundLabel(int roundNumber, int maxParticipants) {
    int totalRounds = (int) (Math.log(maxParticipants) / Math.log(2));
    int roundFromFinal = totalRounds - roundNumber + 1;

    return switch (roundFromFinal) {
      case 1 -> "Finale";
      case 2 -> "Demi-finale";
      case 3 -> "Quarts de finale";
      case 4 -> "Huitièmes de finale";
      default -> "Tour " + roundFromFinal;
    };
  }

  /**
   * Extracts and masks the scores based on the match validation status.
   *
   * @param match the match
   * @return a record containing the public scores and winner id
   */
  private PublicScoreInfo getPublicScoreInfo(Match match) {
    boolean isPublic = match.getResultStatus().equals(ResultStatus.VALIDATED);
    return new PublicScoreInfo(isPublic ? match.getScoreA() : null,
        isPublic ? match.getScoreB() : null,
        isPublic && match.getWinner() != null ? match.getWinner().getId() : null);
  }

  /**
   * Helper record to hold masked public scores.
   */
  private record PublicScoreInfo(Integer scoreA, Integer scoreB, Long winnerId) {

  }

  private List<PlayerSelectionDto> toPlayerSelectionDtos(List<PlayersSelection> teamSelections) {
    return teamSelections.stream()
        .map(ps -> new PlayerSelectionDto(
            ps.getMember().getId(),
            ps.getMember().getTag(),
            ps.getMember().getImage().getUrl()
        ))
        .toList();
  }
}
