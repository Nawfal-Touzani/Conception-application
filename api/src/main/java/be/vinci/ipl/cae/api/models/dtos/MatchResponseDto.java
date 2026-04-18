package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;

/**
 * Dto for match response.
 *
 * @param id           the match id
 * @param scoreA       the score of teamA
 * @param scoreB       the score of teamB
 * @param state        the match state
 * @param resultStatus the result status
 * @param winnerId     the winner team id
 */
public record MatchResponseDto(
    Long id,
    Integer scoreA,
    Integer scoreB,
    MatchState state,
    ResultStatus resultStatus,
    Long winnerId
) {
  public static MatchResponseDto from(be.vinci.ipl.cae.api.models.entities.Match match) {
    return new MatchResponseDto(
        match.getId(),
        match.getScoreA(),
        match.getScoreB(),
        match.getState(),
        match.getResultStatus(),
        match.getWinner() != null ? match.getWinner().getId() : null
    );
  }
}