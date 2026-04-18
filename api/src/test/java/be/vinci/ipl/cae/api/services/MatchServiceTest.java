package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.assertj.core.api.Assertions.assertThat;
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
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import be.vinci.ipl.cae.api.repositories.ValidationResultRepository;
import java.time.LocalDateTime;
import java.util.List;
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

  // ── Mocks ─────────────────────────────────────────────────────────────────

  @Mock private MatchRepository matchRepository;
  @Mock private TournamentRepository tournamentRepository;
  @Mock private NotificationService notificationService;
  @Mock private PlayersSelectionRepository playersSelectionRepository;
  @Mock private ValidationResultRepository validationResultRepository;
  @Mock private MemberRepository memberRepository;
  @Mock private TeamCompositionRepository teamCompositionRepository;
  @Mock private UnavailabilityRepository unavailabilityRepository;

  @InjectMocks
  private MatchService matchService;

  // ── Fixtures ──────────────────────────────────────────────────────────────

  Match match;
  Team teamA;
  Team teamB;
  Member responsibleA;
  Member responsibleB;
  Member secondResponsibleA;
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

    Tournament tournament = new Tournament();
    tournament.setId(100L);
    tournament.setName("Vinci Arena Cup");
    tournament.setMaxParticipants(8);

    match = new Match();
    match.setId(1L);
    match.setTournament(tournament);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setRoundNumber(1);
    match.setDateTime(LocalDateTime.now().plusDays(1));
    match.setState(MatchState.SCHEDULED);
    match.setResultStatus(ResultStatus.NOT_ENTERED);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // encodingResult
  // ─────────────────────────────────────────────────────────────────────────

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

  // ─────────────────────────────────────────────────────────────────────────
  // submitSelection
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Submit selection should save 4 selections when all valid.
   */
  @Test
  void submitSelectionShouldSave4SelectionsWhenAllValid() {
    List<Long> ids = List.of(1L, 2L, 3L, 4L);
    Member m1 = buildMember(1L); Member m2 = buildMember(2L);
    Member m3 = buildMember(3L); Member m4 = buildMember(4L);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(1L)).thenReturn(Optional.of(m1));
    when(memberRepository.findById(2L)).thenReturn(Optional.of(m2));
    when(memberRepository.findById(3L)).thenReturn(Optional.of(m3));
    when(memberRepository.findById(4L)).thenReturn(Optional.of(m4));
    when(teamCompositionRepository.existsByMemberAndTeamId(any(), any())).thenReturn(true);
    when(unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(
        any(), any(), any())).thenReturn(false);
    when(playersSelectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    List<PlayersSelection> result = matchService.submitSelection(1L, teamA, ids);

    assertThat(result).hasSize(4);
    verify(playersSelectionRepository, times(4)).save(any());
  }

  /**
   * Submit selection should throw when match not scheduled.
   */
  @Test
  void submitSelectionShouldThrowWhenMatchNotScheduled() {
    match.setState(MatchState.PLAYED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.submitSelection(1L, teamA, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  /**
   * Submit selection should throw when team not in match.
   */
  @Test
  void submitSelectionShouldThrowWhenTeamNotInMatch() {
    Team outsider = new Team();
    outsider.setId(99L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.submitSelection(1L, outsider, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  /**
   * Submit selection should throw when member not in team.
   */
  @Test
  void submitSelectionShouldThrowWhenMemberNotInTeam() {
    Member outsider = buildMember(99L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(99L)).thenReturn(Optional.of(outsider));
    when(teamCompositionRepository.existsByMemberAndTeamId(outsider, teamA.getId()))
        .thenReturn(false);

    assertThrows(IllegalStateException.class,
        () -> matchService.submitSelection(1L, teamA, List.of(99L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  /**
   * Submit selection should throw when member unavailable.
   */
  @Test
  void submitSelectionShouldThrowWhenMemberUnavailable() {
    Member unavailable = buildMember(1L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(1L)).thenReturn(Optional.of(unavailable));
    when(teamCompositionRepository.existsByMemberAndTeamId(any(), any())).thenReturn(true);
    when(unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(
        any(), any(), any())).thenReturn(true);

    assertThrows(IllegalStateException.class,
        () -> matchService.submitSelection(1L, teamA, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // validateResult
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Validate result should finalize match when both teams validate.
   */
  @Test
  void validateResultShouldFinalizeMatchWhenBothTeamsValidate() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(validationResultRepository.countByMatchAndValidated(match, true)).thenReturn(2L);
    when(matchRepository.save(any())).thenReturn(match);

    matchService.validateResult(1L, teamA);

    verify(matchRepository, times(1)).save(any());
    assertThat(match.getResultStatus()).isEqualTo(ResultStatus.VALIDATED);
  }

  /**
   * Validate result should place winner in next match when next match exists.
   */
  @Test
  void validateResultShouldPlaceWinnerInNextMatchWhenExists() {
    Match nextMatch = new Match();
    nextMatch.setId(2L);
    nextMatch.setTeamA(null);
    nextMatch.setTeamB(null);

    match.setResultStatus(ResultStatus.PENDING);
    match.setWinner(teamA);
    match.setNextMatch(nextMatch);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(validationResultRepository.countByMatchAndValidated(match, true)).thenReturn(2L);
    when(matchRepository.save(any())).thenReturn(match);

    matchService.validateResult(1L, teamA);

    // 1 save pour finalizeMatch (match validé) + 1 save pour nextMatch
    verify(matchRepository, times(2)).save(any());
    assertEquals(teamA, nextMatch.getTeamA());
  }

  /**
   * Validate result should throw when result not pending.
   */
  @Test
  void validateResultShouldThrowWhenResultNotPending() {
    match.setResultStatus(ResultStatus.NOT_ENTERED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.validateResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  /**
   * Validate result should throw when team already responded.
   */
  @Test
  void validateResultShouldThrowWhenTeamAlreadyResponded() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(true);

    assertThrows(IllegalStateException.class,
        () -> matchService.validateResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // contestResult
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Contest result should set refused when valid.
   */
  @Test
  void contestResultShouldSetRefusedWhenValid() {
    match.setResultStatus(ResultStatus.PENDING);
    match.setContestedByTeamA(false);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(matchRepository.save(any())).thenReturn(match);

    matchService.contestResult(1L, teamA);

    assertEquals(ResultStatus.REFUSED, match.getResultStatus());
    assertEquals(true, match.isContestedByTeamA());
  }

  /**
   * Contest result should throw when already contested.
   */
  @Test
  void contestResultShouldThrowWhenAlreadyContested() {
    match.setResultStatus(ResultStatus.PENDING);
    match.setContestedByTeamA(true);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);

    assertThrows(IllegalStateException.class,
        () -> matchService.contestResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // declareForfeit
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Declare forfeit should set winner to opponent when valid.
   */
  @Test
  void declareForfeitShouldSetWinnerToOpponentWhenValid() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any())).thenReturn(match);

    Match result = matchService.declareForfeit(1L, teamA);

    assertEquals(MatchState.FORFEIT, result.getState());
    assertEquals(teamB, result.getWinner());
    assertEquals(ResultStatus.VALIDATED, result.getResultStatus());
  }

  /**
   * Declare forfeit should throw when match not scheduled.
   */
  @Test
  void declareForfeitShouldThrowWhenMatchNotScheduled() {
    match.setState(MatchState.PLAYED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchService.declareForfeit(1L, teamA));

    verify(matchRepository, never()).save(any());
  }

  // ─────────────────────────────────────────────────────────────────────────
  // invalidateSelectionsOnLeave
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Invalidate selections on leave should delete scheduled selections.
   */
  @Test
  void invalidateSelectionsOnLeaveShouldDeleteScheduledSelections() {
    Member member = buildMember(1L);

    matchService.invalidateSelectionsOnLeave(member);

    verify(playersSelectionRepository)
        .deleteByMemberAndMatchState(member, MatchState.SCHEDULED);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helper
  // ─────────────────────────────────────────────────────────────────────────

  private Member buildMember(Long id) {
    Member m = new Member();
    m.setId(id);
    m.setTag("Player" + id);
    return m;
  }
}
