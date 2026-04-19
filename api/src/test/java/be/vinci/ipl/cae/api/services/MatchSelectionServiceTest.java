package be.vinci.ipl.cae.api.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Match;
import be.vinci.ipl.cae.api.models.entities.Match.MatchState;
import be.vinci.ipl.cae.api.models.entities.Match.ResultStatus;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.PlayersSelection;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.Tournament;
import be.vinci.ipl.cae.api.repositories.MatchRepository;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.PlayersSelectionRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.UnavailabilityRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MatchSelectionServiceTest {

  Match match;
  Team teamA;
  Team teamB;
  @Mock
  private MatchRepository matchRepository;
  @Mock
  private PlayersSelectionRepository playersSelectionRepository;
  @Mock
  private MemberRepository memberRepository;
  @Mock
  private TeamCompositionRepository teamCompositionRepository;
  @Mock
  private UnavailabilityRepository unavailabilityRepository;
  @Mock
  private NotificationService notificationService;
  @InjectMocks
  private MatchSelectionService matchSelectionService;

  @BeforeEach
  void setUp() {
    Member responsibleA = new Member();
    responsibleA.setId(10L);

    teamA = new Team();
    teamA.setId(1L);
    teamA.setName("TeamA");
    teamA.setResponsible(responsibleA);

    teamB = new Team();
    teamB.setId(2L);
    teamB.setName("TeamB");

    Tournament tournament = new Tournament();
    tournament.setId(100L);
    tournament.setMaxParticipants(8);

    match = new Match();
    match.setId(1L);
    match.setTournament(tournament);
    match.setTeamA(teamA);
    match.setTeamB(teamB);
    match.setDateTime(LocalDateTime.now().plusDays(1));
    match.setState(MatchState.SCHEDULED);
    match.setResultStatus(ResultStatus.NOT_ENTERED);
  }

  // submitSelection
  @Test
  void submitSelectionShouldSave4SelectionsWhenAllValid() {
    List<Long> ids = List.of(1L, 2L, 3L, 4L);
    Member m1 = buildMember(1L);
    Member m2 = buildMember(2L);
    Member m3 = buildMember(3L);
    Member m4 = buildMember(4L);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(1L)).thenReturn(Optional.of(m1));
    when(memberRepository.findById(2L)).thenReturn(Optional.of(m2));
    when(memberRepository.findById(3L)).thenReturn(Optional.of(m3));
    when(memberRepository.findById(4L)).thenReturn(Optional.of(m4));
    when(teamCompositionRepository.existsByMemberAndTeamId(any(), any())).thenReturn(true);
    when(unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(any(), any(),
        any())).thenReturn(false);
    when(playersSelectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    List<PlayersSelection> result = matchSelectionService.submitSelection(1L, teamA, ids);

    assertThat(result).hasSize(4);
    verify(playersSelectionRepository, times(4)).save(any());
  }

  @Test
  void submitSelectionShouldThrowWhenNotExactly4Players() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalArgumentException.class,
        () -> matchSelectionService.submitSelection(1L, teamA, List.of(1L, 2L, 3L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  @Test
  void submitSelectionShouldThrowWhenMatchNotScheduled() {
    match.setState(MatchState.PLAYED);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchSelectionService.submitSelection(1L, teamA, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  @Test
  void submitSelectionShouldThrowWhenTeamNotInMatch() {
    Team outsider = new Team();
    outsider.setId(99L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

    assertThrows(IllegalStateException.class,
        () -> matchSelectionService.submitSelection(1L, outsider, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  @Test
  void submitSelectionShouldThrowWhenMemberNotInTeam() {
    Member outsider = buildMember(99L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(99L)).thenReturn(Optional.of(outsider));
    when(teamCompositionRepository.existsByMemberAndTeamId(outsider, teamA.getId())).thenReturn(
        false);

    assertThrows(IllegalStateException.class,
        () -> matchSelectionService.submitSelection(1L, teamA, List.of(99L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  @Test
  void submitSelectionShouldThrowWhenMemberUnavailable() {
    Member unavailable = buildMember(1L);
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(memberRepository.findById(1L)).thenReturn(Optional.of(unavailable));
    when(teamCompositionRepository.existsByMemberAndTeamId(any(), any())).thenReturn(true);
    when(unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(any(), any(),
        any())).thenReturn(true);

    assertThrows(IllegalStateException.class,
        () -> matchSelectionService.submitSelection(1L, teamA, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).save(any());
  }

  // modifySelection
  @SuppressWarnings("checkstyle:VariableDeclarationUsageDistance")
  @Test
  void modifySelectionShouldReplaceExistingSelectionWhenValid() {
    List<Long> ids = List.of(1L, 2L, 3L, 4L);
    Member m1 = buildMember(1L);
    Member m2 = buildMember(2L);
    Member m3 = buildMember(3L);
    Member m4 = buildMember(4L);

    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(playersSelectionRepository.countByMatchAndTeam(match, teamA)).thenReturn(4L);
    when(memberRepository.findById(1L)).thenReturn(Optional.of(m1));
    when(memberRepository.findById(2L)).thenReturn(Optional.of(m2));
    when(memberRepository.findById(3L)).thenReturn(Optional.of(m3));
    when(memberRepository.findById(4L)).thenReturn(Optional.of(m4));
    when(teamCompositionRepository.existsByMemberAndTeamId(any(), any())).thenReturn(true);
    when(unavailabilityRepository.existsByMemberAndStartDateBeforeAndEndDateAfter(any(), any(),
        any())).thenReturn(false);
    when(playersSelectionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

    matchSelectionService.modifySelection(1L, teamA, ids);

    verify(playersSelectionRepository).deleteByMatchAndTeam(match, teamA);
    verify(playersSelectionRepository, times(4)).save(any());
  }

  @Test
  void modifySelectionShouldThrowWhenNoExistingSelection() {
    when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
    when(playersSelectionRepository.countByMatchAndTeam(match, teamA)).thenReturn(0L);

    assertThrows(IllegalStateException.class,
        () -> matchSelectionService.modifySelection(1L, teamA, List.of(1L, 2L, 3L, 4L)));

    verify(playersSelectionRepository, never()).deleteByMatchAndTeam(any(), any());
  }

  // invalidateSelectionsOnLeave
  @Test
  void invalidateSelectionsOnLeaveShouldDeleteScheduledSelections() {
    Member member = buildMember(1L);

    matchSelectionService.invalidateSelectionsOnLeave(member);

    verify(playersSelectionRepository).deleteByMemberAndMatchState(member, MatchState.SCHEDULED);
  }

  // Helper
  private Member buildMember(Long id) {
    Member m = new Member();
    m.setId(id);
    m.setTag("Player" + id);
    return m;
  }
}
