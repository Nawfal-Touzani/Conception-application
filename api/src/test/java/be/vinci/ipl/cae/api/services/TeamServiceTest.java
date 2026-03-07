package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

/**
 * The type Team service test.
 */
@ExtendWith(MockitoExtension.class)
class TeamServiceTest {

  @Mock
  private TeamRepository teamRepository;

  @Mock
  private TeamCompositionRepository teamCompositionRepository;

  @Mock
  private MemberRepository memberRepository;

  @InjectMocks
  private TeamService teamService;

  private Member member;
  private CreateTeamRequest request;

  /**
   * Sets up.
   */
  @BeforeEach
  void setUp() {
    member = new Member();
    member.setId(1L);
    member.setEmail("test@vinci.be");

    request = new CreateTeamRequest("TestTeam");
  }

  /**
   * Create team should work when member has no team and name is unique.
   */
  @Test
  void createTeam_shouldWork_whenMemberHasNoTeamAndNameIsUnique() {
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.of(member));
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(false);
    when(teamRepository.existsByName("TestTeam")).thenReturn(false);

    Team savedTeam = new Team();
    savedTeam.setId(10L);
    savedTeam.setName("TestTeam");
    when(teamRepository.save(any(Team.class))).thenReturn(savedTeam);

    Team result = teamService.createTeam(1L, request);

    assertNotNull(result);
    assertEquals("TestTeam", result.getName());
    verify(teamRepository, times(1)).save(any(Team.class));
    verify(teamCompositionRepository, times(1)).save(any(TeamComposition.class));
  }

  /**
   * Create team should fail when member already in a team.
   */
  @Test
  void createTeam_shouldFail_whenMemberAlreadyInATeam() {
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(true);

    assertThrows(ResponseStatusException.class, () -> teamService.createTeam(1L, request));

    verify(teamRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Create team should fail when team name already exists.
   */
  @Test
  void createTeam_shouldFail_whenTeamNameAlreadyExists() {
    when(teamCompositionRepository.existsByMemberId(1L)).thenReturn(false);
    when(teamRepository.existsByName("TestTeam")).thenReturn(true);

    assertThrows(ResponseStatusException.class, () -> teamService.createTeam(1L, request));

    verify(teamRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Create team should fail when member not found.
   */
  @Test
  void createTeam_shouldFail_whenMemberNotFound() {
    when(memberRepository.findById(1L)).thenReturn(java.util.Optional.empty());

    assertThrows(ResponseStatusException.class, () -> teamService.createTeam(1L, request));

    verify(teamRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }

  /**
   * Create team should fail when request is invalid.
   */
  @Test
  void createTeam_shouldFail_whenRequestIsInvalid() {
    CreateTeamRequest invalidRequest = new CreateTeamRequest("");

    assertThrows(ResponseStatusException.class, () -> teamService.createTeam(1L, invalidRequest));

    verify(teamRepository, never()).save(any());
    verify(teamCompositionRepository, never()).save(any());
  }
}