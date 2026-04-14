package be.vinci.ipl.cae.api.services;

import be.vinci.ipl.cae.api.repositories.MatchRepository;
import org.springframework.stereotype.Service;

/**
 * MatchService.
 */
@Service
public class MatchService {

  private final MatchRepository matchRepository;

  /**
   * Create a new MatchService.
   *
   * @param matchRepository match repository
   */
  public MatchService(MatchRepository matchRepository) {
    this.matchRepository = matchRepository;
  }
}
