package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.models.entities.TeamCompositionId;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team manager service test.
 */
@ExtendWith(MockitoExtension.class)
class TeamManagerServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  private TeamManagerService teamManagerService;

  private Member responsible;
  private Member newSecondary;
  private Team team;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    responsible = new Member();
    responsible.setId(1L);

    newSecondary = new Member();
    newSecondary.setId(2L);

    team = new Team();
    team.setId(10L);
    team.setResponsible(responsible);
    team.setSecondResponsible(null);
  }

  /**
   * Assign secondary manager should work when responsible and member in team.
   */
  @Test
  void assignSecondaryManager_shouldWork_whenResponsibleAndMemberInTeam() {
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(memberRepository.findById(2L)).thenReturn(Optional.of(newSecondary));
    TeamCompositionId compositionId = new TeamCompositionId(2L, 10L);
    TeamComposition composition = new TeamComposition();
    composition.setId(compositionId);
    when(teamCompositionRepository.findByMemberId(2L)).thenReturn(Optional.of(composition));

    teamManagerService.assignSecondaryManager(10L, 2L, 1L);

    verify(teamRepository, times(1)).save(any(Team.class));
  }

  /**
   * Assign secondary manager should fail when team not found.
   */
  @Test
  void assignSecondaryManager_shouldFail_whenTeamNotFound() {
    when(teamRepository.findById(10L)).thenReturn(Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> teamManagerService.assignSecondaryManager(10L, 2L, 1L));

    verify(teamRepository, never()).save(any());
  }

  /**
   * Assign secondary manager should fail when not responsible.
   */
  @Test
  void assignSecondaryManager_shouldFail_whenNotResponsible() {
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));

    assertThrows(ResponseStatusException.class,
        () -> teamManagerService.assignSecondaryManager(10L, 2L, 99L));

    verify(teamRepository, never()).save(any());
  }

  /**
   * Assign secondary manager should fail when member not found.
   */
  @Test
  void assignSecondaryManager_shouldFail_whenMemberNotFound() {
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(memberRepository.findById(2L)).thenReturn(Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> teamManagerService.assignSecondaryManager(10L, 2L, 1L));

    verify(teamRepository, never()).save(any());
  }

  /**
   * Assign secondary manager should fail when member not in team.
   */
  @Test
  void assignSecondaryManager_shouldFail_whenMemberNotInTeam() {
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(memberRepository.findById(2L)).thenReturn(Optional.of(newSecondary));
    when(teamCompositionRepository.findByMemberId(2L)).thenReturn(Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> teamManagerService.assignSecondaryManager(10L, 2L, 1L));

    verify(teamRepository, never()).save(any());
  }

  /**
   * Assign secondary manager should fail when member is already responsible.
   */
  @Test
  void assignSecondaryManager_shouldFail_whenMemberIsAlreadyResponsible() {
    when(teamRepository.findById(10L)).thenReturn(Optional.of(team));
    when(memberRepository.findById(1L)).thenReturn(Optional.of(responsible));
    TeamCompositionId compositionId = new TeamCompositionId(1L, 10L);
    TeamComposition composition = new TeamComposition();
    composition.setId(compositionId);
    when(teamCompositionRepository.findByMemberId(1L)).thenReturn(Optional.of(composition));

    assertThrows(ResponseStatusException.class,
        () -> teamManagerService.assignSecondaryManager(10L, 1L, 1L));

    verify(teamRepository, never()).save(any());
  }
}