package be.vinci.ipl.cae.api.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.NotificationRepository;
import be.vinci.ipl.cae.api.repositories.ValidationResultRepository;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchResultServiceTest {

  Match match;
  Team teamA;
  Team teamB;
  Member responsibleA;
  Member responsibleB;
  Member secondResponsibleA;
  Member secondResponsibleB;
  @Mock
  private MatchRepository matchRepository;
  @Mock
  private ValidationResultRepository validationResultRepository;
  @Mock
  private NotificationService notificationService;
  @Mock
  private NotificationRepository notificationRepository;
  @Mock  // Garder les 2 mocks meme inutilisé poir que l'inject mock de matchResultService fonctionne
  private MemberRepository memberRepository;

  @InjectMocks
  private MatchResultService matchResultService;

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

  // encodingResult
  @Test
  void encodingResultShouldSetWinnerTeamAsWhenScoreAsHigher() {
    ResultRequest dto = new ResultRequest(5, 3);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    Match result = matchResultService.encodingResult(1L, dto);

    assertEquals(MatchState.PLAYED, result.getState());
    assertEquals(ResultStatus.PENDING, result.getResultStatus());
    assertEquals(5, result.getScoreA());
    assertEquals(3, result.getScoreB());
    assertEquals(teamA, result.getWinner());
    verify(matchRepository).save(match);
    verify(notificationService, times(2)).send(anyLong(), any(Notification.class));
  }

  @Test
  void encodingResultShouldSetWinnerTeamBsWhenScoreBsHigher() {
    ResultRequest dto = new ResultRequest(2, 5);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    Match result = matchResultService.encodingResult(1L, dto);

    assertEquals(teamB, result.getWinner());
    assertEquals(MatchState.PLAYED, result.getState());
    assertEquals(ResultStatus.PENDING, result.getResultStatus());
    verify(matchRepository).save(match);
    verify(notificationService, times(2)).send(anyLong(), any(Notification.class));
  }

  @Test
  void encodingResultShouldNotify4MembersWhenBothTeamsHaveSecondResponsible() {
    teamA.setSecondResponsible(secondResponsibleA);
    teamB.setSecondResponsible(secondResponsibleB);
    ResultRequest dto = new ResultRequest(5, 3);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    matchResultService.encodingResult(1L, dto);

    verify(notificationService, times(4)).send(anyLong(), any(Notification.class));
  }

  @Test
  void encodingResultShouldNotify3MembersWhenOnlyTeamAsHasSecondResponsible() {
    teamA.setSecondResponsible(secondResponsibleA);
    ResultRequest dto = new ResultRequest(5, 3);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any(Match.class))).thenReturn(match);

    matchResultService.encodingResult(1L, dto);

    verify(notificationService, times(3)).send(anyLong(), any(Notification.class));
  }

  @Test
  void encodingResultShouldThrowWhenMatchNotFound() {
    when(matchRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> matchResultService.encodingResult(99L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any());
  }

  @Test
  void encodingResultShouldThrowWhenMatchCanceled() {
    match.setState(MatchState.CANCELED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchResultService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void encodingResultShouldThrowWhenMatchForfeit() {
    match.setState(MatchState.FORFEIT);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchResultService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void encodingResultShouldThrowWhenResultAlreadyEntered() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchResultService.encodingResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void encodingResultShouldThrowWhenScoreNegative() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalArgumentException.class,
        () -> matchResultService.encodingResult(1L, new ResultRequest(-1, 3)));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void encodingResultShouldThrowWhenDraw() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchResultService.encodingResult(1L, new ResultRequest(3, 3)));

    verify(matchRepository, never()).save(any());
  }

  // validateResult
  @Test
  void validateResultShouldFinalizeMatchWhenBothTeamsValidate() {
    match.setResultStatus(ResultStatus.PENDING);
    match.setWinner(teamA);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(validationResultRepository.countByMatchAndValidated(match, true)).thenReturn(2L);
    when(matchRepository.save(any())).thenReturn(match);

    matchResultService.validateResult(1L, teamA);

    verify(matchRepository, times(1)).save(any());
    assertThat(match.getResultStatus()).isEqualTo(ResultStatus.VALIDATED);
  }

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

    matchResultService.validateResult(1L, teamA);

    // 1 save match valide + 1 save nextMatch
    verify(matchRepository, times(2)).save(any());
    assertEquals(teamA, nextMatch.getTeamA());
  }

  @Test
  void validateResultShouldNotSaveNextMatchWhenTeamBsSlotAvailable() {
    Match nextMatch = new Match();
    nextMatch.setId(2L);
    nextMatch.setTeamA(teamB); // teamA déjà remplie, le gagnant ira en teamB
    nextMatch.setTeamB(null);

    match.setResultStatus(ResultStatus.PENDING);
    match.setWinner(teamA);
    match.setNextMatch(nextMatch);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(validationResultRepository.countByMatchAndValidated(match, true)).thenReturn(2L);
    when(matchRepository.save(any())).thenReturn(match);

    matchResultService.validateResult(1L, teamA);

    assertEquals(teamA, nextMatch.getTeamB());
    verify(matchRepository, times(2)).save(any());
  }

  @Test
  void validateResultShouldThrowWhenResultNotPending() {
    match.setResultStatus(ResultStatus.NOT_ENTERED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class, () -> matchResultService.validateResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  @Test
  void validateResultShouldThrowWhenTeamAlreadyResponded() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(true);

    assertThrows(IllegalStateException.class, () -> matchResultService.validateResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  @Test
  void validateResultShouldNotFinalizeWhenOnlyOneTeamValidated() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(validationResultRepository.countByMatchAndValidated(match, true)).thenReturn(1L);

    matchResultService.validateResult(1L, teamA);

    // Pas encore finalisé : pas de save sur le match
    verify(matchRepository, never()).save(any());
    assertThat(match.getResultStatus()).isEqualTo(ResultStatus.PENDING);
  }

  // contestResult
  @Test
  void contestResultShouldSetRefusedWhenValid() {
    match.setResultStatus(ResultStatus.PENDING);
    match.setContestedByTeamA(false);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);
    when(validationResultRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    when(matchRepository.save(any())).thenReturn(match);

    matchResultService.contestResult(1L, teamA);

    assertEquals(ResultStatus.REFUSED, match.getResultStatus());
    assertTrue(match.isContestedByTeamA());
  }

  @Test
  void contestResultShouldThrowWhenAlreadyContested() {
    match.setResultStatus(ResultStatus.PENDING);
    match.setContestedByTeamA(true);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(false);

    assertThrows(IllegalStateException.class, () -> matchResultService.contestResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  @Test
  void contestResultShouldThrowWhenResultNotPending() {
    match.setResultStatus(ResultStatus.NOT_ENTERED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class, () -> matchResultService.contestResult(1L, teamA));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void contestResultShouldThrowWhenTeamAlreadyResponded() {
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(validationResultRepository.existsByMatchAndTeam(match, teamA)).thenReturn(true);

    assertThrows(IllegalStateException.class, () -> matchResultService.contestResult(1L, teamA));

    verify(validationResultRepository, never()).save(any());
  }

  // correctResult
  @Test
  void correctResultShouldUpdateScoreAndWinnerWhenValid() {
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.REFUSED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(matchRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Match result = matchResultService.correctResult(1L, new ResultRequest(4, 2));

    assertEquals(4, result.getScoreA());
    assertEquals(2, result.getScoreB());
    assertEquals(teamA, result.getWinner());
    assertEquals(ResultStatus.VALIDATED, result.getResultStatus());
  }

  @Test
  void correctResultShouldThrowWhenMatchNotFound() {
    when(matchRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class,
        () -> matchResultService.correctResult(99L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void correctResultShouldThrowWhenResultNotRefused() {
    match.setState(MatchState.PLAYED);
    match.setResultStatus(ResultStatus.PENDING);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchResultService.correctResult(1L, new ResultRequest(3, 1)));

    verify(matchRepository, never()).save(any());
  }
}
