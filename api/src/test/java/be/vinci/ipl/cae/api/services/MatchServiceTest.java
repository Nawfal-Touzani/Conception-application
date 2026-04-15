package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.ResultRequest;
import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * The type Match service test.
 */
@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

  @Mock
  private MatchRepository matchRepository;

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private MatchService matchService;

  /**
   * The Match.
   */
  Match match;
  /**
   * The Team A.
   */
  Team teamA;
  /**
   * The Team B.
   */
  Team teamB;
  /**
   * The Responsible A.
   */
  Member responsibleA;
  /**
   * The Responsible B.
   */
  Member responsibleB;
  /**
   * The Second responsible A.
   */
  Member secondResponsibleA;
  /**
   * The Second responsible B.
   */
  Member secondResponsibleB;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    responsibleA = new Member();
    responsibleA.setId(10L);

    responsibleB = new Member();
    responsibleB.setId(20L);

    secondResponsibleA = new Member();
    secondResponsibleA.setId(11L);

    secondResponsibleB = new Member();
    secondResponsibleB.setId(21L);

    teamA = new Team();
    teamA.setId(1L);
    teamA.setName("TeamA");
    teamA.setResponsible(responsibleA);

    teamB = new Team();
    teamB.setId(2L);
    teamB.setName("TeamB");
    teamB.setResponsible(responsibleB);

    match = new Match();
    match.setId(1L);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setState(MatchState.SCHEDULED);
    match.setResultStatus(ResultStatus.NOT_ENTERED);
  }

  /**
   * Encoding result should set winner team A when score A higher.
   */
  @Test
  void encodingResultShouldSetWinnerTeamAWhenScoreAHigher() {
    ResultRequest dto = new ResultRequest(5, 3);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    Match result = matchService.encodingResult(1L, dto);

    assertEquals(MatchState.PLAYED, result.getState());
    assertEquals(ResultStatus.PENDING, result.getResultStatus());
    assertEquals(5, result.getScoreA());
    assertEquals(3, result.getScoreB());
    assertEquals(teamA, result.getWinner());
    verify(matchRepository).save(match);
    verify(notificationService, times(2)).send(anyLong(), any(Notification.class));
  }

  /**
   * Encoding result should set winner team B when score B higher.
   */
  @Test
  void encodingResultShouldSetWinnerTeamBWhenScoreBHigher() {
    ResultRequest dto = new ResultRequest(2, 5);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    Match result = matchService.encodingResult(1L, dto);

    assertEquals(teamB, result.getWinner());
    assertEquals(MatchState.PLAYED, result.getState());
    assertEquals(ResultStatus.PENDING, result.getResultStatus());
    verify(matchRepository).save(match);
    verify(notificationService, times(2)).send(anyLong(), any(Notification.class));
  }

  /**
   * Encoding result should notify 4 members when both teams have second responsible.
   */
  @Test
  void encodingResultShouldNotify4MembersWhenBothTeamsHaveSecondResponsible() {
    teamA.setSecondResponsible(secondResponsibleA);
    teamB.setSecondResponsible(secondResponsibleB);
    ResultRequest dto = new ResultRequest(5, 3);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    matchService.encodingResult(1L, dto);

    verify(notificationService, times(4)).send(anyLong(), any(Notification.class));
  }

  /**
   * Encoding result should notify 3 members when only team A has second responsible.
   */
  @Test
  void encodingResultShouldNotify3MembersWhenOnlyTeamAHasSecondResponsible() {
    teamA.setSecondResponsible(secondResponsibleA);
    ResultRequest dto = new ResultRequest(5, 3);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    matchService.encodingResult(1L, dto);

    verify(notificationService, times(3)).send(anyLong(), any(Notification.class));
  }

  /**
   * Encoding result should throw when match not found.
   */
  @Test
  void encodingResultShouldThrowWhenMatchNotFound() {
    when(matchRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> matchService.encodingResult(99L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  /**
   * Encoding result should throw when match canceled.
   */
  @Test
  void encodingResultShouldThrowWhenMatchCanceled() {
    match.setState(MatchState.CANCELED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  /**
   * Encoding result should throw when match forfeit.
   */
  @Test
  void encodingResultShouldThrowWhenMatchForfeit() {
    match.setState(MatchState.FORFEIT);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  /**
   * Encoding result should throw when result already entered.
   */
  @Test
  void encodingResultShouldThrowWhenResultAlreadyEntered() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  /**
   * Encoding result should throw when score negative.
   */
  @Test
  void encodingResultShouldThrowWhenScoreNegative() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalArgumentException.class,
        () -> matchService.encodingResult(1L, new ResultRequest(-1, 3)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  /**
   * Encoding result should throw when draw.
   */
  @Test
  void encodingResultShouldThrowWhenDraw() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.encodingResult(1L, new ResultRequest(3, 3)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }
}