package be.vinci.ipl.cae.api.models.mappers;

import be.vinci.ipl.cae.api.models.dtos.MatchBracketDto;
import be.vinci.ipl.cae.api.models.dtos.MatchDetailDto;
import be.vinci.ipl.cae.api.models.dtos.PlayerSelectionDto;
import be.vinci.ipl.cae.api.models.dtos.TeamBracketDto;
import be.vinci.ipl.cae.api.models.dtos.TeamMatchDto;
import be.vinci.ipl.cae.api.models.dtos.TeamMatchDto.LineupStatus;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Mapper for Match entities to DTOs.
 */
@Component
public class MatchMapper {

  private final PlayersSelectionRepository playersSelectionRepository;

  /**
   * Creates a new MatchMapper.
   *
   * @param playersSelectionRepository the players selection repository
   */
  public MatchMapper(PlayersSelectionRepository playersSelectionRepository) {
    this.playersSelectionRepository = playersSelectionRepository;
  }

  /**
   * Maps a Match to a MatchBracketDto for the bracket tree view.
   *
   * @param match the match
   * @return the bracket DTO
   */
  public MatchBracketDto toBracketDto(Match match) {
    return new MatchBracketDto(
        match.getId(),
        match.getRoundNumber(),
        buildRoundLabel(match.getRoundNumber(), match.getTournament().getMaxParticipants()),
        match.getTeamA() != null ? new TeamBracketDto(
            match.getTeamA().getId(),
            match.getTeamA().getName()
        ) : null,
        match.getTeamB() != null ? new TeamBracketDto(
            match.getTeamB().getId(),
            match.getTeamB().getName()
        ) : null,
        match.getScoreA(),
        match.getScoreB(),
        match.getWinner() != null ? match.getWinner().getId() : null,
        match.getState().name()
    );
  }

  /**
   * Maps a Match to a MatchDetailDto for the match detail view.
   *
   * @param match the match
   * @return the detail DTO
   */
  public MatchDetailDto toDetailDto(Match match) {
    return new MatchDetailDto(
        match.getId(),
        match.getTournament().getId(),
        match.getTournament().getName(),
        buildRoundLabel(match.getRoundNumber(), match.getTournament().getMaxParticipants()),
        match.getDateTime(),
        match.getState().name(),
        match.getResultStatus().name(),
        match.getTeamA() != null ? toTeamMatchDto(match, match.getTeamA()) : null,
        match.getTeamB() != null ? toTeamMatchDto(match, match.getTeamB()) : null,
        match.getScoreA(),
        match.getScoreB(),
        match.getWinner() != null ? match.getWinner().getId() : null
    );
  }

  private TeamMatchDto toTeamMatchDto(Match match, Team team) {
    // Sélection soumise pour cette team ?
    long selectionCount = playersSelectionRepository.countByMatchAndTeam(match, team);
    boolean hasSelection = selectionCount == 4;

    // Lineup visible uniquement si résultat VALIDATED
    boolean lineupVisible = match.getResultStatus().equals(ResultStatus.VALIDATED);

    LineupStatus status;
    List<PlayerSelectionDto> lineup = null;

    if (!hasSelection) {
      status = LineupStatus.NOT_SELECTED;
    } else if (!lineupVisible) {
      status = LineupStatus.HIDDEN;
    } else {
      status = LineupStatus.VISIBLE;
      lineup = playersSelectionRepository.findByMatchAndTeam(match, team)
          .stream()
          .map(ps -> new PlayerSelectionDto(
              ps.getMember().getId(),
              ps.getMember().getTag(),
              ps.getMember().getImage().getUrl()
          ))
          .toList();
    }

    return new TeamMatchDto(team.getId(), team.getName(), status, lineup);
  }

  private String buildRoundLabel(int roundNumber, int maxParticipants) {
    // totalRounds = log2(maxParticipants)
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
}
