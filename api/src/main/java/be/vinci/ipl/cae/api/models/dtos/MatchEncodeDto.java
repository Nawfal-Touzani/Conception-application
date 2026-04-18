package be.vinci.ipl.cae.api.models.dtos;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;

/**
 * Match encode dto.
 */
public record MatchEncodeDto(
    Long id,
    Integer scoreA,
    Integer scoreB,
    MatchState state,
    ResultStatus resultStatus,
    Long winnerId
) {

  /**
   * Transform match to encode Match dto.
   */
  public static MatchEncodeDto from(Match match) {
    return new MatchEncodeDto(
        match.getId(),
        match.getScoreA(),
        match.getScoreB(),
        match.getState(),
        match.getResultStatus(),
        match.getWinner() != null ? match.getWinner().getId() : null
    );
  }
}
