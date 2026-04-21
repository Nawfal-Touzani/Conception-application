package be.vinci.ipl.cae.api.schedulers;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.services.MatchResultService;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler for auto-validating pending match results after 2 hours.
 */
@Component
public class MatchValidationScheduler {

  private final MatchRepository matchRepository;
  private final MatchResultService matchResultService;

  /**
   * Creates a new MatchValidationScheduler.
   *
   * @param matchRepository    the match repository
   * @param matchResultService the match result service
   */
  public MatchValidationScheduler(MatchRepository matchRepository,
      MatchResultService matchResultService) {
    this.matchRepository = matchRepository;
    this.matchResultService = matchResultService;
  }

  /**
   * Automatically finalizes matches that have been pending for more than 2 hours.
   * Runs every minute.
   */
  @Scheduled(fixedDelay = 60000)
  public void autoValidatePendingMatches() {
    LocalDateTime deadline = LocalDateTime.now().minusHours(2);

    List<Match> pendingMatches = matchRepository
        .findByResultStatusAndResultEncodedDateBefore(ResultStatus.PENDING, deadline);

    for (Match match : pendingMatches) {
      matchResultService.finalizeMatch(match);
    }
  }
}