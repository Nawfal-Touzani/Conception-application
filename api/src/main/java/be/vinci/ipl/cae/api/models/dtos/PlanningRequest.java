package be.vinci.ipl.cae.api.models.dtos;

import java.util.List;
import lombok.Data;

/**
 * Planning request DTO.
 * Reçu depuis le frontend quand l'admin confirme ou publie le planning.
 */
@Data
public class PlanningRequest {

  // "draft" | "confirmed" | "published"
  private String phase;

  private List<RoundDto> rounds;

  /**
   * One round = one list of matches.
   */
  @Data
  public static class RoundDto {
    private List<MatchDto> matches;
  }

  /**
   * One match = two team names.
   */
  @Data
  public static class MatchDto {
    private String team1; // nom de l'équipe A
    private String team2; // nom de l'équipe B
  }
}