package be.vinci.ipl.cae.api.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.api.models.dtos.CreateTeamRequest;
import be.vinci.ipl.cae.api.models.entities.Image;
import be.vinci.ipl.cae.api.models.entities.Member;
import be.vinci.ipl.cae.api.models.entities.MembershipRequest;
import be.vinci.ipl.cae.api.models.entities.Notification;
import be.vinci.ipl.cae.api.models.entities.Team;
import be.vinci.ipl.cae.api.models.entities.TeamComposition;
import be.vinci.ipl.cae.api.repositories.MemberRepository;
import be.vinci.ipl.cae.api.repositories.MembershipRequestRepository;
import be.vinci.ipl.cae.api.repositories.TeamCompositionRepository;
import be.vinci.ipl.cae.api.repositories.TeamRepository;
import be.vinci.ipl.cae.api.services.TeamService;
import java.time.LocalDateTime;
import java.util.Optional;
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
  private NotificationService notificationService;

  @Mock
  private MemberRepository memberRepository;

  @Mock
  private MembershipRequestRepository membershipRequestRepository;

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

    Image image = new Image();
    image.setId(1L);

    member.setImage(image);

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
  void createTeam_shouldFail_whenMemberAlreadyInTeam() {
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

  @Test
  void createRequest_shouldWork_whenMemberAndTeamExist() {
    Team team = new Team("TeamTest", true, LocalDateTime.now(), member, null);
    team.setId(1L);
    MembershipRequest membershipRequest = new MembershipRequest(
        MembershipRequest.State.PENDING, null, null);

    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
    when(membershipRequestRepository.save(any(MembershipRequest.class)))
        .thenReturn(membershipRequest);

    MembershipRequest result = teamService.createRequest(member.getId(), team.getId());

    assertNotNull(result);
    assertEquals(membershipRequest, result);
    verify(notificationService).send(anyLong(), any(Notification.class));
  }

  @Test
  void createRequest_shouldReturnNull_whenMemberNotFound() {
    when(memberRepository.findById(999L)).thenReturn(Optional.empty());

    MembershipRequest result = teamService.createRequest(999L, 1L);

    assertNull(result);
    verify(membershipRequestRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any(Notification.class));
  }

  @Test
  void createRequest_shouldReturnNull_whenTeamNotFound() {
    when(memberRepository.findById(member.getId())).thenReturn(Optional.of(member));
    when(teamRepository.findById(999L)).thenReturn(Optional.empty());

    MembershipRequest result = teamService.createRequest(member.getId(), 999L);

    assertNull(result);
    verify(membershipRequestRepository, never()).save(any());
    verify(notificationService, never()).send(anyLong(), any(Notification.class));
  }

  /**
   * Get members of my team should return list when member has a team.
   */
  @Test
  void getMembersOfMyTeam_shouldReturnMembers_whenMemberHasTeam() {

    Team team = new Team();
    team.setId(10L);

    TeamComposition composition = new TeamComposition();
    composition.setTeam(team);
    composition.setMember(member);

    when(teamCompositionRepository.findByMemberId(1L))
        .thenReturn(java.util.Optional.of(composition));

    Member member2 = new Member();
    member2.setId(2L);
    member2.setTag("Player2");

    Image image2 = new Image();
    image2.setId(2L);

    member2.setImage(image2);

    TeamComposition composition2 = new TeamComposition();
    composition2.setTeam(team);
    composition2.setMember(member2);

    when(teamCompositionRepository.findAllByTeamId(10L))
        .thenReturn(java.util.List.of(composition, composition2));

    var result = teamService.getMembersOfMyTeam(1L);

    assertNotNull(result);
    assertEquals(2, result.size());

    verify(teamCompositionRepository, times(1)).findByMemberId(1L);
    verify(teamCompositionRepository, times(1)).findAllByTeamId(10L);
  }

  /**
   * Get members of my team should fail when member has no team.
   */
  @Test
  void getMembersOfMyTeam_shouldFail_whenMemberHasNoTeam() {

    when(teamCompositionRepository.findByMemberId(1L))
        .thenReturn(java.util.Optional.empty());

    assertThrows(ResponseStatusException.class,
        () -> teamService.getMembersOfMyTeam(1L));

    verify(teamCompositionRepository, times(1)).findByMemberId(1L);
    verify(teamCompositionRepository, never()).findAllByTeamId(any());
  }
}

