package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.TournamentRepository;
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

@ExtendWith(MockitoExtension.class)
class MatchServiceTest {

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
  private TournamentRepository tournamentRepository;
  @Mock
  private NotificationService notificationService;
  @Mock
  private MatchResultService matchResultService;
  @InjectMocks
  private MatchService matchService;

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

  // getMatchesByTournament
  @Test
  void getMatchesByTournamentShouldReturnMatchesWhenTournamentExists() {
    Tournament tournament = match.getTournament();
    when(tournamentRepository.findById(100L)).thenReturn(Optional.of(tournament));
    when(matchRepository.findByTournamentOrderByRoundNumberAsc(tournament)).thenReturn(
        List.of(match));

    List<Match> result = matchService.getMatchesByTournament(100L);

    assertEquals(1, result.size());
    assertEquals(match, result.get(0));
  }

  @Test
  void getMatchesByTournamentShouldThrowWhenTournamentNotFound() {
    when(tournamentRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class, () -> matchService.getMatchesByTournament(99L));
  }

  // getMatchById
  @Test
  void getMatchByIdShouldReturnMatchWhenFound() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    Match result = matchService.getMatchById(1L);

    assertEquals(match, result);
  }

  @Test
  void getMatchByIdShouldThrowWhenNotFound() {
    when(matchRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(NoSuchElementException.class, () -> matchService.getMatchById(99L));
  }

  // declareForfeit
  @Test
  void declareForfeitShouldSetWinnerToOpponentWhenTeamAisForfeit() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    Match result = matchService.declareForfeit(1L, teamA);

    assertEquals(MatchState.FORFEIT, result.getState());
    assertEquals(teamB, result.getWinner());
    verify(matchResultService).finalizeMatch(match);
  }

  @Test
  void declareForfeitShouldSetWinnerToTeamAsWhenTeamBisForfeit() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    Match result = matchService.declareForfeit(1L, teamB);

    assertEquals(teamA, result.getWinner());
  }

  @Test
  void declareForfeitShouldNotify2ResponsiblesWhenNoSecondResponsible() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    matchService.declareForfeit(1L, teamA);

    verify(notificationService, times(2)).send(anyLong(), any(Notification.class));
  }

  @Test
  void declareForfeitShouldNotify4WhenBothTeamsHaveSecondResponsible() {
    teamA.setSecondResponsible(secondResponsibleA);
    teamB.setSecondResponsible(secondResponsibleB);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    matchService.declareForfeit(1L, teamA);

    verify(notificationService, times(4)).send(anyLong(), any(Notification.class));
  }

  @Test
  void declareForfeitShouldThrowWhenMatchNotScheduled() {
    match.setState(MatchState.PLAYED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class, () -> matchService.declareForfeit(1L, teamA));

    verify(matchRepository, never()).save(any());
  }

  @Test
  void declareForfeitShouldThrowWhenTeamNotInMatch() {
    Team outsider = new Team();
    outsider.setId(99L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class, () -> matchService.declareForfeit(1L, outsider));

    verify(matchRepository, never()).save(any());
  }
}
