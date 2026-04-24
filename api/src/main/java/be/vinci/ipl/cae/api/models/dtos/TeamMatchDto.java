package be.vinci.ipl.cae.api.models.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/**
 * DTO representing a team in the match detail view.
 * lineupStatus controls what the front displays:
 * - NOT_SELECTED : responsible has not yet submitted a lineup
 * - HIDDEN       : lineup submitted but match not finished yet (secret)
 * - VISIBLE      : match finished and result validated, lineup is public
 */
public record TeamMatchDto(
    @NotNull Long id,
    @NotNull String name,
    @NotNull LineupStatus lineupStatus,
    List<PlayerSelectionDto> lineup
) {

  /**
   * Lineup visibility status for a team in a match.
   */
  public enum LineupStatus {
    /**
     * The responsible has not yet submitted a lineup.
     */
    NOT_SELECTED,
    /**
     * Lineup submitted but hidden (match not yet finished).
     */
    HIDDEN,
    /**
     * Lineup visible (result validated).
     */
    VISIBLE
  }
}
